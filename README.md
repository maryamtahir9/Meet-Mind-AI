# MeetMind AI: AI Meeting Accountability and Intelligence System

MeetMind AI is a production-grade meeting intelligence platform designed to bridge information across multiple meetings. Traditional meeting tools generate isolated summaries that teams quickly forget. MeetMind AI solves this problem by maintaining a continuous cross-meeting memory graph that autonomously tracks what team members promised, decided, assigned, completed, delayed, or repeatedly discussed across consecutive meetings.

---

## Executive Summary and Problem Statement

### The Problem
Organizations lose hundreds of engineering and management hours to fragmented follow-ups:
1. Isolated Summaries: Meeting summaries exist as static notes in silos. There is no automated connection between Meeting A (where an API was promised by Friday) and Meeting B (where the API was delayed).
2. Broken Accountability: Commitments made verbally ("I will complete the auth service by Tuesday") lack continuous tracking, resulting in forgotten deliverables and missed deadlines.
3. Repetitive Blockers: Technical and organizational issues are brought up repeatedly across weeks without resolution, yet teams fail to notice the pattern until project velocity crashes.
4. Loss of Context: When leadership asks "What did Ali promise across the last three sprints and was it delivered?", teams must manually comb through transcripts or ticket backlogs.

### The Solution: MeetMind AI
MeetMind AI transforms meeting conversations into an autonomous accountability engine:
- Connects Past and Present: Every newly ingested meeting is evaluated against all historical open commitments.
- Autonomous Status Tracking: Changes statuses from Pending to Completed, Overdue, or Repeated based on conversational evidence.
- Full Audit Trails: Maintains a complete chronological history showing when a commitment was created, when it was mentioned again, why its status changed, and the confidence level of the update.
- Recurring Issue Detection: Employs semantic clustering to flag unresolved issues that appear across two or more meetings.
- Grounded Cross-Meeting RAG: Enables users to query team memory with verifiable, clickable citations pointing to exact meetings and transcript snippets.

---

## Core Capabilities

### 1. Dual-Mode Meeting Ingestion
- Audio Recording Upload: Supports MP3, WAV, M4A, and WebM audio files up to 50MB. Audio is transcribed via the Groq Whisper speech-to-text API.
- Raw Transcript Ingestion: Users can directly paste plain text or formatted conversational transcripts.
- Pre-Loaded Hackathon Presets: Includes a three-meeting scenario (Sprint 42 Kickoff, Mid-Sprint Checkpoint, and Final Review) allowing instant evaluation of the cross-meeting intelligence cycle.

### 2. Structured Intelligence Extraction
The AI engine parses transcripts to produce deterministic, structured JSON models:
- Executive Summary: A concise, high-level summary of the meeting context.
- Commitments: Explicit promises made by individuals, with owner attribution and explicit or inferred deadlines.
- Action Items: Specific tasks assigned during the conversation.
- Decisions: Consensus agreements and architectural decisions reached by the team.
- Unresolved Issues: Blockers and technical challenges raised without immediate resolution.

### 3. Cross-Meeting Accountability Engine
When a new meeting is processed, MeetMind AI does not store it in isolation:
- Scans all historical commitments that are currently in `PENDING` or `OVERDUE` status.
- Evaluates whether the new transcript mentions the progress, delay, or completion of each historical commitment.
- Automatically updates commitment statuses:
  - PENDING: Task remains in progress within its deadline window.
  - COMPLETED: Direct evidence confirms the deliverable was finished and verified.
  - OVERDUE: Target deadline has passed without completion, or explicit delay was stated.
  - REPEATED_UNRESOLVED: Issue or blocker has persisted across multiple meetings.
- Appends an entry to the commitment's `statusHistory` array with the meeting ID, timestamp, explanation, and confidence score.

### 4. Cross-Meeting RAG Memory Assistant
A retrieval-augmented generation (RAG) chat interface that indexes meeting transcripts, decisions, and commitments:
- Semantic search across meeting chunks and structured entities.
- Direct answers to complex multi-meeting questions (e.g., "What did Ali promise and was it delivered?").
- Verifiable citations with meeting titles, dates, and transcript snippets that navigate directly to the relevant meeting details.

### 5. Multi-Format Executive Reporting and PDF Generation
Generates presentation-ready accountability reports with export to PDF:
- Full Accountability Report: Comprehensive view of all deliverables, decisions, and audit trails.
- Overdue Tasks Report: Filtered view of delinquent items needing urgent intervention.
- Pending Commitments Report: Overview of current in-flight engineering deliverables.
- Repeated Issues Report: Summary of unresolved blockers flagged across two or more sessions.

---

## System Architecture

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|       React 18  *  Tailwind CSS  *  Lucide Icons  *  jsPDF Engine       |
+------------------------------------+------------------------------------+
                                     |  HTTP REST / JSON
                                     v
