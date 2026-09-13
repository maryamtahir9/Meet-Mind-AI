import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClockAlert,
  Repeat,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Flame,
  ChevronRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { fetchDashboardInsights, fetchMeetings, fetchAccountability } from '../../lib/api';
import { DashboardInsights, Meeting, Commitment } from '../../types';

interface DashboardProps {
  onNavigateTab: (tab: string, meetingId?: string) => void;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, userName = 'Maryam' }) => {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [timelineCommitments, setTimelineCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ins, mtgs, acc] = await Promise.all([
        fetchDashboardInsights(),
        fetchMeetings(),
        fetchAccountability({ status: 'ALL' }),
      ]);
      setInsights(ins);
      setMeetings(mtgs);
      const sorted = [...acc.commitments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTimelineCommitments(sorted);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !insights) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <RefreshCw className="h-5 w-5 animate-spin text-rose-500" />
          <span className="text-sm">Connecting intelligence memory...</span>
        </div>
      </div>
    );
  }

  const totalComm = (insights?.activeCommitments || 0) + (insights?.completedCommitments || 0);
  const compPercent = totalComm > 0 ? Math.round(((insights?.completedCommitments || 0) / totalComm) * 100) : 0;
  const overduePercent = totalComm > 0 ? Math.round(((insights?.overdueCommitments || 0) / totalComm) * 100) : 0;
  const pendingCount = (insights?.activeCommitments || 0) - (insights?.overdueCommitments || 0);
  const pendingPercent = totalComm > 0 ? Math.round((Math.max(0, pendingCount) / totalComm) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-950/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-['Outfit'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Workspace Overview
            </h1>
            <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-300">
              Live
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Cross-meeting accountability ledger for team deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('reports')}
            className="rounded-lg border border-rose-950/60 bg-[#161019] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-rose-900/40 hover:text-white"
          >
            Export Report
          </button>
          <button
            onClick={() => onNavigateTab('new-meeting')}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Meeting</span>
          </button>
        </div>
      </div>

      {/* Cross-Meeting AI Highlight Card */}
      <div className="mt-5 rounded-2xl border border-rose-900/40 bg-gradient-to-r from-rose-950/30 via-[#180f1b] to-orange-950/25 p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 p-2 text-rose-400 border border-rose-500/30">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                Cross-Meeting Intelligence
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">Groq GPT-120B Memory</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed">
              {insights?.keyInsight ||
                'MeetMind tracks commitments across meetings, flagging bottlenecks and status shifts automatically.'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-rose-950/50 bg-[#140e16]/80 p-3.5 transition hover:border-rose-900/40">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Meetings</span>
            <Calendar className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-white">{insights?.totalMeetings || 0}</p>
          <p className="text-[10px] text-zinc-500">Recorded sessions</p>
        </div>

        <div className="rounded-xl border border-rose-950/50 bg-[#140e16]/80 p-3.5 transition hover:border-rose-900/40">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Active</span>
            <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-white">{insights?.activeCommitments || 0}</p>
          <p className="text-[10px] text-zinc-500">In-progress items</p>
        </div>

        <div className="rounded-xl border border-emerald-950/40 bg-[#140e16]/80 p-3.5 transition hover:border-emerald-900/40">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-emerald-400">
            {insights?.completedCommitments || 0}
          </p>
          <p className="text-[10px] text-emerald-500/70">Verified deliverables</p>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-[#180d15]/80 p-3.5 transition hover:border-rose-800/60">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Overdue</span>
            <ClockAlert className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-rose-400">
            {insights?.overdueCommitments || 0}
          </p>
          <p className="text-[10px] text-rose-400/80">Follow-up needed</p>
        </div>

        <div className="rounded-xl border border-orange-950/50 bg-[#140e16]/80 p-3.5 transition hover:border-orange-900/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Blockers</span>
            <Repeat className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-orange-400">
            {insights?.repeatedIssuesCount || 0}
          </p>
          <p className="text-[10px] text-orange-400/80">Repeated across mtgs</p>
        </div>
      </div>

      {/* Middle Grid: Accountability & Urgent Attention */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Accountability Status */}
        <div className="rounded-2xl border border-rose-950/50 bg-[#140e16]/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Deliverable Distribution</h2>
            <button
              onClick={() => onNavigateTab('accountability')}
              className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              <span>Ledger</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Distribution Bar */}
          <div className="mt-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#1e1320]">
              <div
                style={{ width: `${compPercent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Completed: ${compPercent}%`}
              />
              <div
                style={{ width: `${pendingPercent}%` }}
                className="bg-gradient-to-r from-orange-400 to-rose-400 transition-all duration-500"
                title={`In Progress: ${pendingPercent}%`}
              />
              <div
                style={{ width: `${overduePercent}%` }}
                className="bg-rose-600 transition-all duration-500"
                title={`Overdue: ${overduePercent}%`}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-emerald-950/50 bg-emerald-950/20 p-2">
                <span className="block font-bold text-emerald-400">{compPercent}%</span>
                <span className="text-[10px] text-zinc-400">Finished</span>
              </div>
              <div className="rounded-lg border border-orange-950/50 bg-orange-950/20 p-2">
                <span className="block font-bold text-orange-400">{pendingPercent}%</span>
                <span className="text-[10px] text-zinc-400">Pending</span>
              </div>
              <div className="rounded-lg border border-rose-950/50 bg-rose-950/20 p-2">
                <span className="block font-bold text-rose-400">{overduePercent}%</span>
                <span className="text-[10px] text-zinc-400">Delayed</span>
              </div>
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="mt-6 border-t border-rose-950/40 pt-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Recent Sessions</h3>
            <div className="mt-2.5 space-y-2">
              {meetings.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  onClick={() => onNavigateTab('meeting-detail', m.id)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-rose-950/40 bg-[#160f18]/60 p-3 transition hover:border-rose-800/40 hover:bg-[#1c1220]"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-rose-300">
                        {m.title}
                      </span>
                      <span className="rounded bg-rose-950/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        {new Date(m.meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">{m.summary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-500/20">
                      {m.commitments?.length || 0} commitments
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-rose-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urgent Attention Panel */}
        <div className="rounded-2xl border border-rose-950/50 bg-[#140e16]/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-rose-400">
            <Flame className="h-4 w-4" />
            <h2 className="text-sm font-bold text-white">Action Required</h2>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {insights?.urgentItems && insights.urgentItems.length > 0 ? (
              insights.urgentItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-200">{item.person}</span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 uppercase">
                      Delayed
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-300 line-clamp-2">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-rose-300/70">
                    <span>Due: {item.deadline ? item.deadline.split('T')[0] : 'Open'}</span>
                    <button
                      onClick={() => onNavigateTab('accountability')}
                      className="font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Audit →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-rose-950/40 bg-[#160f18]/40 p-4 text-center text-xs text-zinc-400">
                All deliverables on schedule.
              </div>
            )}

            {/* Recurring Issue */}
            {insights?.topRepeatedIssues && insights.topRepeatedIssues.length > 0 && (
              <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-orange-300">
                    <Repeat className="h-3 w-3" /> Unresolved Blocker
                  </span>
                  <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-300">
                    {insights.topRepeatedIssues[0].timesRepeated}x Repeated
                  </span>
                </div>
                <p className="mt-1 text-zinc-300 line-clamp-2">{insights.topRepeatedIssues[0].description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commitment Timeline */}
      <div className="mt-6 rounded-2xl border border-rose-950/50 bg-[#140e16]/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Cross-Meeting Timeline</h2>
            <p className="text-[11px] text-zinc-400">Commitment state transitions across sessions</p>
          </div>
          <button
            onClick={() => onNavigateTab('accountability')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300"
          >
            View All →
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {timelineCommitments.slice(0, 4).map((com) => (
            <div key={com.id} className="relative flex items-start gap-3 border-l-2 border-rose-950/80 pl-3.5 pb-1">
              <span
                className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border border-[#0c090e] ${
                  com.status === 'COMPLETED'
                    ? 'bg-emerald-400'
                    : com.status === 'OVERDUE'
                    ? 'bg-rose-500'
                    : com.status === 'REPEATED_UNRESOLVED'
                    ? 'bg-orange-400'
                    : 'bg-rose-300'
                }`}
              />
              <div className="flex-1 rounded-xl border border-rose-950/40 bg-[#160f18]/60 p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-200">{com.person}</span>
                    <span className="text-[10px] text-zinc-500">• {com.meetingTitle || 'Meeting'}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      com.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : com.status === 'OVERDUE'
                        ? 'bg-rose-500/20 text-rose-300'
                        : com.status === 'REPEATED_UNRESOLVED'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {com.status}
                  </span>
                </div>
                <p className="mt-1 text-zinc-300">{com.description}</p>
                {com.statusHistory && com.statusHistory.length > 1 && (
                  <div className="mt-1.5 rounded bg-[#1f1422] p-2 text-[10px] text-zinc-400">
                    <span className="font-semibold text-rose-300">Status shift:</span>{' '}
                    {com.statusHistory[com.statusHistory.length - 1].reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
