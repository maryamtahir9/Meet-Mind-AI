import express, { Request, Response } from 'express';
import { db } from './db';
import {
  transcribeAudio,
  extractMeetingIntelligence,
} from './groq';
import { runCrossMeetingAccountabilityEngine } from './crossMeetingAnalysis';
import { chunkTranscript, answerQuestionWithRAG } from './rag';
import { ItemStatus } from './types';

export const apiRouter = express.Router();

// Helper to extract or fallback to active user
function getAuthenticatedUserId(req: Request): string {
  // If user passed header or query, use it; otherwise fallback to default user Maryam
  const authHeader = req.headers['x-user-id'] as string;
  if (authHeader && db.getUser(authHeader)) {
    return authHeader;
  }
  // Default demo user
  return 'usr_demo_maryam';
}

// -------------------------------------------------------------
// System & Auth Endpoints
// -------------------------------------------------------------

apiRouter.get('/system/status', (req: Request, res: Response) => {
  const dbStatus = db.getStatus();
  res.json({
    ...dbStatus,
    groqConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    user = db.createUser(email, name || email.split('@')[0]);
  }

  res.json({
    user,
    token: `token_${user.id}`,
  });
});

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  let user = db.getUserByEmail(email);
  if (user) {
    return res.json({ user, token: `token_${user.id}` });
  }

  user = db.createUser(email, name);
  res.status(201).json({
    user,
    token: `token_${user.id}`,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

apiRouter.post('/seed/reset', (req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to canonical Sprint 42 3-meeting showcase.' });
});

// -------------------------------------------------------------
// Meetings Endpoints
// -------------------------------------------------------------

apiRouter.get('/meetings', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const meetings = db.getMeetings(userId);
  res.json({ meetings });
});

apiRouter.get('/meetings/:id', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const meeting = db.getMeetingById(req.params.id, userId);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }
  res.json({ meeting });
});

apiRouter.delete('/meetings/:id', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const success = db.deleteMeeting(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Meeting not found or unauthorized' });
  }
  res.json({ success: true });
});

/**
 * Main Pipeline: Transcribe -> Extract -> Save -> Cross-Meeting Compare -> Update Memory
 */