+-------------------------------------------------------------------------+
|                             API GATEWAY                                 |
|                       Express.js Server (Port 3000)                     |
|         Vite Middleware (Development) / Static Files (Production)       |
+------------------+------------------------------+-----------------------+
                   |                              |
                   v                              v
+------------------------------------+ +----------------------------------+
|        AI & INTELLIGENCE LAYER     | |          STORAGE LAYER           |
|  * Groq Whisper (Audio Transcribe) | |  * Prisma ORM                    |
|  * Groq Llama 3.3 70B (Extraction) | |  * Serverless Neon PostgreSQL    |
|  * Gemini 3.8 Flash (Fallback RAG) | |  * Embedded ACID JSON Store      |
|  * Cross-Meeting Analysis Engine   | |    (Zero-config local fallback)  |
|  * Semantic RAG Chunking Service   | |                                  |
+------------------------------------+ +----------------------------------+
```

---

## Technical Stack

### Frontend
- Framework: React 18 with TypeScript and Vite
- Styling: Tailwind CSS
- Typography: Outfit (headings) and Plus Jakarta Sans (body)
- Icons: Lucide React
- Document Generation: jsPDF for client-side vector PDF generation

### Backend and API
- Server Framework: Express.js (TypeScript via tsx in development, esbuild in production)
- Routing: Modular REST endpoints mounted under `/api`
- Environment Management: dotenv

### AI and LLM Services
- Audio Transcription: Groq Whisper (`whisper-large-v3`) with fallback transcription
- Structured Extraction: Groq Llama 3.3 70B Versatile with enforced JSON object mode
- RAG and Synthesis: Google Gemini 3.8 Flash via the official `@google/genai` SDK
- Cross-Meeting Reasoning: Multi-stage prompt pipeline comparing historical commitments to current conversation chunks

### Database and Persistence
- Primary Database: Neon Serverless PostgreSQL
- ORM: Prisma (`prisma/schema.prisma`)
- Hybrid Architecture: Built-in local persistence engine (`/data/meetmind_store.json`) ensuring full offline and zero-setup functionality when external credentials are not configured

---

## Database Schema Design

The Prisma schema defines seven relational models:

```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String
  meetings  Meeting[]
  createdAt DateTime  @default(now())
}

