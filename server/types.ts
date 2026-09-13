export type ItemStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'REPEATED_UNRESOLVED';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  previousStatus: ItemStatus;
  newStatus: ItemStatus;
  reason: string;
  confidence: number;
  timestamp: string;
}

export interface Commitment {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  meetingDate?: string;
  person: string;
  description: string;
  deadline: string | null;
  status: ItemStatus;
  lastMentionedMeetingId: string | null;
  lastMentionedMeetingTitle?: string;
  confidence: number;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  description: string;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  person: string;
  description: string;
  deadline: string | null;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UnresolvedIssue {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  description: string;
  timesRepeated: number;
  status: ItemStatus;
  relatedMeetingIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptChunk {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  chunkText: string;
  chunkIndex: number;
  createdAt: string;
}

export interface Meeting {
  id: string;
  userId: string;
  title: string;
  meetingDate: string;
  transcriptText: string;
  summary: string;
  commitments: Commitment[];
  decisions: Decision[];
  actionItems: ActionItem[];
  unresolvedIssues: UnresolvedIssue[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionResult {
  summary: string;
  decisions: Array<{ description: string }>;
  commitments: Array<{ person: string; description: string; deadline: string | null }>;
  actionItems: Array<{ person: string; description: string; deadline: string | null }>;
  unresolvedIssues: Array<{ description: string }>;
}

export interface CommitmentMatch {
  previousCommitmentId: string;
  newItemDescription: string;
  relationship: 'COMPLETED' | 'STILL_PENDING' | 'OVERDUE' | 'REPEATED_UNRESOLVED' | 'NOT_RELATED';
  confidence: number;
  reason: string;
}

export interface CrossMeetingAnalysisResult {
  updatedCommitments: Array<{
    commitmentId: string;
    previousStatus: ItemStatus;
    newStatus: ItemStatus;
    reason: string;
    confidence: number;
  }>;
  newCommitmentsCreated: number;
  repeatedIssuesDetected: Array<{
    issueId: string;
    description: string;
    timesRepeated: number;
  }>;
  summaryInsight: string;
}

export interface RAGSource {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  snippet: string;
  itemType: 'transcript' | 'commitment' | 'decision' | 'actionItem' | 'issue';
}

export interface RAGAnswer {
  answer: string;
  sources: RAGSource[];
  confidence: number;
}
