import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import {
  User,
  Meeting,
  Commitment,
  Decision,
  ActionItem,
  UnresolvedIssue,
  TranscriptChunk,
  ItemStatus,
  StatusHistoryEntry,
} from './types';

// Storage file location for local demo mode / fallback
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'meetmind_store.json');

interface DatabaseStore {
  users: User[];
  meetings: Meeting[];
  commitments: Commitment[];
  decisions: Decision[];
  actionItems: ActionItem[];
  unresolvedIssues: UnresolvedIssue[];
  transcriptChunks: TranscriptChunk[];
}

// Initial realistic demo seed representing the exact prompt scenario:
// Meeting 1: Sprint 42 Kickoff (Ali commits to API by Friday, login bug raised)
// Meeting 2: Mid-Sprint Sync (API delayed, login bug still unresolved)
// Meeting 3: Release Review (API completed, login bug raised 3rd time)
const initialSeedData: DatabaseStore = {
  users: [
    {
      id: 'usr_demo_maryam',
      email: 'maryam@meetmind.ai',
      name: 'Maryam Tahir',
      createdAt: '2026-09-01T09:00:00.000Z',
    },
  ],
  meetings: [
    {
      id: 'mtg_01',
      userId: 'usr_demo_maryam',
      title: 'Sprint 42 Planning & Architecture Kickoff',
      meetingDate: '2026-09-02T10:00:00.000Z',
      transcriptText: `Maryam: Good morning team. Let's align on our deliverables for Sprint 42. Ali, what is the status of the OAuth and core REST API endpoints?
Ali: I will complete the API by Friday. I'll make sure all user validation and rate limiting are properly structured.
Sarah: Great. On the frontend, I will build the accountability timeline UI by next Tuesday.
David: We also noticed an authentication bug where session tokens expire prematurely during login.
Ali: Yes, the auth bug is blocking some users intermittently.
Maryam: Okay, we decided to adopt JWT with rotating refresh tokens for the new auth flow. Let's make sure the API is prioritized.`,
      summary: 'Sprint 42 kickoff focusing on core REST API deliverables and authentication stability. Team agreed to migrate to JWT rotating refresh tokens. Ali committed to delivering the core API by Friday, while Sarah will complete the timeline UI. A recurring token expiration bug was flagged.',
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    },
    {
      id: 'mtg_02',
      userId: 'usr_demo_maryam',
      title: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
      meetingDate: '2026-09-05T14:30:00.000Z',
      transcriptText: `Maryam: Welcome everyone. Ali, how are we looking with the core API deliverable that was due Friday?
Ali: Unfortunately, the API is still not completed. We ran into database lock contention with Neon connection pooling. I am working through the connection retry logic today.
Maryam: Understood, but this is now pushing back integration tests. What about the login issue?
David: Users still cannot log in consistently. The authentication bug remains unresolved and customers are contacting support.
Sarah: I have finished 80% of the timeline UI and will have the PR up by tomorrow.
Ali: I will prioritize the Neon connection pool bugfix and aim to wrap the API by Sunday evening.`,
      summary: 'Mid-sprint checkpoint addressing delays. Ali reported that the core API is not completed due to Neon connection pooling contention, shifting it to overdue. The login authentication bug remains unresolved and active. Sarah made solid progress on the timeline UI.',
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: '2026-09-05T15:30:00.000Z',
      updatedAt: '2026-09-05T15:30:00.000Z',
    },
    {
      id: 'mtg_03',
      userId: 'usr_demo_maryam',
      title: 'Sprint 42 Review & Production Deployment',
      meetingDate: '2026-09-08T16:00:00.000Z',
      transcriptText: `Maryam: Let's review our sprint wrap-up. Ali, what is the final state of the core API?
Ali: I am happy to report that the API is now fully completed, tested, and deployed to staging. Neon pooling issues are resolved.
Maryam: That is fantastic news! Ali's API commitment is officially completed.
David: What about the customer login failures?
David: The login issue remains unresolved. Users are still experiencing premature token logouts after 15 minutes. This is the third meeting in a row we have discussed this.
Ali: I will personally take over the session token timeout investigation tomorrow morning.
Maryam: We decided to deploy the staging release to production tomorrow at 10 AM, with emergency monitoring on the auth service.`,
      summary: 'Final Sprint 42 review. Ali successfully completed and deployed the core API after resolving database pooling issues. However, the customer login authentication bug remains unresolved for the third consecutive meeting and was escalated. Deployment scheduled for tomorrow 10 AM.',
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: '2026-09-08T17:00:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
  ],
  commitments: [
    {
      id: 'com_01',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      meetingDate: '2026-09-02T10:00:00.000Z',
      person: 'Ali',
      description: 'Complete the REST and OAuth API endpoints with user validation and rate limiting',
      deadline: '2026-09-05T23:59:59.000Z',
      status: 'COMPLETED',
      lastMentionedMeetingId: 'mtg_03',
      lastMentionedMeetingTitle: 'Sprint 42 Review & Production Deployment',
      confidence: 0.98,
      statusHistory: [
        {
          meetingId: 'mtg_01',
          meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
          meetingDate: '2026-09-02T10:00:00.000Z',
          previousStatus: 'PENDING',
          newStatus: 'PENDING',
          reason: 'Initial commitment created during sprint kickoff.',
          confidence: 1.0,
          timestamp: '2026-09-02T11:00:00.000Z',
        },
        {
          meetingId: 'mtg_02',
          meetingTitle: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
          meetingDate: '2026-09-05T14:30:00.000Z',
          previousStatus: 'PENDING',
          newStatus: 'OVERDUE',
          reason: 'Ali stated: "The API is still not completed" due to Neon connection pooling contention.',
          confidence: 0.95,
          timestamp: '2026-09-05T15:30:00.000Z',
        },
        {
          meetingId: 'mtg_03',
          meetingTitle: 'Sprint 42 Review & Production Deployment',
          meetingDate: '2026-09-08T16:00:00.000Z',
          previousStatus: 'OVERDUE',
          newStatus: 'COMPLETED',
          reason: 'Ali confirmed: "The API is now fully completed, tested, and deployed to staging."',
          confidence: 0.99,
          timestamp: '2026-09-08T17:00:00.000Z',
        },
      ],
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
    {
      id: 'com_02',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      meetingDate: '2026-09-02T10:00:00.000Z',
      person: 'Sarah',
      description: 'Build the accountability timeline UI and submit pull request',
      deadline: '2026-09-09T18:00:00.000Z',
      status: 'PENDING',
      lastMentionedMeetingId: 'mtg_02',
      lastMentionedMeetingTitle: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
      confidence: 0.92,
      statusHistory: [
        {
          meetingId: 'mtg_01',
          meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
          meetingDate: '2026-09-02T10:00:00.000Z',
          previousStatus: 'PENDING',
          newStatus: 'PENDING',
          reason: 'Commitment initiated for next Tuesday.',
          confidence: 1.0,
          timestamp: '2026-09-02T11:00:00.000Z',
        },
        {
          meetingId: 'mtg_02',
          meetingTitle: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
          meetingDate: '2026-09-05T14:30:00.000Z',
          previousStatus: 'PENDING',
          newStatus: 'PENDING',
          reason: 'Sarah reported 80% progress; still pending ahead of target deadline.',
          confidence: 0.94,
          timestamp: '2026-09-05T15:30:00.000Z',
        },
      ],
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-09-05T15:30:00.000Z',
    },
    {
      id: 'com_03',
      meetingId: 'mtg_03',
      meetingTitle: 'Sprint 42 Review & Production Deployment',
      meetingDate: '2026-09-08T16:00:00.000Z',
      person: 'Ali',
      description: 'Investigate and resolve session token timeout bug in auth service',
      deadline: '2026-09-10T12:00:00.000Z',
      status: 'PENDING',
      lastMentionedMeetingId: 'mtg_03',
      lastMentionedMeetingTitle: 'Sprint 42 Review & Production Deployment',
      confidence: 0.95,
      statusHistory: [
        {
          meetingId: 'mtg_03',
          meetingTitle: 'Sprint 42 Review & Production Deployment',
          meetingDate: '2026-09-08T16:00:00.000Z',
          previousStatus: 'PENDING',
          newStatus: 'PENDING',
          reason: 'New commitment made following recurring login bug escalation.',
          confidence: 1.0,
          timestamp: '2026-09-08T17:00:00.000Z',
        },
      ],
      createdAt: '2026-09-08T17:00:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
  ],
  decisions: [
    {
      id: 'dec_01',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      description: 'Adopt JWT with rotating refresh tokens for user authentication flow.',
      createdAt: '2026-09-02T11:00:00.000Z',
    },
    {
      id: 'dec_02',
      meetingId: 'mtg_03',
      meetingTitle: 'Sprint 42 Review & Production Deployment',
      description: 'Deploy staging build to production at 10 AM tomorrow with active auth telemetry.',
      createdAt: '2026-09-08T17:00:00.000Z',
    },
  ],
  actionItems: [
    {
      id: 'act_01',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      person: 'Ali',
      description: 'Set up rate limiting and validation middleware on core endpoints',
      deadline: '2026-09-05T18:00:00.000Z',
      status: 'COMPLETED',
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
    {
      id: 'act_02',
      meetingId: 'mtg_02',
      meetingTitle: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
      person: 'Ali',
      description: 'Adjust Neon PostgreSQL connection pooling retry thresholds',
      deadline: '2026-09-06T18:00:00.000Z',
      status: 'COMPLETED',
      createdAt: '2026-09-05T15:30:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
    {
      id: 'act_03',
      meetingId: 'mtg_03',
      meetingTitle: 'Sprint 42 Review & Production Deployment',
      person: 'David',
      description: 'Set up synthetic health checks for premature logout detection',
      deadline: '2026-09-11T17:00:00.000Z',
      status: 'PENDING',
      createdAt: '2026-09-08T17:00:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
  ],
  unresolvedIssues: [
    {
      id: 'iss_01',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      description: 'Authentication token premature expiration causing intermittent customer login failures',
      timesRepeated: 3,
      status: 'REPEATED_UNRESOLVED',
      relatedMeetingIds: ['mtg_01', 'mtg_02', 'mtg_03'],
      createdAt: '2026-09-02T11:00:00.000Z',
      updatedAt: '2026-09-08T17:00:00.000Z',
    },
  ],
  transcriptChunks: [
    {
      id: 'chk_01',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      chunkIndex: 0,
      chunkText: 'Maryam: Good morning team. Let us align on deliverables for Sprint 42. Ali, what is the status of the OAuth and core REST API endpoints? Ali: I will complete the API by Friday.',
      createdAt: '2026-09-02T11:00:00.000Z',
    },
    {
      id: 'chk_02',
      meetingId: 'mtg_01',
      meetingTitle: 'Sprint 42 Planning & Architecture Kickoff',
      chunkIndex: 1,
      chunkText: 'David: We also noticed an authentication bug where session tokens expire prematurely during login. Ali: Yes, the auth bug is blocking some users intermittently.',
      createdAt: '2026-09-02T11:00:00.000Z',
    },
    {
      id: 'chk_03',
      meetingId: 'mtg_02',
      meetingTitle: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
      chunkIndex: 0,
      chunkText: 'Ali: Unfortunately, the API is still not completed. We ran into database lock contention with Neon connection pooling. David: Users still cannot log in consistently.',
      createdAt: '2026-09-05T15:30:00.000Z',
    },
    {
      id: 'chk_04',
      meetingId: 'mtg_03',
      meetingTitle: 'Sprint 42 Review & Production Deployment',
      chunkIndex: 0,
      chunkText: 'Ali: I am happy to report that the API is now fully completed, tested, and deployed to staging. Neon pooling issues are resolved.',
      createdAt: '2026-09-08T17:00:00.000Z',
    },
    {
      id: 'chk_05',
      meetingId: 'mtg_03',
      meetingTitle: 'Sprint 42 Review & Production Deployment',
      chunkIndex: 1,
      chunkText: 'David: The login issue remains unresolved. Users are still experiencing premature token logouts after 15 minutes. This is the third meeting in a row we have discussed this.',
      createdAt: '2026-09-08T17:00:00.000Z',
    },
  ],
};

class DatabaseService {
  private store: DatabaseStore;
  private hasInitialized = false;
  private sqlClient: any = null;

  constructor() {
    this.store = this.loadStore();
    if (process.env.DATABASE_URL) {
      try {
        this.sqlClient = neon(process.env.DATABASE_URL);
        this.initNeonSync();
      } catch (err) {
        console.warn('[DB] Neon client initialization warning:', err);
      }
    }
  }

  private async initNeonSync() {
    if (!this.sqlClient) return;
    try {
      // 1. Create tables if they do not exist
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT,
          name TEXT,
          created_at TEXT
        );
      `;
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS meetings (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT,
          meeting_date TEXT,
          transcript_text TEXT,
          summary TEXT,
          created_at TEXT,
          updated_at TEXT
        );
      `;
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS commitments (
          id TEXT PRIMARY KEY,
          meeting_id TEXT,
          person TEXT,
          description TEXT,
          deadline TEXT,
          status TEXT,
          last_mentioned_meeting_id TEXT,
          confidence REAL,
          status_history JSONB,
          created_at TEXT,
          updated_at TEXT
        );
      `;
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS decisions (
          id TEXT PRIMARY KEY,
          meeting_id TEXT,
          description TEXT,
          created_at TEXT
        );
      `;
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS action_items (
          id TEXT PRIMARY KEY,
          meeting_id TEXT,
          person TEXT,
          description TEXT,
          deadline TEXT,
          status TEXT,
          created_at TEXT,
          updated_at TEXT
        );
      `;
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS unresolved_issues (
          id TEXT PRIMARY KEY,
          meeting_id TEXT,
          description TEXT,
          times_repeated INT,
          status TEXT,
          related_meeting_ids JSONB,
          created_at TEXT,
          updated_at TEXT
        );
      `;
      await this.sqlClient`
        CREATE TABLE IF NOT EXISTS transcript_chunks (
          id TEXT PRIMARY KEY,
          meeting_id TEXT,
          meeting_title TEXT,
          chunk_index INT,
          chunk_text TEXT,
          created_at TEXT
        );
      `;

      // 2. Check if database has records
      const existing = await this.sqlClient`SELECT count(*) as count FROM meetings`;
      const count = Number(existing[0]?.count || 0);

      if (count === 0) {
        console.log('[DB] Neon database connected and initialized. Seeding initial records...');
        await this.syncAllToNeon();
      } else {
        console.log(`[DB] Connected to Neon PostgreSQL (${count} meetings found). Hydrating memory store...`);
        await this.hydrateFromNeon();
      }
    } catch (err) {
      console.warn('[DB] Neon sync warning (will fallback to store):', err);
    }
  }

  private async hydrateFromNeon() {
    if (!this.sqlClient) return;
    try {
      const meetings = await this.sqlClient`SELECT * FROM meetings ORDER BY meeting_date DESC`;
      const commitments = await this.sqlClient`SELECT * FROM commitments`;
      const decisions = await this.sqlClient`SELECT * FROM decisions`;
      const actionItems = await this.sqlClient`SELECT * FROM action_items`;
      const issues = await this.sqlClient`SELECT * FROM unresolved_issues`;
      const users = await this.sqlClient`SELECT * FROM users`;

      if (meetings && meetings.length > 0) {
        this.store.meetings = meetings.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          title: m.title,
          meetingDate: m.meeting_date,
          transcriptText: m.transcript_text,
          summary: m.summary,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
        }));
      }

      if (commitments && commitments.length > 0) {
        this.store.commitments = commitments.map((c: any) => ({
          id: c.id,
          meetingId: c.meeting_id,
          meetingTitle: this.store.meetings.find(m => m.id === c.meeting_id)?.title || 'Meeting',
          meetingDate: this.store.meetings.find(m => m.id === c.meeting_id)?.meetingDate || new Date().toISOString(),
          person: c.person,
          description: c.description,
          deadline: c.deadline,
          status: c.status as ItemStatus,
          lastMentionedMeetingId: c.last_mentioned_meeting_id,
          lastMentionedMeetingTitle: this.store.meetings.find(m => m.id === c.last_mentioned_meeting_id)?.title,
          confidence: c.confidence || 0.9,
          statusHistory: typeof c.status_history === 'string' ? JSON.parse(c.status_history) : (c.status_history || []),
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }

      if (decisions && decisions.length > 0) {
        this.store.decisions = decisions.map((d: any) => ({
          id: d.id,
          meetingId: d.meeting_id,
          description: d.description,
          createdAt: d.created_at,
        }));
      }

      if (actionItems && actionItems.length > 0) {
        this.store.actionItems = actionItems.map((a: any) => ({
          id: a.id,
          meetingId: a.meeting_id,
          person: a.person,
          description: a.description,
          deadline: a.deadline,
          status: a.status as ItemStatus,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        }));
      }

      if (issues && issues.length > 0) {
        this.store.unresolvedIssues = issues.map((i: any) => ({
          id: i.id,
          meetingId: i.meeting_id,
          description: i.description,
          timesRepeated: i.times_repeated,
          status: i.status as ItemStatus,
          relatedMeetingIds: typeof i.related_meeting_ids === 'string' ? JSON.parse(i.related_meeting_ids) : (i.related_meeting_ids || []),
          createdAt: i.created_at,
          updatedAt: i.updated_at,
        }));
      }

      if (users && users.length > 0) {
        this.store.users = users.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: u.created_at,
        }));
      }

      this.saveStore(this.store);
      console.log(`[DB] Successfully hydrated ${this.store.meetings.length} meetings and ${this.store.commitments.length} commitments from Neon.`);
    } catch (err) {
      console.warn('[DB] Failed to hydrate from Neon:', err);
    }
  }

  private async syncAllToNeon() {
    if (!this.sqlClient) return;
    try {
      for (const u of this.store.users) {
        await this.sqlClient`
          INSERT INTO users (id, email, name, created_at)
          VALUES (${u.id}, ${u.email}, ${u.name}, ${u.createdAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      for (const m of this.store.meetings) {
        await this.sqlClient`
          INSERT INTO meetings (id, user_id, title, meeting_date, transcript_text, summary, created_at, updated_at)
          VALUES (${m.id}, ${m.userId}, ${m.title}, ${m.meetingDate}, ${m.transcriptText}, ${m.summary}, ${m.createdAt}, ${m.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      for (const c of this.store.commitments) {
        await this.sqlClient`
          INSERT INTO commitments (id, meeting_id, person, description, deadline, status, last_mentioned_meeting_id, confidence, status_history, created_at, updated_at)
          VALUES (${c.id}, ${c.meetingId}, ${c.person}, ${c.description}, ${c.deadline}, ${c.status}, ${c.lastMentionedMeetingId}, ${c.confidence}, ${JSON.stringify(c.statusHistory)}, ${c.createdAt}, ${c.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      for (const d of this.store.decisions) {
        await this.sqlClient`
          INSERT INTO decisions (id, meeting_id, description, created_at)
          VALUES (${d.id}, ${d.meetingId}, ${d.description}, ${d.createdAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      for (const a of this.store.actionItems) {
        await this.sqlClient`
          INSERT INTO action_items (id, meeting_id, person, description, deadline, status, created_at, updated_at)
          VALUES (${a.id}, ${a.meetingId}, ${a.person}, ${a.description}, ${a.deadline}, ${a.status}, ${a.createdAt}, ${a.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
      for (const i of this.store.unresolvedIssues) {
        await this.sqlClient`
          INSERT INTO unresolved_issues (id, meeting_id, description, times_repeated, status, related_meeting_ids, created_at, updated_at)
          VALUES (${i.id}, ${i.meetingId}, ${i.description}, ${i.timesRepeated}, ${i.status}, ${JSON.stringify(i.relatedMeetingIds)}, ${i.createdAt}, ${i.updatedAt})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    } catch (err) {
      console.warn('[DB] Error populating Neon:', err);
    }
  }

  private loadStore(): DatabaseStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[DB] Could not load persisted data file, using default seed:', err);
    }
    // Save initial seed to file
    this.saveStore(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }

  private saveStore(store: DatabaseStore) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist data file:', err);
    }
  }

  public resetToSeed(): DatabaseStore {
    this.store = JSON.parse(JSON.stringify(initialSeedData));
    this.saveStore(this.store);
    return this.store;
  }

  public getStatus() {
    const hasNeonConfig = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres'));
    return {
      connectedToNeon: hasNeonConfig,
      databaseUrlSet: Boolean(process.env.DATABASE_URL),
      storageType: hasNeonConfig ? 'Neon Serverless PostgreSQL' : 'Embedded Engine',
      totalUsers: this.store.users.length,
      totalMeetings: this.store.meetings.length,
      totalCommitments: this.store.commitments.length,
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    };
  }

  // User methods
  public getUser(userId: string): User | undefined {
    return this.store.users.find((u) => u.id === userId);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(email: string, name: string): User {
    const user: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email,
      name,
      createdAt: new Date().toISOString(),
    };
    this.store.users.push(user);
    this.saveStore(this.store);
    return user;
  }

  // Meeting methods
  public getMeetings(userId: string): Meeting[] {
    const meetings = this.store.meetings.filter((m) => m.userId === userId);
    // Attach nested objects
    return meetings
      .map((m) => ({
        ...m,
        commitments: this.store.commitments.filter((c) => c.meetingId === m.id),
        decisions: this.store.decisions.filter((d) => d.meetingId === m.id),
        actionItems: this.store.actionItems.filter((a) => a.meetingId === m.id),
        unresolvedIssues: this.store.unresolvedIssues.filter((u) => u.meetingId === m.id),
      }))
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }

  public getMeetingById(meetingId: string, userId: string): Meeting | undefined {
    const meeting = this.store.meetings.find((m) => m.id === meetingId && m.userId === userId);
    if (!meeting) return undefined;
    return {
      ...meeting,
      commitments: this.store.commitments.filter((c) => c.meetingId === meeting.id),
      decisions: this.store.decisions.filter((d) => d.meetingId === meeting.id),
      actionItems: this.store.actionItems.filter((a) => a.meetingId === meeting.id),
      unresolvedIssues: this.store.unresolvedIssues.filter((u) => u.meetingId === meeting.id),
    };
  }

  public createMeeting(
    userId: string,
    title: string,
    meetingDate: string,
    transcriptText: string,
    summary: string
  ): Meeting {
    const meeting: Meeting = {
      id: 'mtg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      userId,
      title,
      meetingDate: meetingDate || new Date().toISOString(),
      transcriptText,
      summary,
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.meetings.push(meeting);
    this.saveStore(this.store);
    if (this.sqlClient) {
      this.sqlClient`
        INSERT INTO meetings (id, user_id, title, meeting_date, transcript_text, summary, created_at, updated_at)
        VALUES (${meeting.id}, ${meeting.userId}, ${meeting.title}, ${meeting.meetingDate}, ${meeting.transcriptText}, ${meeting.summary}, ${meeting.createdAt}, ${meeting.updatedAt})
        ON CONFLICT (id) DO NOTHING
      `.catch((e: any) => console.warn('[Neon write error meeting]:', e));
    }
    return meeting;
  }

  public deleteMeeting(meetingId: string, userId: string): boolean {
    const index = this.store.meetings.findIndex((m) => m.id === meetingId && m.userId === userId);
    if (index === -1) return false;

    this.store.meetings.splice(index, 1);
    this.store.commitments = this.store.commitments.filter((c) => c.meetingId !== meetingId);
    this.store.decisions = this.store.decisions.filter((d) => d.meetingId !== meetingId);
    this.store.actionItems = this.store.actionItems.filter((a) => a.meetingId !== meetingId);
    this.store.unresolvedIssues = this.store.unresolvedIssues.filter((u) => u.meetingId !== meetingId);
    this.store.transcriptChunks = this.store.transcriptChunks.filter((t) => t.meetingId !== meetingId);

    this.saveStore(this.store);
    if (this.sqlClient) {
      this.sqlClient`DELETE FROM meetings WHERE id = ${meetingId}`.catch(() => {});
      this.sqlClient`DELETE FROM commitments WHERE meeting_id = ${meetingId}`.catch(() => {});
      this.sqlClient`DELETE FROM decisions WHERE meeting_id = ${meetingId}`.catch(() => {});
      this.sqlClient`DELETE FROM action_items WHERE meeting_id = ${meetingId}`.catch(() => {});
      this.sqlClient`DELETE FROM unresolved_issues WHERE meeting_id = ${meetingId}`.catch(() => {});
      this.sqlClient`DELETE FROM transcript_chunks WHERE meeting_id = ${meetingId}`.catch(() => {});
    }
    return true;
  }

  // Commitments
  public getCommitments(userId: string): Commitment[] {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.commitments.filter((c) => userMeetingIds.has(c.meetingId));
  }

  public getCommitmentById(id: string): Commitment | undefined {
    return this.store.commitments.find((c) => c.id === id);
  }

  public createCommitment(
    meetingId: string,
    meetingTitle: string,
    meetingDate: string,
    person: string,
    description: string,
    deadline: string | null,
    status: ItemStatus = 'PENDING',
    confidence = 1.0
  ): Commitment {
    const now = new Date().toISOString();
    const commitment: Commitment = {
      id: 'com_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      meetingDate,
      person,
      description,
      deadline,
      status,
      lastMentionedMeetingId: meetingId,
      lastMentionedMeetingTitle: meetingTitle,
      confidence,
      statusHistory: [
        {
          meetingId,
          meetingTitle,
          meetingDate,
          previousStatus: status,
          newStatus: status,
          reason: 'Initial commitment extracted from meeting.',
          confidence,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.store.commitments.push(commitment);
    this.saveStore(this.store);
    if (this.sqlClient) {
      this.sqlClient`
        INSERT INTO commitments (id, meeting_id, person, description, deadline, status, last_mentioned_meeting_id, confidence, status_history, created_at, updated_at)
        VALUES (${commitment.id}, ${commitment.meetingId}, ${commitment.person}, ${commitment.description}, ${commitment.deadline}, ${commitment.status}, ${commitment.lastMentionedMeetingId}, ${commitment.confidence}, ${JSON.stringify(commitment.statusHistory)}, ${commitment.createdAt}, ${commitment.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          last_mentioned_meeting_id = EXCLUDED.last_mentioned_meeting_id,
          status_history = EXCLUDED.status_history,
          updated_at = EXCLUDED.updated_at
      `.catch((e: any) => console.warn('[Neon write error commitment]:', e));
    }
    return commitment;
  }

  public updateCommitmentStatus(
    commitmentId: string,
    newStatus: ItemStatus,
    mentionedMeetingId: string,
    mentionedMeetingTitle: string,
    mentionedMeetingDate: string,
    reason: string,
    confidence = 0.95
  ): Commitment | undefined {
    const com = this.store.commitments.find((c) => c.id === commitmentId);
    if (!com) return undefined;

    const previousStatus = com.status;
    com.status = newStatus;
    com.lastMentionedMeetingId = mentionedMeetingId;
    com.lastMentionedMeetingTitle = mentionedMeetingTitle;
    com.updatedAt = new Date().toISOString();

    const historyEntry: StatusHistoryEntry = {
      meetingId: mentionedMeetingId,
      meetingTitle: mentionedMeetingTitle,
      meetingDate: mentionedMeetingDate,
      previousStatus,
      newStatus,
      reason,
      confidence,
      timestamp: new Date().toISOString(),
    };

    com.statusHistory.push(historyEntry);
    this.saveStore(this.store);
    if (this.sqlClient) {
      this.sqlClient`
        UPDATE commitments
        SET status = ${newStatus},
            last_mentioned_meeting_id = ${mentionedMeetingId},
            status_history = ${JSON.stringify(com.statusHistory)},
            updated_at = ${com.updatedAt}
        WHERE id = ${commitmentId}
      `.catch((e: any) => console.warn('[Neon update error commitment]:', e));
    }
    return com;
  }

  // Decisions
  public createDecision(meetingId: string, meetingTitle: string, description: string): Decision {
    const decision: Decision = {
      id: 'dec_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      description,
      createdAt: new Date().toISOString(),
    };
    this.store.decisions.push(decision);
    this.saveStore(this.store);
    return decision;
  }

  public getDecisions(userId: string): Decision[] {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.decisions.filter((d) => userMeetingIds.has(d.meetingId));
  }

  // Action Items
  public createActionItem(
    meetingId: string,
    meetingTitle: string,
    person: string,
    description: string,
    deadline: string | null,
    status: ItemStatus = 'PENDING'
  ): ActionItem {
    const actionItem: ActionItem = {
      id: 'act_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      person,
      description,
      deadline,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.actionItems.push(actionItem);
    this.saveStore(this.store);
    return actionItem;
  }

  public getActionItems(userId: string): ActionItem[] {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.actionItems.filter((a) => userMeetingIds.has(a.meetingId));
  }

  // Unresolved Issues
  public createUnresolvedIssue(
    meetingId: string,
    meetingTitle: string,
    description: string,
    timesRepeated = 1,
    status: ItemStatus = 'PENDING',
    relatedMeetingIds: string[] = [meetingId]
  ): UnresolvedIssue {
    const issue: UnresolvedIssue = {
      id: 'iss_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      description,
      timesRepeated,
      status,
      relatedMeetingIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.unresolvedIssues.push(issue);
    this.saveStore(this.store);
    return issue;
  }

  public updateUnresolvedIssue(
    issueId: string,
    timesRepeated: number,
    status: ItemStatus,
    newMeetingId: string
  ): UnresolvedIssue | undefined {
    const issue = this.store.unresolvedIssues.find((i) => i.id === issueId);
    if (!issue) return undefined;

    issue.timesRepeated = timesRepeated;
    issue.status = status;
    if (!issue.relatedMeetingIds.includes(newMeetingId)) {
      issue.relatedMeetingIds.push(newMeetingId);
    }
    issue.updatedAt = new Date().toISOString();
    this.saveStore(this.store);
    return issue;
  }

  public getUnresolvedIssues(userId: string): UnresolvedIssue[] {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.unresolvedIssues.filter((i) => userMeetingIds.has(i.meetingId));
  }

  // Transcript Chunks
  public createTranscriptChunk(
    meetingId: string,
    meetingTitle: string,
    chunkIndex: number,
    chunkText: string
  ): TranscriptChunk {
    const chunk: TranscriptChunk = {
      id: 'chk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      chunkIndex,
      chunkText,
      createdAt: new Date().toISOString(),
    };
    this.store.transcriptChunks.push(chunk);
    this.saveStore(this.store);
    return chunk;
  }

  public getTranscriptChunks(userId: string): TranscriptChunk[] {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.transcriptChunks.filter((c) => userMeetingIds.has(c.meetingId));
  }
}

export const db = new DatabaseService();