model Meeting {
  id               String            @id @default(uuid())
  userId           String
  user             User              @relation(fields: [userId], references: [id])
  title            String
  meetingDate      DateTime
  transcriptText   String
  summary          String
  commitments      Commitment[]
  decisions        Decision[]
  actionItems      ActionItem[]
  unresolvedIssues UnresolvedIssue[]
  transcriptChunks TranscriptChunk[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model Commitment {
  id                     String      @id @default(uuid())
  meetingId              String
  meeting                Meeting     @relation(fields: [meetingId], references: [id])
  person                 String
  description            String
  deadline               DateTime?
  status                 ItemStatus  @default(PENDING)
  lastMentionedMeetingId String?
  confidence             Float       @default(1.0)
  statusHistory          String      // JSON array of StatusHistoryEntry objects
  createdAt              DateTime    @default(now())
  updatedAt              DateTime    @updatedAt
}

model Decision {
  id          String   @id @default(uuid())
  meetingId   String
  meeting     Meeting  @relation(fields: [meetingId], references: [id])
  description String
  createdAt   DateTime @default(now())
}

model ActionItem {
  id          String     @id @default(uuid())
  meetingId   String
  meeting     Meeting    @relation(fields: [meetingId], references: [id])
  person      String
  description String
  deadline    DateTime?
  status      ItemStatus @default(PENDING)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model UnresolvedIssue {
  id                String     @id @default(uuid())
  meetingId         String
  meeting           Meeting    @relation(fields: [meetingId], references: [id])
  description       String
  timesRepeated     Int        @default(1)
  status            ItemStatus @default(PENDING)
  relatedMeetingIds String     // JSON array of meeting IDs
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
}

model TranscriptChunk {
  id         String   @id @default(uuid())
  meetingId  String
  meeting    Meeting  @relation(fields: [meetingId], references: [id])
  chunkText  String
  chunkIndex Int
  createdAt  DateTime @default(now())
}

enum ItemStatus {
  PENDING
  COMPLETED
  OVERDUE
  REPEATED_UNRESOLVED
}
```

---

## API Reference

### Health and System
- `GET /api/health`
  Returns service status and server timestamp.
- `GET /api/system/status`
  Returns configuration flags for Neon database connectivity, Groq API, Gemini API, total meetings, and total commitments.
- `POST /api/seed/reset`
  Restores the application to the three-meeting Sprint 42 demo dataset.

### Meetings
- `GET /api/meetings`
  Retrieves all processed meetings ordered by meeting date descending.
- `GET /api/meetings/:id`
  Retrieves complete meeting details including commitments, decisions, action items, and issues.
- `DELETE /api/meetings/:id`
  Deletes a meeting, removes associated commitments and chunks, and updates references.
- `POST /api/meetings/process`
  Main ingestion endpoint. Accepts audio base64 or raw transcript, runs extraction, invokes the cross-meeting analysis engine, and saves results.
  Request Body:
  ```json
  {
    "title": "Sprint 43 Planning",
    "meetingDate": "2026-09-15T10:00:00.000Z",
    "transcriptText": "Maryam: Let's review deliverables...",
    "audioBase64": "optional base64 audio string",
    "audioMimeType": "audio/mp3",
    "audioFilename": "meeting.mp3"
  }
  ```

### Accountability and Insights
- `GET /api/accountability`
  Retrieves commitments with optional query filters:
  - `status`: Filter by `ALL`, `PENDING`, `COMPLETED`, `OVERDUE`, or `REPEATED_UNRESOLVED`
  - `person`: Filter by team member name
  - `meetingId`: Filter by origin meeting
  - `search`: Keyword search across descriptions and owners
- `GET /api/accountability/insights`
  Returns KPI metrics, top recurring blockers, urgent overdue items, and high-level AI analysis.

### RAG Chat and Intelligence
- `POST /api/chat`
  Queries the cross-meeting memory graph.
  Request Body:
  ```json
  {
    "question": "What did Ali promise across all meetings?"
  }
  ```
  Response Body:
  ```json
  {
    "answer": "Ali committed to completing the REST and OAuth API by Friday...",
    "sources": [
      {
        "meetingId": "mtg_01",
        "meetingTitle": "Sprint 42 Planning & Architecture Kickoff",
        "meetingDate": "2026-09-02T10:00:00.000Z",
        "snippet": "Ali: I will complete the API by Friday.",
        "itemType": "commitment"
      }
    ],
    "confidence": 0.95
  }
  ```

### Reports
- `GET /api/reports?type=full|overdue|pending|repeated`
  Returns aggregated data structured for report rendering and PDF export.

---

## Evaluation and Demo Walkthrough

The platform includes a built-in three-meeting lifecycle scenario demonstrating cross-meeting accountability:

### Meeting 1: Sprint 42 Architecture Kickoff (September 2, 2026)
- Ali promises: "I will complete the REST API by Friday."
- Sarah promises: "I will build the accountability timeline UI by Tuesday."
- David notes an unresolved blocker: "Authentication session tokens expire prematurely during login."
- Outcome: Ali's commitment is registered as `PENDING` with a deadline of September 5. The login issue is registered with repetition count 1.

### Meeting 2: Mid-Sprint Checkpoint (September 5, 2026)
- Ali reports: "The API is still not completed due to Neon connection pooling contention."
- David reports: "Users still cannot log in consistently. The auth bug remains unresolved."
- Cross-Meeting Engine Action:
  - Evaluates Ali's prior commitment against the new transcript.
  - Automatically flags Ali's deliverable as `OVERDUE` due to missed deadline and explicit delay evidence.
  - Links the login blocker to the previous meeting and increments its frequency counter to 2.

### Meeting 3: Release Review (September 8, 2026)
- Ali reports: "The API is now fully completed, tested, and deployed to staging."
- David reports: "The login issue remains unresolved. This is the third meeting in a row we discussed this."
- Cross-Meeting Engine Action:
  - Transitions Ali's commitment to `COMPLETED` and appends a verified completion record to the audit trail.
  - Escalates the login bug as a high-priority recurring blocker (repetition count 3).

---

## Getting Started

### Prerequisites
- Node.js version 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/meetmind-ai.git
   cd meetmind-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the project root:
   ```env
   # AI Services
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here

   # Database (Optional - defaults to embedded engine if omitted)
   DATABASE_URL=postgresql://user:password@ep-example.neon.tech/neondb?sslmode=require
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

5. Build for Production:
   ```bash
   npm run build
   npm start
   ```

---

## Verification and Testing

To verify codebase integrity and type safety:

```bash
# Run TypeScript compilation checks
npm run lint

# Run production build (Vite + esbuild backend bundling)
npm run build
```

---

## Future Roadmap

- Calendar Integration: Bi-directional synchronization with Google Calendar and Outlook to automatically ingest recordings upon meeting conclusion.
- Jira / Linear Synchronization: Automatically convert extracted commitments into tracked issues with bi-directional status updates.
- Real-Time Live Assistant: In-meeting audio streaming to detect promises and flag contradictory statements as they happen live.
- Multi-Language Support: Extended multilingual extraction and transcription across over 30 languages.

---

## License

This project is licensed under the Apache License, Version 2.0. See the LICENSE file for details.