apiRouter.post('/meetings/process', async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    let { title, meetingDate, transcriptText, audioBase64, audioMimeType, audioFilename } = req.body;

    if (!title) {
      title = `Meeting on ${new Date().toLocaleDateString()}`;
    }
    if (!meetingDate) {
      meetingDate = new Date().toISOString();
    }

    // Step 1: Transcribe audio if provided
    let finalTranscript = transcriptText || '';
    let usedAudio = false;

    if (audioBase64 && !finalTranscript.trim()) {
      try {
        const buffer = Buffer.from(audioBase64, 'base64');
        finalTranscript = await transcribeAudio(buffer, audioMimeType || 'audio/mp3', audioFilename || 'audio.mp3');
        usedAudio = true;
      } catch (err: any) {
        console.error('[Process] Audio transcription failed:', err);
        return res.status(500).json({ error: `Audio transcription error: ${err.message}` });
      }
    }

    if (!finalTranscript.trim()) {
      return res.status(400).json({ error: 'Either transcriptText or audio recording is required.' });
    }

    // Step 2: Extract structured meeting intelligence with Groq
    const extracted = await extractMeetingIntelligence(finalTranscript, title, meetingDate);

    // Step 3: Save meeting record to database
    const meeting = db.createMeeting(userId, title, meetingDate, finalTranscript, extracted.summary);

    // Step 4: Save transcript chunks for vector / RAG search
    const chunks = chunkTranscript(finalTranscript);
    chunks.forEach((ch, idx) => {
      db.createTranscriptChunk(meeting.id, meeting.title, idx, ch);
    });

    // Step 5: Save newly extracted decisions
    for (const dec of extracted.decisions) {
      if (dec.description && dec.description.trim()) {
        db.createDecision(meeting.id, meeting.title, dec.description.trim());
      }
    }

    // Step 6: Save newly extracted commitments
    for (const com of extracted.commitments) {
      if (com.description && com.description.trim()) {
        db.createCommitment(
          meeting.id,
          meeting.title,
          meeting.meetingDate,
          com.person || 'Team Member',
          com.description.trim(),
          com.deadline || null,
          'PENDING'
        );
      }
    }

    // Step 7: Save newly extracted action items
    for (const act of extracted.actionItems) {
      if (act.description && act.description.trim()) {
        db.createActionItem(
          meeting.id,
          meeting.title,
          act.person || 'Team Member',
          act.description.trim(),
          act.deadline || null,
          'PENDING'
        );
      }
    }

    // Step 8: Save newly extracted unresolved issues
    for (const iss of extracted.unresolvedIssues) {
      if (iss.description && iss.description.trim()) {
        db.createUnresolvedIssue(meeting.id, meeting.title, iss.description.trim(), 1, 'PENDING', [meeting.id]);
      }
    }

    // Step 9: Run Cross-Meeting Accountability Engine
    // Connects dots between previous meetings and this new meeting!
    const crossMeetingResult = await runCrossMeetingAccountabilityEngine(
      userId,
      meeting.id,
      meeting.title,
      meeting.meetingDate,
      finalTranscript,
      extracted
    );

    // Fetch refreshed complete meeting record
    const completeMeeting = db.getMeetingById(meeting.id, userId);

    res.status(201).json({
      meeting: completeMeeting,
      extracted,
      crossMeetingResult,
      transcribedFromAudio: usedAudio,
    });
  } catch (err: any) {
    console.error('[Process] Encountered fatal error:', err);
    res.status(500).json({ error: `Meeting processing failed: ${err.message || 'Unknown error'}` });
  }
});

// -------------------------------------------------------------
// Accountability & Analytics Endpoints
// -------------------------------------------------------------

apiRouter.get('/accountability', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const { status, person, meetingId, search } = req.query as {
    status?: string;
    person?: string;
    meetingId?: string;
    search?: string;
  };

  let commitments = db.getCommitments(userId);

  if (status && status !== 'ALL') {
    commitments = commitments.filter((c) => c.status === status);
  }

  if (person && person !== 'ALL') {
    commitments = commitments.filter((c) => c.person.toLowerCase() === person.toLowerCase());
  }

  if (meetingId && meetingId !== 'ALL') {
    commitments = commitments.filter((c) => c.meetingId === meetingId || c.lastMentionedMeetingId === meetingId);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    commitments = commitments.filter(
      (c) =>
        c.description.toLowerCase().includes(q) ||
        c.person.toLowerCase().includes(q) ||
        (c.meetingTitle && c.meetingTitle.toLowerCase().includes(q))
    );
  }

  // Summary counts
  const allCommitments = db.getCommitments(userId);
  const stats = {
    total: allCommitments.length,
    pending: allCommitments.filter((c) => c.status === 'PENDING').length,
    completed: allCommitments.filter((c) => c.status === 'COMPLETED').length,
    overdue: allCommitments.filter((c) => c.status === 'OVERDUE').length,
    repeated: allCommitments.filter((c) => c.status === 'REPEATED_UNRESOLVED').length,
  };

  // Get distinct list of people
  const people = Array.from(new Set(allCommitments.map((c) => c.person))).sort();

  res.json({
    commitments,
    stats,
    people,
  });
});

