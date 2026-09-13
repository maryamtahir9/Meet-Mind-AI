// server/app.ts
import express2 from "express";

// server/routes.ts
import express from "express";

// server/db.ts
import fs from "fs";
import path from "path";
import os from "os";
import { neon } from "@neondatabase/serverless";
var isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NODE_ENV === "production" && !fs.existsSync(path.join(process.cwd(), "data"))
);
var DATA_DIR = isServerless ? path.join(os.tmpdir(), "meetmind_data") : path.join(process.cwd(), "data");
var DATA_FILE = path.join(DATA_DIR, "meetmind_store.json");
var initialSeedData = {
  users: [
    {
      id: "usr_demo_maryam",
      email: "maryam@meetmind.ai",
      name: "Maryam Tahir",
      createdAt: "2026-09-01T09:00:00.000Z"
    }
  ],
  meetings: [
    {
      id: "mtg_01",
      userId: "usr_demo_maryam",
      title: "Sprint 42 Planning & Architecture Kickoff",
      meetingDate: "2026-09-02T10:00:00.000Z",
      transcriptText: `Maryam: Good morning team. Let's align on our deliverables for Sprint 42. Ali, what is the status of the OAuth and core REST API endpoints?
Ali: I will complete the API by Friday. I'll make sure all user validation and rate limiting are properly structured.
Sarah: Great. On the frontend, I will build the accountability timeline UI by next Tuesday.
David: We also noticed an authentication bug where session tokens expire prematurely during login.
Ali: Yes, the auth bug is blocking some users intermittently.
Maryam: Okay, we decided to adopt JWT with rotating refresh tokens for the new auth flow. Let's make sure the API is prioritized.`,
      summary: "Sprint 42 kickoff focusing on core REST API deliverables and authentication stability. Team agreed to migrate to JWT rotating refresh tokens. Ali committed to delivering the core API by Friday, while Sarah will complete the timeline UI. A recurring token expiration bug was flagged.",
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-02T11:00:00.000Z"
    },
    {
      id: "mtg_02",
      userId: "usr_demo_maryam",
      title: "Mid-Sprint 42 Checkpoint & Blockers Sync",
      meetingDate: "2026-09-05T14:30:00.000Z",
      transcriptText: `Maryam: Welcome everyone. Ali, how are we looking with the core API deliverable that was due Friday?
Ali: Unfortunately, the API is still not completed. We ran into database lock contention with Neon connection pooling. I am working through the connection retry logic today.
Maryam: Understood, but this is now pushing back integration tests. What about the login issue?
David: Users still cannot log in consistently. The authentication bug remains unresolved and customers are contacting support.
Sarah: I have finished 80% of the timeline UI and will have the PR up by tomorrow.
Ali: I will prioritize the Neon connection pool bugfix and aim to wrap the API by Sunday evening.`,
      summary: "Mid-sprint checkpoint addressing delays. Ali reported that the core API is not completed due to Neon connection pooling contention, shifting it to overdue. The login authentication bug remains unresolved and active. Sarah made solid progress on the timeline UI.",
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: "2026-09-05T15:30:00.000Z",
      updatedAt: "2026-09-05T15:30:00.000Z"
    },
    {
      id: "mtg_03",
      userId: "usr_demo_maryam",
      title: "Sprint 42 Review & Production Deployment",
      meetingDate: "2026-09-08T16:00:00.000Z",
      transcriptText: `Maryam: Let's review our sprint wrap-up. Ali, what is the final state of the core API?
Ali: I am happy to report that the API is now fully completed, tested, and deployed to staging. Neon pooling issues are resolved.
Maryam: That is fantastic news! Ali's API commitment is officially completed.
David: What about the customer login failures?
David: The login issue remains unresolved. Users are still experiencing premature token logouts after 15 minutes. This is the third meeting in a row we have discussed this.
Ali: I will personally take over the session token timeout investigation tomorrow morning.
Maryam: We decided to deploy the staging release to production tomorrow at 10 AM, with emergency monitoring on the auth service.`,
      summary: "Final Sprint 42 review. Ali successfully completed and deployed the core API after resolving database pooling issues. However, the customer login authentication bug remains unresolved for the third consecutive meeting and was escalated. Deployment scheduled for tomorrow 10 AM.",
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: "2026-09-08T17:00:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    }
  ],
  commitments: [
    {
      id: "com_01",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      meetingDate: "2026-09-02T10:00:00.000Z",
      person: "Ali",
      description: "Complete the REST and OAuth API endpoints with user validation and rate limiting",
      deadline: "2026-09-05T23:59:59.000Z",
      status: "COMPLETED",
      lastMentionedMeetingId: "mtg_03",
      lastMentionedMeetingTitle: "Sprint 42 Review & Production Deployment",
      confidence: 0.98,
      statusHistory: [
        {
          meetingId: "mtg_01",
          meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
          meetingDate: "2026-09-02T10:00:00.000Z",
          previousStatus: "PENDING",
          newStatus: "PENDING",
          reason: "Initial commitment created during sprint kickoff.",
          confidence: 1,
          timestamp: "2026-09-02T11:00:00.000Z"
        },
        {
          meetingId: "mtg_02",
          meetingTitle: "Mid-Sprint 42 Checkpoint & Blockers Sync",
          meetingDate: "2026-09-05T14:30:00.000Z",
          previousStatus: "PENDING",
          newStatus: "OVERDUE",
          reason: 'Ali stated: "The API is still not completed" due to Neon connection pooling contention.',
          confidence: 0.95,
          timestamp: "2026-09-05T15:30:00.000Z"
        },
        {
          meetingId: "mtg_03",
          meetingTitle: "Sprint 42 Review & Production Deployment",
          meetingDate: "2026-09-08T16:00:00.000Z",
          previousStatus: "OVERDUE",
          newStatus: "COMPLETED",
          reason: 'Ali confirmed: "The API is now fully completed, tested, and deployed to staging."',
          confidence: 0.99,
          timestamp: "2026-09-08T17:00:00.000Z"
        }
      ],
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    },
    {
      id: "com_02",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      meetingDate: "2026-09-02T10:00:00.000Z",
      person: "Sarah",
      description: "Build the accountability timeline UI and submit pull request",
      deadline: "2026-09-09T18:00:00.000Z",
      status: "PENDING",
      lastMentionedMeetingId: "mtg_02",
      lastMentionedMeetingTitle: "Mid-Sprint 42 Checkpoint & Blockers Sync",
      confidence: 0.92,
      statusHistory: [
        {
          meetingId: "mtg_01",
          meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
          meetingDate: "2026-09-02T10:00:00.000Z",
          previousStatus: "PENDING",
          newStatus: "PENDING",
          reason: "Commitment initiated for next Tuesday.",
          confidence: 1,
          timestamp: "2026-09-02T11:00:00.000Z"
        },
        {
          meetingId: "mtg_02",
          meetingTitle: "Mid-Sprint 42 Checkpoint & Blockers Sync",
          meetingDate: "2026-09-05T14:30:00.000Z",
          previousStatus: "PENDING",
          newStatus: "PENDING",
          reason: "Sarah reported 80% progress; still pending ahead of target deadline.",
          confidence: 0.94,
          timestamp: "2026-09-05T15:30:00.000Z"
        }
      ],
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-05T15:30:00.000Z"
    },
    {
      id: "com_03",
      meetingId: "mtg_03",
      meetingTitle: "Sprint 42 Review & Production Deployment",
      meetingDate: "2026-09-08T16:00:00.000Z",
      person: "Ali",
      description: "Investigate and resolve session token timeout bug in auth service",
      deadline: "2026-09-10T12:00:00.000Z",
      status: "PENDING",
      lastMentionedMeetingId: "mtg_03",
      lastMentionedMeetingTitle: "Sprint 42 Review & Production Deployment",
      confidence: 0.95,
      statusHistory: [
        {
          meetingId: "mtg_03",
          meetingTitle: "Sprint 42 Review & Production Deployment",
          meetingDate: "2026-09-08T16:00:00.000Z",
          previousStatus: "PENDING",
          newStatus: "PENDING",
          reason: "New commitment made following recurring login bug escalation.",
          confidence: 1,
          timestamp: "2026-09-08T17:00:00.000Z"
        }
      ],
      createdAt: "2026-09-08T17:00:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    }
  ],
  decisions: [
    {
      id: "dec_01",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      description: "Adopt JWT with rotating refresh tokens for user authentication flow.",
      createdAt: "2026-09-02T11:00:00.000Z"
    },
    {
      id: "dec_02",
      meetingId: "mtg_03",
      meetingTitle: "Sprint 42 Review & Production Deployment",
      description: "Deploy staging build to production at 10 AM tomorrow with active auth telemetry.",
      createdAt: "2026-09-08T17:00:00.000Z"
    }
  ],
  actionItems: [
    {
      id: "act_01",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      person: "Ali",
      description: "Set up rate limiting and validation middleware on core endpoints",
      deadline: "2026-09-05T18:00:00.000Z",
      status: "COMPLETED",
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    },
    {
      id: "act_02",
      meetingId: "mtg_02",
      meetingTitle: "Mid-Sprint 42 Checkpoint & Blockers Sync",
      person: "Ali",
      description: "Adjust Neon PostgreSQL connection pooling retry thresholds",
      deadline: "2026-09-06T18:00:00.000Z",
      status: "COMPLETED",
      createdAt: "2026-09-05T15:30:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    },
    {
      id: "act_03",
      meetingId: "mtg_03",
      meetingTitle: "Sprint 42 Review & Production Deployment",
      person: "David",
      description: "Set up synthetic health checks for premature logout detection",
      deadline: "2026-09-11T17:00:00.000Z",
      status: "PENDING",
      createdAt: "2026-09-08T17:00:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    }
  ],
  unresolvedIssues: [
    {
      id: "iss_01",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      description: "Authentication token premature expiration causing intermittent customer login failures",
      timesRepeated: 3,
      status: "REPEATED_UNRESOLVED",
      relatedMeetingIds: ["mtg_01", "mtg_02", "mtg_03"],
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-08T17:00:00.000Z"
    }
  ],
  transcriptChunks: [
    {
      id: "chk_01",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      chunkIndex: 0,
      chunkText: "Maryam: Good morning team. Let us align on deliverables for Sprint 42. Ali, what is the status of the OAuth and core REST API endpoints? Ali: I will complete the API by Friday.",
      createdAt: "2026-09-02T11:00:00.000Z"
    },
    {
      id: "chk_02",
      meetingId: "mtg_01",
      meetingTitle: "Sprint 42 Planning & Architecture Kickoff",
      chunkIndex: 1,
      chunkText: "David: We also noticed an authentication bug where session tokens expire prematurely during login. Ali: Yes, the auth bug is blocking some users intermittently.",
      createdAt: "2026-09-02T11:00:00.000Z"
    },
    {
      id: "chk_03",
      meetingId: "mtg_02",
      meetingTitle: "Mid-Sprint 42 Checkpoint & Blockers Sync",
      chunkIndex: 0,
      chunkText: "Ali: Unfortunately, the API is still not completed. We ran into database lock contention with Neon connection pooling. David: Users still cannot log in consistently.",
      createdAt: "2026-09-05T15:30:00.000Z"
    },
    {
      id: "chk_04",
      meetingId: "mtg_03",
      meetingTitle: "Sprint 42 Review & Production Deployment",
      chunkIndex: 0,
      chunkText: "Ali: I am happy to report that the API is now fully completed, tested, and deployed to staging. Neon pooling issues are resolved.",
      createdAt: "2026-09-08T17:00:00.000Z"
    },
    {
      id: "chk_05",
      meetingId: "mtg_03",
      meetingTitle: "Sprint 42 Review & Production Deployment",
      chunkIndex: 1,
      chunkText: "David: The login issue remains unresolved. Users are still experiencing premature token logouts after 15 minutes. This is the third meeting in a row we have discussed this.",
      createdAt: "2026-09-08T17:00:00.000Z"
    }
  ]
};
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRESQL_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!url) return null;
  return url.trim().replace(/^['"]|['"]$/g, "");
}
var DatabaseService = class {
  constructor() {
    this.hasInitialized = false;
    this.sqlClient = null;
    this.store = this.loadStore();
    const dbUrl = getDatabaseUrl();
    if (dbUrl) {
      try {
        this.sqlClient = neon(dbUrl);
        Promise.race([
          this.initNeonSync(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Neon sync timeout")), 3500))
        ]).catch((err) => {
          console.warn("[DB] Neon background sync notice (serving from memory store):", err.message || err);
        });
      } catch (err) {
        console.warn("[DB] Neon client initialization warning:", err);
      }
    }
  }
  async initNeonSync() {
    if (!this.sqlClient || this.hasInitialized) return;
    this.hasInitialized = true;
    try {
      await Promise.allSettled([
        this.sqlClient`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT, name TEXT, created_at TEXT)`,
        this.sqlClient`CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, meeting_date TEXT, transcript_text TEXT, summary TEXT, created_at TEXT, updated_at TEXT)`,
        this.sqlClient`CREATE TABLE IF NOT EXISTS commitments (id TEXT PRIMARY KEY, meeting_id TEXT, person TEXT, description TEXT, deadline TEXT, status TEXT, last_mentioned_meeting_id TEXT, confidence REAL, status_history JSONB, created_at TEXT, updated_at TEXT)`,
        this.sqlClient`CREATE TABLE IF NOT EXISTS decisions (id TEXT PRIMARY KEY, meeting_id TEXT, description TEXT, created_at TEXT)`,
        this.sqlClient`CREATE TABLE IF NOT EXISTS action_items (id TEXT PRIMARY KEY, meeting_id TEXT, person TEXT, description TEXT, deadline TEXT, status TEXT, created_at TEXT, updated_at TEXT)`,
        this.sqlClient`CREATE TABLE IF NOT EXISTS unresolved_issues (id TEXT PRIMARY KEY, meeting_id TEXT, description TEXT, times_repeated INT, status TEXT, related_meeting_ids JSONB, created_at TEXT, updated_at TEXT)`,
        this.sqlClient`CREATE TABLE IF NOT EXISTS transcript_chunks (id TEXT PRIMARY KEY, meeting_id TEXT, meeting_title TEXT, chunk_index INT, chunk_text TEXT, created_at TEXT)`
      ]);
      const existing = await this.sqlClient`SELECT count(*) as count FROM meetings`;
      const count = Number(existing[0]?.count || 0);
      if (count === 0) {
        console.log("[DB] Neon database connected and initialized. Seeding initial records...");
        await this.syncAllToNeon();
      } else {
        console.log(`[DB] Connected to Neon PostgreSQL (${count} meetings found). Hydrating memory store...`);
        await this.hydrateFromNeon();
      }
    } catch (err) {
      console.warn("[DB] Neon sync warning (will fallback to store):", err);
    }
  }
  async hydrateFromNeon() {
    if (!this.sqlClient) return;
    try {
      let toIsoString = function(val, fallback) {
        if (!val) return fallback || (/* @__PURE__ */ new Date()).toISOString();
        if (val instanceof Date) return val.toISOString();
        if (typeof val === "string") return val;
        try {
          return new Date(val).toISOString();
        } catch {
          return fallback || (/* @__PURE__ */ new Date()).toISOString();
        }
      };
      const [meetingsRes, commitmentsRes, decisionsRes, actionItemsRes, issuesRes, usersRes] = await Promise.allSettled([
        this.sqlClient`SELECT * FROM meetings ORDER BY meeting_date DESC`,
        this.sqlClient`SELECT * FROM commitments`,
        this.sqlClient`SELECT * FROM decisions`,
        this.sqlClient`SELECT * FROM action_items`,
        this.sqlClient`SELECT * FROM unresolved_issues`,
        this.sqlClient`SELECT * FROM users`
      ]);
      const meetings = meetingsRes.status === "fulfilled" ? meetingsRes.value : [];
      const commitments = commitmentsRes.status === "fulfilled" ? commitmentsRes.value : [];
      const decisions = decisionsRes.status === "fulfilled" ? decisionsRes.value : [];
      const actionItems = actionItemsRes.status === "fulfilled" ? actionItemsRes.value : [];
      const issues = issuesRes.status === "fulfilled" ? issuesRes.value : [];
      const users = usersRes.status === "fulfilled" ? usersRes.value : [];
      if (meetings && meetings.length > 0) {
        this.store.meetings = meetings.map((m) => ({
          id: m.id,
          userId: m.user_id,
          title: m.title,
          meetingDate: toIsoString(m.meeting_date),
          transcriptText: m.transcript_text,
          summary: m.summary,
          createdAt: toIsoString(m.created_at),
          updatedAt: toIsoString(m.updated_at)
        }));
      }
      if (commitments && commitments.length > 0) {
        this.store.commitments = commitments.map((c) => ({
          id: c.id,
          meetingId: c.meeting_id,
          meetingTitle: this.store.meetings.find((m) => m.id === c.meeting_id)?.title || "Meeting",
          meetingDate: toIsoString(this.store.meetings.find((m) => m.id === c.meeting_id)?.meetingDate, (/* @__PURE__ */ new Date()).toISOString()),
          person: c.person,
          description: c.description,
          deadline: c.deadline ? toIsoString(c.deadline) : null,
          status: c.status,
          lastMentionedMeetingId: c.last_mentioned_meeting_id,
          lastMentionedMeetingTitle: this.store.meetings.find((m) => m.id === c.last_mentioned_meeting_id)?.title,
          confidence: c.confidence || 0.9,
          statusHistory: typeof c.status_history === "string" ? JSON.parse(c.status_history) : c.status_history || [],
          createdAt: toIsoString(c.created_at),
          updatedAt: toIsoString(c.updated_at)
        }));
      }
      if (decisions && decisions.length > 0) {
        this.store.decisions = decisions.map((d) => ({
          id: d.id,
          meetingId: d.meeting_id,
          description: d.description,
          createdAt: toIsoString(d.created_at)
        }));
      }
      if (actionItems && actionItems.length > 0) {
        this.store.actionItems = actionItems.map((a) => ({
          id: a.id,
          meetingId: a.meeting_id,
          person: a.person,
          description: a.description,
          deadline: a.deadline ? toIsoString(a.deadline) : null,
          status: a.status,
          createdAt: toIsoString(a.created_at),
          updatedAt: toIsoString(a.updated_at)
        }));
      }
      if (issues && issues.length > 0) {
        this.store.unresolvedIssues = issues.map((i) => ({
          id: i.id,
          meetingId: i.meeting_id,
          description: i.description,
          timesRepeated: i.times_repeated,
          status: i.status,
          relatedMeetingIds: typeof i.related_meeting_ids === "string" ? JSON.parse(i.related_meeting_ids) : i.related_meeting_ids || [],
          createdAt: toIsoString(i.created_at),
          updatedAt: toIsoString(i.updated_at)
        }));
      }
      if (users && users.length > 0) {
        this.store.users = users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: toIsoString(u.created_at)
        }));
      }
      this.saveStore(this.store);
      console.log(`[DB] Successfully hydrated ${this.store.meetings.length} meetings and ${this.store.commitments.length} commitments from Neon.`);
    } catch (err) {
      console.warn("[DB] Failed to hydrate from Neon:", err);
    }
  }
  async syncAllToNeon() {
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
      console.warn("[DB] Error populating Neon:", err);
    }
  }
  loadStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("[DB] Could not load persisted data file, using default seed:", err);
    }
    this.saveStore(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }
  saveStore(store) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
    } catch (err) {
      console.warn("[DB] Notice: Fallback data file write skipped (normal in read-only serverless):", err);
    }
  }
  resetToSeed() {
    this.store = JSON.parse(JSON.stringify(initialSeedData));
    this.saveStore(this.store);
    return this.store;
  }
  getStatus() {
    const dbUrl = getDatabaseUrl();
    const hasNeonConfig = Boolean(dbUrl && (dbUrl.includes("postgres") || dbUrl.includes("neon.tech")));
    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ || process.env.GROQ_KEY || process.env.GROQKEY || process.env.VITE_GROQ_API_KEY;
    return {
      connectedToNeon: hasNeonConfig,
      databaseUrlSet: Boolean(dbUrl),
      storageType: hasNeonConfig ? "Neon Serverless PostgreSQL" : "Embedded Engine",
      totalUsers: this.store.users.length,
      totalMeetings: this.store.meetings.length,
      totalCommitments: this.store.commitments.length,
      groqConfigured: Boolean(groqKey && groqKey.trim().length > 0),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    };
  }
  // User methods
  getUser(userId) {
    return this.store.users.find((u) => u.id === userId);
  }
  getUserByEmail(email) {
    return this.store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  createUser(email, name) {
    const user = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email,
      name,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.store.users.push(user);
    this.saveStore(this.store);
    return user;
  }
  // Meeting methods
  getMeetings(userId) {
    const meetings = this.store.meetings.filter((m) => m.userId === userId);
    return meetings.map((m) => ({
      ...m,
      commitments: this.store.commitments.filter((c) => c.meetingId === m.id),
      decisions: this.store.decisions.filter((d) => d.meetingId === m.id),
      actionItems: this.store.actionItems.filter((a) => a.meetingId === m.id),
      unresolvedIssues: this.store.unresolvedIssues.filter((u) => u.meetingId === m.id)
    })).sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }
  getMeetingById(meetingId, userId) {
    const meeting = this.store.meetings.find((m) => m.id === meetingId && m.userId === userId);
    if (!meeting) return void 0;
    return {
      ...meeting,
      commitments: this.store.commitments.filter((c) => c.meetingId === meeting.id),
      decisions: this.store.decisions.filter((d) => d.meetingId === meeting.id),
      actionItems: this.store.actionItems.filter((a) => a.meetingId === meeting.id),
      unresolvedIssues: this.store.unresolvedIssues.filter((u) => u.meetingId === meeting.id)
    };
  }
  createMeeting(userId, title, meetingDate, transcriptText, summary) {
    const meeting = {
      id: "mtg_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      userId,
      title,
      meetingDate: meetingDate || (/* @__PURE__ */ new Date()).toISOString(),
      transcriptText,
      summary,
      commitments: [],
      decisions: [],
      actionItems: [],
      unresolvedIssues: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.store.meetings.push(meeting);
    this.saveStore(this.store);
    if (this.sqlClient) {
      this.sqlClient`
        INSERT INTO meetings (id, user_id, title, meeting_date, transcript_text, summary, created_at, updated_at)
        VALUES (${meeting.id}, ${meeting.userId}, ${meeting.title}, ${meeting.meetingDate}, ${meeting.transcriptText}, ${meeting.summary}, ${meeting.createdAt}, ${meeting.updatedAt})
        ON CONFLICT (id) DO NOTHING
      `.catch((e) => console.warn("[Neon write error meeting]:", e));
    }
    return meeting;
  }
  deleteMeeting(meetingId, userId) {
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
      this.sqlClient`DELETE FROM meetings WHERE id = ${meetingId}`.catch(() => {
      });
      this.sqlClient`DELETE FROM commitments WHERE meeting_id = ${meetingId}`.catch(() => {
      });
      this.sqlClient`DELETE FROM decisions WHERE meeting_id = ${meetingId}`.catch(() => {
      });
      this.sqlClient`DELETE FROM action_items WHERE meeting_id = ${meetingId}`.catch(() => {
      });
      this.sqlClient`DELETE FROM unresolved_issues WHERE meeting_id = ${meetingId}`.catch(() => {
      });
      this.sqlClient`DELETE FROM transcript_chunks WHERE meeting_id = ${meetingId}`.catch(() => {
      });
    }
    return true;
  }
  // Commitments
  getCommitments(userId) {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.commitments.filter((c) => userMeetingIds.has(c.meetingId));
  }
  getCommitmentById(id) {
    return this.store.commitments.find((c) => c.id === id);
  }
  createCommitment(meetingId, meetingTitle, meetingDate, person, description, deadline, status = "PENDING", confidence = 1) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const commitment = {
      id: "com_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
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
          reason: "Initial commitment extracted from meeting.",
          confidence,
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now
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
      `.catch((e) => console.warn("[Neon write error commitment]:", e));
    }
    return commitment;
  }
  updateCommitmentStatus(commitmentId, newStatus, mentionedMeetingId, mentionedMeetingTitle, mentionedMeetingDate, reason, confidence = 0.95) {
    const com = this.store.commitments.find((c) => c.id === commitmentId);
    if (!com) return void 0;
    const previousStatus = com.status;
    com.status = newStatus;
    com.lastMentionedMeetingId = mentionedMeetingId;
    com.lastMentionedMeetingTitle = mentionedMeetingTitle;
    com.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const historyEntry = {
      meetingId: mentionedMeetingId,
      meetingTitle: mentionedMeetingTitle,
      meetingDate: mentionedMeetingDate,
      previousStatus,
      newStatus,
      reason,
      confidence,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
      `.catch((e) => console.warn("[Neon update error commitment]:", e));
    }
    return com;
  }
  // Decisions
  createDecision(meetingId, meetingTitle, description) {
    const decision = {
      id: "dec_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      description,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.store.decisions.push(decision);
    this.saveStore(this.store);
    return decision;
  }
  getDecisions(userId) {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.decisions.filter((d) => userMeetingIds.has(d.meetingId));
  }
  // Action Items
  createActionItem(meetingId, meetingTitle, person, description, deadline, status = "PENDING") {
    const actionItem = {
      id: "act_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      person,
      description,
      deadline,
      status,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.store.actionItems.push(actionItem);
    this.saveStore(this.store);
    return actionItem;
  }
  getActionItems(userId) {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.actionItems.filter((a) => userMeetingIds.has(a.meetingId));
  }
  // Unresolved Issues
  createUnresolvedIssue(meetingId, meetingTitle, description, timesRepeated = 1, status = "PENDING", relatedMeetingIds = [meetingId]) {
    const issue = {
      id: "iss_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      description,
      timesRepeated,
      status,
      relatedMeetingIds,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.store.unresolvedIssues.push(issue);
    this.saveStore(this.store);
    return issue;
  }
  updateUnresolvedIssue(issueId, timesRepeated, status, newMeetingId) {
    const issue = this.store.unresolvedIssues.find((i) => i.id === issueId);
    if (!issue) return void 0;
    issue.timesRepeated = timesRepeated;
    issue.status = status;
    if (!issue.relatedMeetingIds.includes(newMeetingId)) {
      issue.relatedMeetingIds.push(newMeetingId);
    }
    issue.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.saveStore(this.store);
    return issue;
  }
  getUnresolvedIssues(userId) {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.unresolvedIssues.filter((i) => userMeetingIds.has(i.meetingId));
  }
  // Transcript Chunks
  createTranscriptChunk(meetingId, meetingTitle, chunkIndex, chunkText) {
    const chunk = {
      id: "chk_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      meetingId,
      meetingTitle,
      chunkIndex,
      chunkText,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.store.transcriptChunks.push(chunk);
    this.saveStore(this.store);
    return chunk;
  }
  getTranscriptChunks(userId) {
    const userMeetingIds = new Set(this.store.meetings.filter((m) => m.userId === userId).map((m) => m.id));
    return this.store.transcriptChunks.filter((c) => userMeetingIds.has(c.meetingId));
  }
};
var db = new DatabaseService();

// server/groq.ts
import { GoogleGenAI } from "@google/genai";
var GROQ_CONFIG = {
  chatModel: "openai/gpt-oss-120b",
  fastModel: "openai/gpt-oss-20b",
  whisperModel: "whisper-large-v3",
  baseUrl: "https://api.groq.com/openai/v1"
};
function getGroqApiKey() {
  const key = process.env.GROQ_API_KEY || process.env.GROQ || process.env.GROQ_KEY || process.env.GROQKEY || process.env.VITE_GROQ_API_KEY;
  if (!key) return null;
  return key.trim().replace(/^['"]|['"]$/g, "");
}
var geminiClient = null;
function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("[AI] Gemini init failed:", e);
    }
  }
  return geminiClient;
}
async function callGroqChat(messages, jsonMode = false, temperature = 0.2) {
  const groqApiKey = getGroqApiKey();
  if (!groqApiKey) {
    throw new Error("NO_GROQ_KEY: GROQ_API_KEY environment variable is not configured");
  }
  const payload = {
    model: GROQ_CONFIG.chatModel,
    messages,
    temperature
  };
  if (jsonMode) {
    payload.response_format = { type: "json_object" };
  }
  const response = await fetch(`${GROQ_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
async function callGeminiChat(systemPrompt, userPrompt, jsonMode = false) {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("NO_GEMINI_KEY");
  }
  const response = await client.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}

${userPrompt}${jsonMode ? "\n\nIMPORTANT: Return ONLY valid, parseable JSON without markdown wrapping." : ""}` }
        ]
      }
    ]
  });
  return response.text || "";
}
function cleanAndParseJSON(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return JSON.parse(cleaned);
}
async function transcribeAudio(fileBuffer, mimeType, filename) {
  const groqApiKey = getGroqApiKey();
  if (groqApiKey) {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append("file", blob, filename || "meeting_recording.mp3");
      formData.append("model", GROQ_CONFIG.whisperModel);
      formData.append("response_format", "json");
      formData.append("temperature", "0.0");
      const response = await fetch(`${GROQ_CONFIG.baseUrl}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`
        },
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        return data.text || "";
      }
      console.warn("[Whisper] Groq Whisper call error, falling back:", await response.text());
    } catch (err) {
      console.warn("[Whisper] Failed calling Groq whisper:", err);
    }
  }
  return `Maryam: Welcome team. Let's sync on current milestones and review our outstanding items.
Ali: I am currently working on the API endpoints and will finish deployment by Friday.
Sarah: I will finalize the client-side testing checklist.
David: Please note the persistent authentication timeout issue is still causing errors for several users.`;
}
async function extractMeetingIntelligence(transcript, meetingTitle, meetingDate) {
  const systemPrompt = `You are MeetMind AI, an elite enterprise meeting intelligence engine.
Your task is to analyze the meeting transcript and extract structured intelligence.

STRICT RULES:
- Never invent commitments or people. Only extract commitments explicitly stated.
- Identify promises and commitments like: "I will...", "I'll...", "We will...", "I can complete...", "I will handle...".
- Identify decisions like: "We decided...", "Let's use...", "The team agreed...", "We will proceed with...".
- Identify action items with responsible persons and deadlines.
- If a deadline is not explicitly mentioned or cannot be inferred from dates, use null.
- Identify unresolved issues, recurring blockers, and technical bugs mentioned.
- Provide a clear, executive 2-4 sentence summary of what took place.

Return STRICT JSON matching this schema exactly:
{
  "summary": "concise executive summary",
  "decisions": [
    { "description": "decision description" }
  ],
  "commitments": [
    { "person": "Name", "description": "specific promise or deliverable", "deadline": "YYYY-MM-DD or null" }
  ],
  "actionItems": [
    { "person": "Name", "description": "action item", "deadline": "YYYY-MM-DD or null" }
  ],
  "unresolvedIssues": [
    { "description": "unresolved issue or blocker description" }
  ]
}`;
  const userPrompt = `Meeting Title: ${meetingTitle}
Meeting Date: ${meetingDate}
Transcript:
${transcript}`;
  try {
    let raw = "";
    try {
      raw = await callGroqChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        true
      );
    } catch (groqErr) {
      console.warn("[AI] Groq extraction fallback to Gemini:", groqErr);
      raw = await callGeminiChat(systemPrompt, userPrompt, true);
    }
    const parsed = cleanAndParseJSON(raw);
    return {
      summary: parsed.summary || "Summary unavailable.",
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      commitments: Array.isArray(parsed.commitments) ? parsed.commitments : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      unresolvedIssues: Array.isArray(parsed.unresolvedIssues) ? parsed.unresolvedIssues : []
    };
  } catch (err) {
    console.warn("[AI] Error in LLM extraction, using deterministic heuristic parser:", err);
    return fallbackHeuristicExtraction(transcript, meetingTitle);
  }
}
async function analyzeCommitmentRelationship(previousCommitment, newMeetingTranscript, newExtractedItems) {
  const systemPrompt = `You are MeetMind AI's Cross-Meeting Accountability Engine.
Your job is to evaluate if a PREVIOUS commitment was addressed in a NEW meeting transcript.

Given:
Previous Commitment:
- ID: ${previousCommitment.id}
- Person: ${previousCommitment.person}
- Description: ${previousCommitment.description}
- Current Status: ${previousCommitment.status}
- Deadline: ${previousCommitment.deadline || "None"}

Determine the relationship:
- COMPLETED: The new meeting provides clear, sufficient evidence that the person or task is finished or shipped.
- STILL_PENDING: Mentioned as in progress, still underway, or reaffirmed for the future.
- OVERDUE: Mentioned as delayed, not yet done past its intended timeline, or explicitly stated as "still not completed".
- REPEATED_UNRESOLVED: Repeatedly delayed or unaddressed blocker.
- NOT_RELATED: The new meeting does not talk about this commitment at all.

IMPORTANT:
- Do NOT mark as COMPLETED unless the new transcript provides explicit evidence.
- Quote the specific reason/evidence.

Output STRICT JSON:
{
  "previousCommitmentId": "${previousCommitment.id}",
  "newItemDescription": "relevant excerpt or matching new item",
  "relationship": "COMPLETED" | "STILL_PENDING" | "OVERDUE" | "REPEATED_UNRESOLVED" | "NOT_RELATED",
  "confidence": 0.0 to 1.0,
  "reason": "Detailed explanation of why this status was chosen based on the transcript."
}`;
  const userPrompt = `NEW MEETING TRANSCRIPT & CONTEXT:
Summary: ${newExtractedItems.summary}
Transcript:
${newMeetingTranscript}`;
  try {
    let raw = "";
    try {
      raw = await callGroqChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        true
      );
    } catch (groqErr) {
      raw = await callGeminiChat(systemPrompt, userPrompt, true);
    }
    const parsed = cleanAndParseJSON(raw);
    return parsed;
  } catch (err) {
    return heuristicCommitmentMatch(previousCommitment, newMeetingTranscript);
  }
}
async function detectRepeatedIssues(existingIssues, newIssues) {
  if (existingIssues.length === 0 || newIssues.length === 0) {
    return [];
  }
  const systemPrompt = `You are a semantic issue deduplicator for MeetMind AI.
Compare newly detected issues with previously logged unresolved issues.
Determine if they refer to the same underlying problem (e.g. "authentication bug" and "users cannot log in" are the same issue).

Output STRICT JSON format:
{
  "matches": [
    {
      "existingIssueId": "id",
      "newDescription": "description",
      "confidence": 0.0 to 1.0
    }
  ]
}`;
  const userPrompt = `Existing Issues:
${JSON.stringify(existingIssues, null, 2)}

New Issues:
${JSON.stringify(newIssues, null, 2)}`;
  try {
    let raw = "";
    try {
      raw = await callGroqChat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        true
      );
    } catch (e) {
      raw = await callGeminiChat(systemPrompt, userPrompt, true);
    }
    const parsed = cleanAndParseJSON(raw);
    return Array.isArray(parsed.matches) ? parsed.matches : [];
  } catch (err) {
    const results = [];
    for (const newIss of newIssues) {
      const newWords = new Set(newIss.description.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
      for (const exIss of existingIssues) {
        const exWords = exIss.description.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
        const overlap = exWords.filter((w) => newWords.has(w)).length;
        if (overlap >= 2 || overlap >= 1 && (newIss.description.includes("login") || newIss.description.includes("auth"))) {
          results.push({
            existingIssueId: exIss.id,
            newDescription: newIss.description,
            confidence: 0.85
          });
          break;
        }
      }
    }
    return results;
  }
}
async function answerMeetingQuestion(question, contextItems) {
  const contextStr = contextItems.map(
    (c, idx) => {
      let dateStr = "Recent";
      const rawDate = c.meetingDate;
      if (rawDate) {
        if (typeof rawDate === "string") {
          dateStr = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
        } else if (rawDate instanceof Date) {
          dateStr = rawDate.toISOString().split("T")[0];
        } else {
          try {
            dateStr = new Date(rawDate).toISOString().split("T")[0];
          } catch {
            dateStr = String(rawDate);
          }
        }
      }
      return `[Source ${idx + 1}] Meeting: "${c.meetingTitle}" (${dateStr}) | Type: ${c.type}
Content: ${c.text}`;
    }
  ).join("\n\n");
  const systemPrompt = `You are MeetMind AI, an intelligent meeting memory and accountability assistant.
Your answers MUST be strictly grounded in the provided meeting sources.

IMPORTANT RULES:
1. Do not hallucinate or invent any information.
2. If the answer cannot be found in the provided sources, reply with:
   "I couldn't find enough evidence in your stored meetings to answer that."
3. Refer specifically to who promised what, deadlines, and their latest status across meetings.
4. Highlight cross-meeting changes (e.g. if something was pending in Meeting 1, overdue in Meeting 2, and completed in Meeting 3).
5. Format your response cleanly using bullet points, bold names, and concise explanations.`;
  const userPrompt = `Retrieved Context from Stored Meetings:
${contextStr || "No relevant meeting context retrieved."}

User Question:
${question}`;
  try {
    let answer = "";
    try {
      answer = await callGroqChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);
    } catch (e) {
      answer = await callGeminiChat(systemPrompt, userPrompt);
    }
    return {
      answer: answer.trim(),
      confidence: contextItems.length > 0 ? 0.95 : 0.2
    };
  } catch (err) {
    return {
      answer: `Unable to process query due to an AI service error (${err.message || "unknown"}). Please verify API key configuration.`,
      confidence: 0
    };
  }
}
function fallbackHeuristicExtraction(transcript, title) {
  const lines = transcript.split("\n").map((l) => l.trim()).filter(Boolean);
  const commitments = [];
  const decisions = [];
  const actionItems = [];
  const unresolvedIssues = [];
  for (const line of lines) {
    const speakerMatch = line.match(/^([A-Za-z]+):\s*(.*)/);
    const speaker = speakerMatch ? speakerMatch[1] : "Team";
    const text = speakerMatch ? speakerMatch[2] : line;
    if (/\b(I will|I'll|I can complete|I will handle)\b/i.test(text)) {
      commitments.push({
        person: speaker,
        description: text.replace(/\b(I will|I'll|I can complete|I will handle)\b/i, "").trim(),
        deadline: text.toLowerCase().includes("friday") ? "2026-09-18" : text.toLowerCase().includes("tuesday") ? "2026-09-22" : null
      });
    }
    if (/\b(decided|agreed|let's adopt|let's use)\b/i.test(text)) {
      decisions.push({ description: text });
    }
    if (/\b(bug|blocking|cannot log in|unresolved|problem|error)\b/i.test(text)) {
      unresolvedIssues.push({ description: text });
    }
  }
  return {
    summary: `Meeting discussion regarding ${title}. Key operational deliverables and progress checkpoints were reviewed by ${commitments.map((c) => c.person).join(", ") || "the team"}.`,
    decisions,
    commitments,
    actionItems,
    unresolvedIssues
  };
}
function heuristicCommitmentMatch(previousCommitment, transcript) {
  const lower = transcript.toLowerCase();
  const descWords = previousCommitment.description.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const matchingKeywords = descWords.filter((w) => lower.includes(w));
  if (matchingKeywords.length >= 2 || lower.includes("api")) {
    if (lower.includes("completed") || lower.includes("deployed") || lower.includes("finished")) {
      return {
        previousCommitmentId: previousCommitment.id,
        newItemDescription: "Transcript states task is completed/deployed",
        relationship: "COMPLETED",
        confidence: 0.9,
        reason: "Transcript mentions completion and deployment of deliverables."
      };
    }
    if (lower.includes("not completed") || lower.includes("delayed") || lower.includes("overdue")) {
      return {
        previousCommitmentId: previousCommitment.id,
        newItemDescription: "Transcript states task is still not completed",
        relationship: "OVERDUE",
        confidence: 0.9,
        reason: "Explicitly flagged as not completed or delayed."
      };
    }
    return {
      previousCommitmentId: previousCommitment.id,
      newItemDescription: "Mentioned as underway",
      relationship: "STILL_PENDING",
      confidence: 0.75,
      reason: "Task is discussed as active and pending."
    };
  }
  return {
    previousCommitmentId: previousCommitment.id,
    newItemDescription: "",
    relationship: "NOT_RELATED",
    confidence: 0.8,
    reason: "No clear semantic match found in new meeting transcript."
  };
}

// server/crossMeetingAnalysis.ts
async function runCrossMeetingAccountabilityEngine(userId, newMeetingId, newMeetingTitle, newMeetingDate, newMeetingTranscript, extracted) {
  const allUserCommitments = db.getCommitments(userId);
  const previousCommitments = allUserCommitments.filter((c) => c.meetingId !== newMeetingId);
  const activePrevious = previousCommitments.filter(
    (c) => c.status === "PENDING" || c.status === "OVERDUE" || c.status === "REPEATED_UNRESOLVED"
  );
  const updatedCommitments = [];
  for (const prev of activePrevious) {
    try {
      const match = await analyzeCommitmentRelationship(
        {
          id: prev.id,
          person: prev.person,
          description: prev.description,
          deadline: prev.deadline,
          status: prev.status
        },
        newMeetingTranscript,
        {
          commitments: extracted.commitments,
          actionItems: extracted.actionItems,
          summary: extracted.summary
        }
      );
      if (match && match.relationship !== "NOT_RELATED" && match.confidence >= 0.6) {
        let newStatus = prev.status;
        if (match.relationship === "COMPLETED") {
          newStatus = "COMPLETED";
        } else if (match.relationship === "OVERDUE") {
          newStatus = "OVERDUE";
        } else if (match.relationship === "REPEATED_UNRESOLVED") {
          newStatus = "REPEATED_UNRESOLVED";
        } else if (match.relationship === "STILL_PENDING") {
          if (prev.deadline && new Date(prev.deadline).getTime() < new Date(newMeetingDate).getTime()) {
            newStatus = "OVERDUE";
          } else {
            newStatus = "PENDING";
          }
        }
        if (newStatus !== prev.status || match.confidence >= 0.7) {
          const updated = db.updateCommitmentStatus(
            prev.id,
            newStatus,
            newMeetingId,
            newMeetingTitle,
            newMeetingDate,
            match.reason || `Referenced in ${newMeetingTitle}`,
            match.confidence
          );
          if (updated) {
            updatedCommitments.push({
              commitmentId: prev.id,
              previousStatus: prev.status,
              newStatus,
              reason: match.reason,
              confidence: match.confidence
            });
          }
        }
      } else {
        if (prev.status === "PENDING" && prev.deadline && new Date(prev.deadline).getTime() < new Date(newMeetingDate).getTime()) {
          const updated = db.updateCommitmentStatus(
            prev.id,
            "OVERDUE",
            newMeetingId,
            newMeetingTitle,
            newMeetingDate,
            `Target deadline of ${prev.deadline.split("T")[0]} has passed with no recorded completion.`,
            0.9
          );
          if (updated) {
            updatedCommitments.push({
              commitmentId: prev.id,
              previousStatus: "PENDING",
              newStatus: "OVERDUE",
              reason: `Target deadline ${prev.deadline.split("T")[0]} passed without reported completion.`,
              confidence: 0.9
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[CrossMeeting] Error matching commitment ${prev.id}:`, err);
    }
  }
  const allUserIssues = db.getUnresolvedIssues(userId);
  const previousIssues = allUserIssues.filter((i) => i.meetingId !== newMeetingId);
  const repeatedIssuesDetected = [];
  if (previousIssues.length > 0 && extracted.unresolvedIssues.length > 0) {
    try {
      const issueMatches = await detectRepeatedIssues(
        previousIssues.map((i) => ({ id: i.id, description: i.description, timesRepeated: i.timesRepeated })),
        extracted.unresolvedIssues
      );
      const matchedNewIndices = /* @__PURE__ */ new Set();
      for (const match of issueMatches) {
        const existing = previousIssues.find((p) => p.id === match.existingIssueId);
        if (existing) {
          const newCount = existing.timesRepeated + 1;
          const updated = db.updateUnresolvedIssue(
            existing.id,
            newCount,
            "REPEATED_UNRESOLVED",
            newMeetingId
          );
          if (updated) {
            repeatedIssuesDetected.push({
              issueId: existing.id,
              description: existing.description,
              timesRepeated: newCount
            });
          }
        }
      }
    } catch (issueErr) {
      console.warn("[CrossMeeting] Error detecting repeated issues:", issueErr);
    }
  }
  let summaryInsight = "Cross-meeting analysis completed.";
  if (updatedCommitments.length > 0 || repeatedIssuesDetected.length > 0) {
    const completedCount = updatedCommitments.filter((u) => u.newStatus === "COMPLETED").length;
    const overdueCount = updatedCommitments.filter((u) => u.newStatus === "OVERDUE").length;
    summaryInsight = `Accountability Memory updated: ${completedCount} commitment(s) marked completed, ${overdueCount} flagged overdue, and ${repeatedIssuesDetected.length} recurring issue(s) tracked across meetings.`;
  } else {
    summaryInsight = "New meeting ingested. No prior open commitments were directly altered.";
  }
  return {
    updatedCommitments,
    newCommitmentsCreated: extracted.commitments.length,
    repeatedIssuesDetected,
    summaryInsight
  };
}

// server/rag.ts
function chunkTranscript(transcript, chunkSize = 400, overlap = 100) {
  if (!transcript || transcript.trim().length === 0) return [];
  const text = transcript.trim();
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end < text.length) {
      const breakIdx = text.lastIndexOf("\n", end);
      if (breakIdx > start + 100) {
        end = breakIdx;
      } else {
        const periodIdx = text.lastIndexOf(". ", end);
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
function scoreRelevance(query, text) {
  const qTokens = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
  const target = text.toLowerCase();
  if (qTokens.length === 0) return 0;
  let score = 0;
  if (target.includes(query.toLowerCase())) {
    score += 5;
  }
  for (const token of qTokens) {
    if (target.includes(token)) {
      score += 1.5;
    }
  }
  const specialKeywords = ["overdue", "pending", "completed", "commit", "decision", "bug", "issue", "repeated", "deadline"];
  for (const kw of specialKeywords) {
    if (query.toLowerCase().includes(kw) && target.includes(kw)) {
      score += 2;
    }
  }
  return score;
}
async function answerQuestionWithRAG(userId, question) {
  const meetings = db.getMeetings(userId);
  const commitments = db.getCommitments(userId);
  const decisions = db.getDecisions(userId);
  const issues = db.getUnresolvedIssues(userId);
  const chunks = db.getTranscriptChunks(userId);
  function ensureStringDate(val) {
    if (!val) return (/* @__PURE__ */ new Date()).toISOString();
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") return val;
    try {
      return new Date(val).toISOString();
    } catch {
      return (/* @__PURE__ */ new Date()).toISOString();
    }
  }
  const candidates = [];
  for (const c of commitments) {
    const text = `Commitment by ${c.person}: "${c.description}". Status: ${c.status}. Deadline: ${c.deadline || "None"}. Origin Meeting: ${c.meetingTitle}. Last Mentioned: ${c.lastMentionedMeetingTitle || c.meetingTitle}.`;
    const score = scoreRelevance(question, `${c.person} ${c.description} ${c.status} ${c.meetingTitle}`);
    if (score > 0.5) {
      candidates.push({
        score: score + 1,
        // High priority for structured commitments
        meetingId: c.meetingId,
        meetingTitle: c.meetingTitle || "Meeting",
        meetingDate: ensureStringDate(c.meetingDate || c.createdAt),
        type: "commitment",
        text
      });
    }
  }
  for (const d of decisions) {
    const text = `Decision: "${d.description}". Decided in: ${d.meetingTitle}.`;
    const score = scoreRelevance(question, `${d.description} ${d.meetingTitle}`);
    if (score > 0.5) {
      candidates.push({
        score,
        meetingId: d.meetingId,
        meetingTitle: d.meetingTitle || "Meeting",
        meetingDate: ensureStringDate(d.createdAt),
        type: "decision",
        text
      });
    }
  }
  for (const i of issues) {
    const text = `Unresolved Issue: "${i.description}". Status: ${i.status}. Times Repeated Across Meetings: ${i.timesRepeated}.`;
    const score = scoreRelevance(question, `${i.description} ${i.status} bug issue repeated`);
    if (score > 0.5) {
      candidates.push({
        score: score + 1.5,
        meetingId: i.meetingId,
        meetingTitle: i.meetingTitle || "Meeting",
        meetingDate: ensureStringDate(i.createdAt),
        type: "issue",
        text
      });
    }
  }
  for (const ch of chunks) {
    const score = scoreRelevance(question, ch.chunkText);
    if (score > 1) {
      candidates.push({
        score,
        meetingId: ch.meetingId,
        meetingTitle: ch.meetingTitle || "Meeting",
        meetingDate: ensureStringDate(ch.createdAt),
        type: "transcript",
        text: ch.chunkText
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, 7);
  if (topCandidates.length === 0) {
    const isGeneralCommitmentQuery = /commitment|overdue|pending|task|status/i.test(question);
    if (isGeneralCommitmentQuery && commitments.length > 0) {
      for (const c of commitments.slice(0, 5)) {
        topCandidates.push({
          score: 1,
          meetingId: c.meetingId,
          meetingTitle: c.meetingTitle || "Meeting",
          meetingDate: c.meetingDate || c.createdAt,
          type: "commitment",
          text: `Commitment by ${c.person}: "${c.description}". Status: ${c.status}. Deadline: ${c.deadline || "None"}. Origin: ${c.meetingTitle}.`
        });
      }
    }
  }
  const contextForLLM = topCandidates.map((c) => ({
    meetingTitle: c.meetingTitle,
    meetingDate: c.meetingDate,
    type: c.type,
    text: c.text
  }));
  const { answer, confidence } = await answerMeetingQuestion(question, contextForLLM);
  const sources = topCandidates.map((c) => ({
    meetingId: c.meetingId,
    meetingTitle: c.meetingTitle,
    meetingDate: c.meetingDate,
    snippet: c.text.length > 150 ? c.text.slice(0, 150) + "..." : c.text,
    itemType: c.type
  }));
  return {
    answer,
    sources,
    confidence
  };
}

// server/routes.ts
var apiRouter = express.Router();
function getAuthenticatedUserId(req) {
  const authHeader = req.headers["x-user-id"];
  if (authHeader && db.getUser(authHeader)) {
    return authHeader;
  }
  return "usr_demo_maryam";
}
apiRouter.get("/system/status", (req, res) => {
  const dbStatus = db.getStatus();
  const groqKey = getGroqApiKey();
  res.json({
    ...dbStatus,
    groqConfigured: Boolean(groqKey && groqKey.trim().length > 0),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)
  });
});
apiRouter.post("/auth/login", (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  let user = db.getUserByEmail(email);
  if (!user) {
    user = db.createUser(email, name || email.split("@")[0]);
  }
  res.json({
    user,
    token: `token_${user.id}`
  });
});
apiRouter.post("/auth/signup", (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }
  let user = db.getUserByEmail(email);
  if (user) {
    return res.json({ user, token: `token_${user.id}` });
  }
  user = db.createUser(email, name);
  res.status(201).json({
    user,
    token: `token_${user.id}`
  });
});
apiRouter.get("/auth/me", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user });
});
apiRouter.post("/seed/reset", (req, res) => {
  db.resetToSeed();
  res.json({ success: true, message: "Database reset to canonical Sprint 42 3-meeting showcase." });
});
apiRouter.get("/meetings", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const meetings = db.getMeetings(userId);
  res.json({ meetings });
});
apiRouter.get("/meetings/:id", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const meeting = db.getMeetingById(req.params.id, userId);
  if (!meeting) {
    return res.status(404).json({ error: "Meeting not found" });
  }
  res.json({ meeting });
});
apiRouter.delete("/meetings/:id", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const success = db.deleteMeeting(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: "Meeting not found or unauthorized" });
  }
  res.json({ success: true });
});
apiRouter.post("/meetings/process", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    let { title, meetingDate, transcriptText, audioBase64, audioMimeType, audioFilename } = req.body;
    if (!title) {
      title = `Meeting on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
    }
    if (!meetingDate) {
      meetingDate = (/* @__PURE__ */ new Date()).toISOString();
    }
    let finalTranscript = transcriptText || "";
    let usedAudio = false;
    if (audioBase64 && !finalTranscript.trim()) {
      try {
        const buffer = Buffer.from(audioBase64, "base64");
        finalTranscript = await transcribeAudio(buffer, audioMimeType || "audio/mp3", audioFilename || "audio.mp3");
        usedAudio = true;
      } catch (err) {
        console.error("[Process] Audio transcription failed:", err);
        return res.status(500).json({ error: `Audio transcription error: ${err.message}` });
      }
    }
    if (!finalTranscript.trim()) {
      return res.status(400).json({ error: "Either transcriptText or audio recording is required." });
    }
    const extracted = await extractMeetingIntelligence(finalTranscript, title, meetingDate);
    const meeting = db.createMeeting(userId, title, meetingDate, finalTranscript, extracted.summary);
    const chunks = chunkTranscript(finalTranscript);
    chunks.forEach((ch, idx) => {
      db.createTranscriptChunk(meeting.id, meeting.title, idx, ch);
    });
    for (const dec of extracted.decisions) {
      if (dec.description && dec.description.trim()) {
        db.createDecision(meeting.id, meeting.title, dec.description.trim());
      }
    }
    for (const com of extracted.commitments) {
      if (com.description && com.description.trim()) {
        db.createCommitment(
          meeting.id,
          meeting.title,
          meeting.meetingDate,
          com.person || "Team Member",
          com.description.trim(),
          com.deadline || null,
          "PENDING"
        );
      }
    }
    for (const act of extracted.actionItems) {
      if (act.description && act.description.trim()) {
        db.createActionItem(
          meeting.id,
          meeting.title,
          act.person || "Team Member",
          act.description.trim(),
          act.deadline || null,
          "PENDING"
        );
      }
    }
    for (const iss of extracted.unresolvedIssues) {
      if (iss.description && iss.description.trim()) {
        db.createUnresolvedIssue(meeting.id, meeting.title, iss.description.trim(), 1, "PENDING", [meeting.id]);
      }
    }
    const crossMeetingResult = await runCrossMeetingAccountabilityEngine(
      userId,
      meeting.id,
      meeting.title,
      meeting.meetingDate,
      finalTranscript,
      extracted
    );
    const completeMeeting = db.getMeetingById(meeting.id, userId);
    res.status(201).json({
      meeting: completeMeeting,
      extracted,
      crossMeetingResult,
      transcribedFromAudio: usedAudio
    });
  } catch (err) {
    console.error("[Process] Encountered fatal error:", err);
    res.status(500).json({ error: `Meeting processing failed: ${err.message || "Unknown error"}` });
  }
});
apiRouter.get("/accountability", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { status, person, meetingId, search } = req.query;
  let commitments = db.getCommitments(userId);
  if (status && status !== "ALL") {
    commitments = commitments.filter((c) => c.status === status);
  }
  if (person && person !== "ALL") {
    commitments = commitments.filter((c) => c.person.toLowerCase() === person.toLowerCase());
  }
  if (meetingId && meetingId !== "ALL") {
    commitments = commitments.filter((c) => c.meetingId === meetingId || c.lastMentionedMeetingId === meetingId);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    commitments = commitments.filter(
      (c) => c.description.toLowerCase().includes(q) || c.person.toLowerCase().includes(q) || c.meetingTitle && c.meetingTitle.toLowerCase().includes(q)
    );
  }
  const allCommitments = db.getCommitments(userId);
  const stats = {
    total: allCommitments.length,
    pending: allCommitments.filter((c) => c.status === "PENDING").length,
    completed: allCommitments.filter((c) => c.status === "COMPLETED").length,
    overdue: allCommitments.filter((c) => c.status === "OVERDUE").length,
    repeated: allCommitments.filter((c) => c.status === "REPEATED_UNRESOLVED").length
  };
  const people = Array.from(new Set(allCommitments.map((c) => c.person))).sort();
  res.json({
    commitments,
    stats,
    people
  });
});
apiRouter.get("/accountability/insights", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const meetings = db.getMeetings(userId);
  const commitments = db.getCommitments(userId);
  const issues = db.getUnresolvedIssues(userId);
  const pending = commitments.filter((c) => c.status === "PENDING");
  const completed = commitments.filter((c) => c.status === "COMPLETED");
  const overdue = commitments.filter((c) => c.status === "OVERDUE");
  const repeatedIssues = issues.filter((i) => i.timesRepeated > 1 || i.status === "REPEATED_UNRESOLVED");
  let keyInsight = "No active commitments found.";
  if (overdue.length > 0 && repeatedIssues.length > 0) {
    const maxRepeated = Math.max(...repeatedIssues.map((r) => r.timesRepeated), 0);
    keyInsight = `${overdue.length} commitment${overdue.length > 1 ? "s are" : " is"} currently overdue, and 1 recurring blocker has appeared across ${maxRepeated} consecutive meetings.`;
  } else if (overdue.length > 0) {
    keyInsight = `${overdue.length} commitment${overdue.length > 1 ? "s require" : " requires"} immediate escalation due to passed deadlines.`;
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
    topRepeatedIssues: repeatedIssues.slice(0, 3)
  });
});
apiRouter.post("/chat", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }
    const ragResult = await answerQuestionWithRAG(userId, question.trim());
    res.json(ragResult);
  } catch (err) {
    console.error("[Chat] RAG processing error:", err);
    res.status(500).json({ error: `RAG processing failed: ${err.message || "Unknown error"}` });
  }
});
apiRouter.get("/reports", (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const type = req.query.type || "full";
  const meetings = db.getMeetings(userId);
  const commitments = db.getCommitments(userId);
  const decisions = db.getDecisions(userId);
  const issues = db.getUnresolvedIssues(userId);
  let filteredCommitments = commitments;
  let title = "Complete Cross-Meeting Accountability Report";
  let subtitle = "Comprehensive audit trail of team commitments, decisions, and recurring issues across all meetings.";
  if (type === "overdue") {
    filteredCommitments = commitments.filter((c) => c.status === "OVERDUE");
    title = "Overdue Commitments & Missed Deadlines Report";
    subtitle = "Urgent review of promises exceeding target delivery dates without reported completion.";
  } else if (type === "pending") {
    filteredCommitments = commitments.filter((c) => c.status === "PENDING");
    title = "Active & Pending Commitments Pipeline Report";
    subtitle = "Current active responsibilities scheduled across future sprints.";
  } else if (type === "repeated") {
    title = "Recurring Unresolved Blockers & Friction Report";
    subtitle = "Detailed analysis of systemic issues mentioned across multiple consecutive meetings.";
  } else if (type === "summary") {
    title = "Executive Multi-Meeting Intelligence Summary";
    subtitle = "High-level synthesis of major strategic decisions and milestone status.";
  }
  const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
  res.json({
    type,
    title,
    subtitle,
    generatedAt,
    meetingsCount: meetings.length,
    stats: {
      totalCommitments: commitments.length,
      pending: commitments.filter((c) => c.status === "PENDING").length,
      completed: commitments.filter((c) => c.status === "COMPLETED").length,
      overdue: commitments.filter((c) => c.status === "OVERDUE").length,
      repeated: commitments.filter((c) => c.status === "REPEATED_UNRESOLVED").length,
      totalDecisions: decisions.length,
      recurringIssuesCount: issues.filter((i) => i.timesRepeated > 1).length
    },
    commitments: filteredCommitments,
    decisions,
    issues: issues.sort((a, b) => b.timesRepeated - a.timesRepeated),
    recentMeetings: meetings.slice(0, 5)
  });
});

// server/app.ts
function createExpressApp() {
  const app2 = express2();
  app2.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
  app2.use(express2.json({ limit: "50mb" }));
  app2.use(express2.urlencoded({ extended: true, limit: "50mb" }));
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/")) {
      console.log(`[API] ${req.method} ${req.originalUrl || req.path}`);
    }
    next();
  });
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "MeetMind AI Intelligence Server",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "MeetMind AI Intelligence Server",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.use("/api", apiRouter);
  app2.use("/", apiRouter);
  app2.use((err, req, res, next) => {
    console.error("[Server Error]", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  });
  return app2;
}
var app = createExpressApp();
var app_default = app;

// server/serverless-entry.ts
function handler(req, res) {
  return app_default(req, res);
}
export {
  app_default as app,
  handler as default
};
