import { db } from './db';
import { answerMeetingQuestion } from './groq';
import { RAGAnswer, RAGSource } from './types';

/**
 * Split raw transcript into chunks of ~400 characters with 100 character overlap
 */
export function chunkTranscript(transcript: string, chunkSize = 400, overlap = 100): string[] {
  if (!transcript || transcript.trim().length === 0) return [];
  const text = transcript.trim();
  const chunks: string[] = [];

  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end < text.length) {
      // Find nearest punctuation or newline to break naturally
      const breakIdx = text.lastIndexOf('\n', end);
      if (breakIdx > start + 100) {
        end = breakIdx;
      } else {
        const periodIdx = text.lastIndexOf('. ', end);
        if (periodIdx > start + 100) {
          end = periodIdx + 1;
        }
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
    start = end - overlap;
    if (start >= text.length || start < 0) break;
  }
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Calculate similarity score between query and target text
 * Implements weighted hybrid token overlap + phrase matching
 */
function scoreRelevance(query: string, text: string): number {
  const qTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const target = text.toLowerCase();

  if (qTokens.length === 0) return 0;

  let score = 0;

  // Exact whole phrase match bonus
  if (target.includes(query.toLowerCase())) {
    score += 5.0;
  }

  // Token matches
  for (const token of qTokens) {
    if (target.includes(token)) {
      score += 1.5;
    }
  }

  // Bonus for domain keywords
  const specialKeywords = ['overdue', 'pending', 'completed', 'commit', 'decision', 'bug', 'issue', 'repeated', 'deadline'];
  for (const kw of specialKeywords) {
    if (query.toLowerCase().includes(kw) && target.includes(kw)) {
      score += 2.0;
    }
  }

  return score;
}

/**
 * Perform RAG Retrieval and answer question across all meetings of the user
 */
export async function answerQuestionWithRAG(userId: string, question: string): Promise<RAGAnswer> {
  const meetings = db.getMeetings(userId);
  const commitments = db.getCommitments(userId);
  const decisions = db.getDecisions(userId);
  const issues = db.getUnresolvedIssues(userId);
  const chunks = db.getTranscriptChunks(userId);

  interface ScoredItem {
    score: number;
    meetingId: string;
    meetingTitle: string;
    meetingDate: string;
    type: 'transcript' | 'commitment' | 'decision' | 'actionItem' | 'issue';
    text: string;
  }

function ensureStringDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return val;
  try {
    return new Date(val).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

  const candidates: ScoredItem[] = [];

  // Score commitments
  for (const c of commitments) {
    const text = `Commitment by ${c.person}: "${c.description}". Status: ${c.status}. Deadline: ${c.deadline || 'None'}. Origin Meeting: ${c.meetingTitle}. Last Mentioned: ${c.lastMentionedMeetingTitle || c.meetingTitle}.`;
    const score = scoreRelevance(question, `${c.person} ${c.description} ${c.status} ${c.meetingTitle}`);
    if (score > 0.5) {
      candidates.push({
        score: score + 1.0, // High priority for structured commitments
        meetingId: c.meetingId,
        meetingTitle: c.meetingTitle || 'Meeting',
        meetingDate: ensureStringDate(c.meetingDate || c.createdAt),
        type: 'commitment',
        text,
      });
    }
  }

  // Score decisions
  for (const d of decisions) {
    const text = `Decision: "${d.description}". Decided in: ${d.meetingTitle}.`;
    const score = scoreRelevance(question, `${d.description} ${d.meetingTitle}`);
    if (score > 0.5) {
      candidates.push({
        score,
        meetingId: d.meetingId,
        meetingTitle: d.meetingTitle || 'Meeting',
        meetingDate: ensureStringDate(d.createdAt),
        type: 'decision',
        text,
      });
    }
  }

  // Score unresolved issues
  for (const i of issues) {
    const text = `Unresolved Issue: "${i.description}". Status: ${i.status}. Times Repeated Across Meetings: ${i.timesRepeated}.`;
    const score = scoreRelevance(question, `${i.description} ${i.status} bug issue repeated`);
    if (score > 0.5) {
      candidates.push({
        score: score + 1.5,
        meetingId: i.meetingId,
        meetingTitle: i.meetingTitle || 'Meeting',
        meetingDate: ensureStringDate(i.createdAt),
        type: 'issue',
        text,
      });
    }
  }

  // Score transcript chunks
  for (const ch of chunks) {
    const score = scoreRelevance(question, ch.chunkText);
    if (score > 1.0) {
      candidates.push({
        score,
        meetingId: ch.meetingId,
        meetingTitle: ch.meetingTitle || 'Meeting',
        meetingDate: ensureStringDate(ch.createdAt),
        type: 'transcript',
        text: ch.chunkText,
      });
    }
  }

  // Sort candidates by relevance score
  candidates.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, 7);

  // If question is asking about general status (e.g. "what is overdue", "list all commitments") and no direct scores, include active commitments
  if (topCandidates.length === 0) {
    const isGeneralCommitmentQuery = /commitment|overdue|pending|task|status/i.test(question);
    if (isGeneralCommitmentQuery && commitments.length > 0) {
      for (const c of commitments.slice(0, 5)) {
        topCandidates.push({
          score: 1.0,
          meetingId: c.meetingId,
          meetingTitle: c.meetingTitle || 'Meeting',
          meetingDate: c.meetingDate || c.createdAt,
          type: 'commitment',
          text: `Commitment by ${c.person}: "${c.description}". Status: ${c.status}. Deadline: ${c.deadline || 'None'}. Origin: ${c.meetingTitle}.`,
        });
      }
    }
  }

  // Generate answer with Groq LLM
  const contextForLLM = topCandidates.map((c) => ({
    meetingTitle: c.meetingTitle,
    meetingDate: c.meetingDate,
    type: c.type,
    text: c.text,
  }));

  const { answer, confidence } = await answerMeetingQuestion(question, contextForLLM);

  // Format sources for the response
  const sources: RAGSource[] = topCandidates.map((c) => ({
    meetingId: c.meetingId,
    meetingTitle: c.meetingTitle,
    meetingDate: c.meetingDate,
    snippet: c.text.length > 150 ? c.text.slice(0, 150) + '...' : c.text,
    itemType: c.type,
  }));

  return {
    answer,
    sources,
    confidence,
  };
}
