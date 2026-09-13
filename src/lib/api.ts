import {
  Meeting,
  Commitment,
  SystemStatus,
  AccountabilityStats,
  RAGSource,
  CrossMeetingResult,
} from '../types';

// Support custom API URL if the frontend is hosted separately on Vercel from the backend
const CUSTOM_URL = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.trim();
const API_BASE = CUSTOM_URL ? `${CUSTOM_URL.replace(/\/+$/, '')}/api` : '/api';

/**
 * Safe fetch wrapper that handles HTML error pages from Vercel / Nginx / Cloudflare
 * and extracts human-readable diagnostic messages instead of crashing with:
 * "Unexpected token 'T', 'The page c'... is not valid JSON"
 */
async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(
      `Network error connecting to backend service (${url}): ${netErr.message}. ` +
      `Please check your internet connection and backend server status.`
    );
  }

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!res.ok) {
    // 1. Check if response is structured JSON error
    if (text && (contentType.includes('application/json') || text.trim().startsWith('{'))) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.error || parsed.message) {
          throw new Error(parsed.error || parsed.message);
        }
      } catch (e: any) {
        if (e.message && !e.message.includes('Unexpected token') && !e.message.includes('not valid JSON')) {
          throw e;
        }
      }
    }

    // 2. Handle specific HTTP statuses on Vercel
    if (res.status === 404) {
      throw new Error(
        `Backend endpoint not found (HTTP 404). ` +
        `If running on Vercel, ensure that serverless functions are active (api/index.ts) and vercel.json routes are deployed. ` +
        `Alternatively, specify your backend server URL in Vercel Project Settings as VITE_API_URL.`
      );
    }
    if (res.status === 504 || res.status === 502) {
      throw new Error(
        `Backend service timeout or gateway error (HTTP ${res.status}). ` +
        `The AI inference model or Neon database may be cold-starting. Please retry in a few seconds.`
      );
    }
    if (res.status === 500) {
      const cleanMsg = text.replace(/<[^>]*>?/gm, '').trim().slice(0, 160);
      throw new Error(
        `Backend internal error (HTTP 500)${cleanMsg ? `: ${cleanMsg}` : ''}. ` +
        `Please verify that GROQ_API_KEY and DATABASE_URL are properly configured.`
      );
    }

    // 3. Fallback for other status codes
    const snippet = text.replace(/<[^>]*>?/gm, '').trim().slice(0, 120);
    throw new Error(`Server returned HTTP ${res.status} (${res.statusText})${snippet ? `: ${snippet}` : ''}`);
  }

  // Handle successful status but unexpected HTML (such as SPA catch-all rewrite returning index.html)
  if (!text || text.trim().length === 0) {
    return {} as T;
  }

  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('The page')) {
    throw new Error(
      `Received HTML webpage instead of JSON data from ${url}. ` +
      `This usually happens when Vercel rewrites the request to index.html because the API function was not found. ` +
      `Ensure vercel.json and api/index.ts are deployed, or configure VITE_API_URL.`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch (err: any) {
    throw new Error(`Invalid JSON received from server: ${err.message}`);
  }
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  return safeFetchJson<SystemStatus>(`${API_BASE}/system/status`);
}

export async function resetToDemoSeed(): Promise<void> {
  await safeFetchJson(`${API_BASE}/seed/reset`, { method: 'POST' });
}

export async function fetchMeetings(): Promise<Meeting[]> {
  const data = await safeFetchJson<{ meetings: Meeting[] }>(`${API_BASE}/meetings`);
  return data.meetings || [];
}

export async function fetchMeetingById(id: string): Promise<Meeting> {
  const data = await safeFetchJson<{ meeting: Meeting }>(`${API_BASE}/meetings/${id}`);
  return data.meeting;
}

export async function deleteMeeting(id: string): Promise<void> {
  await safeFetchJson(`${API_BASE}/meetings/${id}`, { method: 'DELETE' });
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
  return safeFetchJson<ProcessMeetingResponse>(`${API_BASE}/meetings/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
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

  return safeFetchJson<AccountabilityResponse>(`${API_BASE}/accountability?${params.toString()}`);
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
  return safeFetchJson<DashboardInsights>(`${API_BASE}/accountability/insights`);
}

export interface ChatResponse {
  answer: string;
  sources: RAGSource[];
  confidence: number;
}

export async function askMeetingMemory(question: string): Promise<ChatResponse> {
  return safeFetchJson<ChatResponse>(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
}

export async function fetchReportData(type: string = 'full'): Promise<any> {
  return safeFetchJson<any>(`${API_BASE}/reports?type=${type}`);
}