apiRouter.get('/accountability/insights', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const meetings = db.getMeetings(userId);
  const commitments = db.getCommitments(userId);
  const issues = db.getUnresolvedIssues(userId);

  const pending = commitments.filter((c) => c.status === 'PENDING');
  const completed = commitments.filter((c) => c.status === 'COMPLETED');
  const overdue = commitments.filter((c) => c.status === 'OVERDUE');
  const repeatedIssues = issues.filter((i) => i.timesRepeated > 1 || i.status === 'REPEATED_UNRESOLVED');

  let keyInsight = 'No active commitments found.';
  if (overdue.length > 0 && repeatedIssues.length > 0) {
    const maxRepeated = Math.max(...repeatedIssues.map((r) => r.timesRepeated), 0);
    keyInsight = `${overdue.length} commitment${overdue.length > 1 ? 's are' : ' is'} currently overdue, and 1 recurring blocker has appeared across ${maxRepeated} consecutive meetings.`;
  } else if (overdue.length > 0) {
    keyInsight = `${overdue.length} commitment${overdue.length > 1 ? 's require' : ' requires'} immediate escalation due to passed deadlines.`;
  } else if (completed.length > 0) {
    keyInsight = `All tracked commitments are on schedule or completed across ${meetings.length} meetings. Excellent velocity!`;
  }

  res.json({
    totalMeetings: meetings.length,
    activeCommitments: pending.length + overdue.length,
    completedCommitments: completed.length,
    overdueCommitments: overdue.length,
    repeatedIssuesCount: repeatedIssues.length,
    keyInsight,
    urgentItems: [...overdue.slice(0, 3)],
    topRepeatedIssues: repeatedIssues.slice(0, 3),
  });
});

// -------------------------------------------------------------
// RAG Chat Endpoint
// -------------------------------------------------------------

apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ragResult = await answerQuestionWithRAG(userId, question.trim());
    res.json(ragResult);
  } catch (err: any) {
    console.error('[Chat] RAG processing error:', err);
    res.status(500).json({ error: `RAG processing failed: ${err.message || 'Unknown error'}` });
  }
});

// -------------------------------------------------------------
// Reports Endpoint
// -------------------------------------------------------------

apiRouter.get('/reports', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const type = (req.query.type as string) || 'full';

  const meetings = db.getMeetings(userId);
  const commitments = db.getCommitments(userId);
  const decisions = db.getDecisions(userId);
  const issues = db.getUnresolvedIssues(userId);

  let filteredCommitments = commitments;
  let title = 'Complete Cross-Meeting Accountability Report';
  let subtitle = 'Comprehensive audit trail of team commitments, decisions, and recurring issues across all meetings.';

  if (type === 'overdue') {
    filteredCommitments = commitments.filter((c) => c.status === 'OVERDUE');
    title = 'Overdue Commitments & Missed Deadlines Report';
    subtitle = 'Urgent review of promises exceeding target delivery dates without reported completion.';
  } else if (type === 'pending') {
    filteredCommitments = commitments.filter((c) => c.status === 'PENDING');
    title = 'Active & Pending Commitments Pipeline Report';
    subtitle = 'Current active responsibilities scheduled across future sprints.';
  } else if (type === 'repeated') {
    title = 'Recurring Unresolved Blockers & Friction Report';
    subtitle = 'Detailed analysis of systemic issues mentioned across multiple consecutive meetings.';
  } else if (type === 'summary') {
    title = 'Executive Multi-Meeting Intelligence Summary';
    subtitle = 'High-level synthesis of major strategic decisions and milestone status.';
  }

  const generatedAt = new Date().toISOString();

  res.json({
    type,
    title,
    subtitle,
    generatedAt,
    meetingsCount: meetings.length,
    stats: {
      totalCommitments: commitments.length,
      pending: commitments.filter((c) => c.status === 'PENDING').length,
      completed: commitments.filter((c) => c.status === 'COMPLETED').length,
      overdue: commitments.filter((c) => c.status === 'OVERDUE').length,
      repeated: commitments.filter((c) => c.status === 'REPEATED_UNRESOLVED').length,
      totalDecisions: decisions.length,
      recurringIssuesCount: issues.filter((i) => i.timesRepeated > 1).length,
    },
    commitments: filteredCommitments,
    decisions,
    issues: issues.sort((a, b) => b.timesRepeated - a.timesRepeated),
    recentMeetings: meetings.slice(0, 5),
  });
});
