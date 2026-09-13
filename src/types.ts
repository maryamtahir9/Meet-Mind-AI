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

export interface SystemStatus {
  connectedToNeon: boolean;
  databaseUrlSet: boolean;
  storageType: string;
  totalUsers: number;
  totalMeetings: number;
  totalCommitments: number;
  groqConfigured: boolean;
  geminiConfigured: boolean;
}

export interface AccountabilityStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  repeated: number;
}

export interface RAGSource {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  snippet: string;
  itemType: 'transcript' | 'commitment' | 'decision' | 'actionItem' | 'issue';
}

export interface RAGMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: RAGSource[];
  timestamp: string;
}

export interface CrossMeetingResult {
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

export interface DashboardInsights {
  totalMeetings: number;
  activeCommitments: number;
  completedCommitments: number;
  overdueCommitments: number;
  repeatedIssuesCount: number;
  keyInsight: string;
  urgentItems: Commitment[];
  topRepeatedIssues: any[];
}
