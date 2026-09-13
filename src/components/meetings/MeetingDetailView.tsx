import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Repeat,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  User,
  ListTodo,
} from 'lucide-react';
import { fetchMeetingById } from '../../lib/api';
import { Meeting, Commitment, ItemStatus } from '../../types';

interface MeetingDetailViewProps {
  meetingId: string;
  onBack: () => void;
  onNavigateMeeting: (id: string) => void;
}

export const MeetingDetailView: React.FC<MeetingDetailViewProps> = ({
  meetingId,
  onBack,
  onNavigateMeeting,
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'commitments' | 'decisions' | 'actions' | 'issues' | 'transcript'>('overview');
  const [expandedCommitmentId, setExpandedCommitmentId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchMeetingById(meetingId);
        if (isMounted) setMeeting(data);
      } catch (err) {
        console.error('Error fetching meeting detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  if (loading || !meeting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-xs text-slate-400">Loading meeting intelligence...</div>
      </div>
    );
  }

  const renderStatusBadge = (status: ItemStatus) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" /> Done
        </span>
      );
    }
    if (status === 'OVERDUE') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
          <AlertCircle className="h-3 w-3" /> Overdue
        </span>
      );
    }
    if (status === 'REPEATED_UNRESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
          <Repeat className="h-3 w-3" /> Repeated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-300 border border-orange-500/30">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-300 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Repository</span>
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/80 p-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20">
                Memory Active
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Calendar className="h-3.5 w-3.5 text-orange-400" />
                {new Date(meeting.meetingDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="mt-1.5 font-['Outfit'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {meeting.title}
            </h1>
          </div>
        </div>

        {/* AI Summary Box */}
        <div className="mt-4 rounded-xl border border-rose-950/50 bg-[#190f1c] p-3.5">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            Executive Summary
          </div>
          <p className="mt-1.5 text-xs text-zinc-200 leading-relaxed sm:text-sm">{meeting.summary}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-6 flex overflow-x-auto border-b border-rose-950/60 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'commitments', label: `Commitments (${meeting.commitments?.length || 0})` },
          { id: 'decisions', label: `Decisions (${meeting.decisions?.length || 0})` },
          { id: 'actions', label: `Action Items (${meeting.actionItems?.length || 0})` },
          { id: 'issues', label: `Blockers (${meeting.unresolvedIssues?.length || 0})` },
          { id: 'transcript', label: 'Transcript' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === tab.id
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Commitments Preview */}
            <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Commitments</h3>
                <button
                  onClick={() => setActiveTab('commitments')}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                >
                  All ({meeting.commitments?.length || 0})
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {meeting.commitments?.slice(0, 3).map((c) => (
                  <div key={c.id} className="rounded-xl border border-rose-950/50 bg-[#19101d] p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200">{c.person}</span>
                      {renderStatusBadge(c.status)}
                    </div>
                    <p className="mt-1 text-zinc-300">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decisions Preview */}
            <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Decisions</h3>
                <button
                  onClick={() => setActiveTab('decisions')}
                  className="text-xs text-orange-400 hover:text-orange-300 hover:underline"
                >
                  All ({meeting.decisions?.length || 0})
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {meeting.decisions?.map((d) => (
                  <div key={d.id} className="rounded-xl border border-rose-950/50 bg-[#19101d] p-2.5 text-xs text-zinc-300">
                    <span className="text-orange-400 font-bold mr-1">✓</span> {d.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COMMITMENTS TAB */}
        {activeTab === 'commitments' && (
          <div className="space-y-2.5">
            {meeting.commitments?.length === 0 ? (
              <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/40 p-8 text-center text-xs text-zinc-400">
                No explicit commitments extracted from this meeting.
              </div>
            ) : (
              meeting.commitments.map((c) => {
                const isExpanded = expandedCommitmentId === c.id;
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-rose-950/60 bg-[#140e16]/80 p-3.5 transition hover:border-rose-800/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-bold text-white">{c.person}</span>
                      </div>
                      {renderStatusBadge(c.status)}
                    </div>

                    <p className="mt-1.5 text-xs text-zinc-200 leading-relaxed font-medium sm:text-sm">
                      {c.description}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400 border-t border-rose-950/60 pt-2">
                      <div className="flex items-center gap-4">
                        <span>
                          Deadline:{' '}
                          <strong className="text-zinc-300">
                            {c.deadline ? c.deadline.split('T')[0] : 'None'}
                          </strong>
                        </span>
                        {c.lastMentionedMeetingTitle && (
                          <span>
                            Verified in:{' '}
                            <strong className="text-zinc-300">{c.lastMentionedMeetingTitle}</strong>
                          </span>
                        )}
                      </div>

                      {c.statusHistory && c.statusHistory.length > 0 && (
                        <button
                          onClick={() => setExpandedCommitmentId(isExpanded ? null : c.id)}
                          className="font-semibold text-rose-400 hover:text-rose-300 transition"
                        >
                          {isExpanded ? 'Hide' : `History (${c.statusHistory.length})`}
                        </button>
                      )}
                    </div>

                    {/* Expandable Multi-Meeting Audit Trail */}
                    {isExpanded && c.statusHistory && (
                      <div className="mt-2.5 rounded-xl border border-rose-950/60 bg-[#19101d] p-3 text-xs space-y-2">
                        <span className="block font-bold uppercase tracking-wider text-[10px] text-rose-300">
                          Continuous Audit Trail
                        </span>
                        {c.statusHistory.map((hist, idx) => (
                          <div key={idx} className="flex items-start justify-between border-l-2 border-rose-500/40 pl-2.5">
                            <div>
                              <p className="text-zinc-200 font-medium">
                                <span className="text-rose-400">{hist.meetingTitle}</span>: {hist.reason}
                              </p>
                              <span className="text-[10px] text-zinc-500">
                                {new Date(hist.timestamp).toLocaleDateString()} • {Math.round(hist.confidence * 100)}% confidence
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400">{hist.newStatus}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* DECISIONS TAB */}
        {activeTab === 'decisions' && (
          <div className="space-y-2">
            {meeting.decisions?.length === 0 ? (
              <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/40 p-8 text-center text-xs text-zinc-400">
                No formal decisions identified in this transcript.
              </div>
            ) : (
              meeting.decisions.map((d) => (
                <div key={d.id} className="flex items-start gap-2.5 rounded-xl border border-rose-950/60 bg-[#140e16]/70 p-3 text-xs text-zinc-200">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                    ✓
                  </span>
                  <p className="leading-relaxed">{d.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ACTION ITEMS TAB */}
        {activeTab === 'actions' && (
          <div className="space-y-2">
            {meeting.actionItems?.map((a) => (
              <div key={a.id} className="rounded-xl border border-rose-950/60 bg-[#140e16]/70 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">{a.person}</span>
                  <span className="text-zinc-400">Due: {a.deadline ? a.deadline.split('T')[0] : 'None'}</span>
                </div>
                <p className="mt-1 text-zinc-300">{a.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* UNRESOLVED ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="space-y-2.5">
            {meeting.unresolvedIssues?.length === 0 ? (
              <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/40 p-8 text-center text-xs text-zinc-400">
                No recurring blockers detected in this meeting.
              </div>
            ) : (
              meeting.unresolvedIssues.map((iss) => (
                <div key={iss.id} className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Repeat className="h-3.5 w-3.5" />
                      Repeated in {iss.timesRepeated} Meetings
                    </span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      {iss.status}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-200 leading-relaxed font-medium">{iss.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TRANSCRIPT TAB */}
        {activeTab === 'transcript' && (
          <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/90 p-4 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {meeting.transcriptText}
          </div>
        )}
      </div>
    </div>
  );
};
