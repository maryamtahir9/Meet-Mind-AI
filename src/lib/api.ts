import {
  Meeting,
  Commitment,
  SystemStatus,
  AccountabilityStats,
  RAGSource,
  CrossMeetingResult,
} from '../types';

const API_BASE = '/api';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function resetToDemoSeed(): Promise<void> {
  const res = await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
}

export async function fetchMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE}/meetings`);
  if (!res.ok) throw new Error('Failed to fetch meetings');
  const data = await res.json();
  return data.meetings || [];
}

export async function fetchMeetingById(id: string): Promise<Meeting> {
  const res = await fetch(`${API_BASE}/meetings/${id}`);
  if (!res.ok) throw new Error('Failed to fetch meeting');
  const data = await res.json();
  return data.meeting;
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/meetings/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete meeting');
}

export interface ProcessMeetingPayload {
  title: string;
  meetingDate: string;
  transcriptText?: string;
  audioBase64?: string;
  audioMimeType?: string;
  audioFilename?: string;
}

export interface ProcessMeetingResponse {
  meeting: Meeting;
  extracted: any;
  crossMeetingResult: CrossMeetingResult;
  transcribedFromAudio: boolean;
}

export async function processMeeting(payload: ProcessMeetingPayload): Promise<ProcessMeetingResponse> {
  const res = await fetch(`${API_BASE}/meetings/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to process meeting');
  }
  return res.json();
}

export interface AccountabilityFilters {
  status?: string;
  person?: string;
  meetingId?: string;
  search?: string;
}

export interface AccountabilityResponse {
  commitments: Commitment[];
  stats: AccountabilityStats;
  people: string[];
}

export async function fetchAccountability(filters?: AccountabilityFilters): Promise<AccountabilityResponse> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters?.person && filters.person !== 'ALL') params.set('person', filters.person);
  if (filters?.meetingId && filters.meetingId !== 'ALL') params.set('meetingId', filters.meetingId);
  if (filters?.search) params.set('search', filters.search);

  const res = await fetch(`${API_BASE}/accountability?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch accountability data');
  return res.json();
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

export async function fetchDashboardInsights(): Promise<DashboardInsights> {
  const res = await fetch(`${API_BASE}/accountability/insights`);
  if (!res.ok) throw new Error('Failed to fetch dashboard insights');
  return res.json();
}

export interface ChatResponse {
  answer: string;
  sources: RAGSource[];
  confidence: number;
}

export async function askMeetingMemory(question: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to query meeting memory');
  }
  return res.json();
}

export async function fetchReportData(type: string = 'full'): Promise<any> {
  const res = await fetch(`${API_BASE}/reports?type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch report data');
  return res.json();
}
