import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  ClockAlert,
  Repeat,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { fetchAccountability } from '../../lib/api';
import { Commitment, ItemStatus } from '../../types';

interface AccountabilityDashboardProps {
  onSelectMeeting: (id: string) => void;
}

export const AccountabilityDashboard: React.FC<AccountabilityDashboardProps> = ({ onSelectMeeting }) => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPerson, setSelectedPerson] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Expandable row tracking
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAccountability({
        status: selectedStatus,
        person: selectedPerson,
        search: searchQuery,
      });
      setCommitments(data.commitments);
      setPeople(data.people);
    } catch (err) {
      console.error('Failed to load accountability table:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedPerson, searchQuery]);

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Done
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300 border border-rose-500/40">
            <ClockAlert className="h-3 w-3" /> Overdue
          </span>
        );
      case 'REPEATED_UNRESOLVED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
            <Repeat className="h-3 w-3" /> Repeated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/15 px-2 py-0.5 text-[11px] font-bold text-orange-300 border border-orange-500/30">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-rose-950/40 pb-5">
        <h1 className="font-['Outfit'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Accountability Ledger
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Multi-meeting audit trail tracking owner deliverables, commitments, and status shifts.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="flex min-w-[220px] flex-1 items-center rounded-xl border border-rose-950/60 bg-[#140e16]/80 px-3 py-1.5 text-xs">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks, owners, deliverables..."
            className="ml-2 w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-rose-950/60 bg-[#140e16]/80 p-1 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'COMPLETED', label: 'Done' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'REPEATED_UNRESOLVED', label: 'Repeated' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedStatus === st.id
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Person Filter Dropdown */}
        <div className="flex items-center gap-1.5 rounded-xl border border-rose-950/60 bg-[#140e16]/80 px-3 py-1.5 text-xs text-zinc-300">
          <User className="h-3.5 w-3.5 text-rose-400" />
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none"
          >
            <option value="ALL" className="bg-[#140e16]">All Members</option>
            {people.map((p) => (
              <option key={p} value={p} className="bg-[#140e16]">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Accountability Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-rose-950/60 bg-[#140e16]/60 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-rose-950/60 bg-[#100912] text-[10px] uppercase tracking-wider text-rose-300/80 font-bold">
              <tr>
                <th className="py-3 pl-4 pr-2">Owner</th>
                <th className="px-3 py-3">Deliverable</th>
                <th className="px-3 py-3">Origin</th>
                <th className="px-3 py-3">Deadline</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Last Verified</th>
                <th className="py-3 pl-2 pr-4 text-right">Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-950/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-zinc-500">
                    Querying cross-meeting audit trails...
                  </td>
                </tr>
              ) : commitments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-zinc-400">
                    No commitments found matching current filter.
                  </td>
                </tr>
              ) : (
                commitments.map((c) => {
                  const isExpanded = expandedRowId === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      <tr
                        onClick={() => toggleRow(c.id)}
                        className={`group cursor-pointer transition ${
                          isExpanded ? 'bg-rose-950/30' : 'hover:bg-rose-950/20'
                        }`}
                      >
                        {/* Person */}
                        <td className="py-3 pl-4 pr-2 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                              {c.person[0].toUpperCase()}
                            </div>
                            <span>{c.person}</span>
                          </div>
                        </td>

                        {/* Task / Commitment */}
                        <td className="px-3 py-3 font-medium text-zinc-200 max-w-sm">
                          <p className="line-clamp-2">{c.description}</p>
                        </td>

                        {/* Origin Meeting */}
                        <td className="px-3 py-3 text-zinc-400 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMeeting(c.meetingId);
                            }}
                            className="text-xs hover:text-rose-300 hover:underline truncate max-w-[130px] block text-left"
                          >
                            {c.meetingTitle || 'Meeting'}
                          </button>
                        </td>

                        {/* Deadline */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {c.deadline ? (
                            <span
                              className={`text-xs ${
                                c.status === 'OVERDUE'
                                  ? 'font-bold text-rose-400'
                                  : 'text-zinc-300'
                              }`}
                            >
                              {c.deadline.split('T')[0]}
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">{getStatusBadge(c.status)}</td>

                        {/* Last Mentioned */}
                        <td className="px-3 py-3 text-zinc-400 whitespace-nowrap">
                          {c.lastMentionedMeetingTitle ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (c.lastMentionedMeetingId) {
                                   onSelectMeeting(c.lastMentionedMeetingId);
                                }
                              }}
                              className="text-xs hover:text-orange-300 truncate max-w-[130px] block text-left"
                            >
                              {c.lastMentionedMeetingTitle}
                            </button>
                          ) : (
                            <span>{c.meetingTitle || 'Origin'}</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-2 pr-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:text-rose-300">
                            <span>{isExpanded ? 'Hide' : 'Trail'}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Multi-Meeting Trail Accordion */}
                      {isExpanded && (
                        <tr className="bg-[#100912]/90 border-b border-rose-950/60">
                          <td colSpan={7} className="px-5 py-3.5">
                            <div className="rounded-xl border border-rose-950/60 bg-[#160f19] p-3.5">
                              <div className="flex items-center justify-between border-b border-rose-950/50 pb-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
                                  <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                                  Multi-Meeting Timeline & Reasoning
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {c.statusHistory?.length || 1} checkpoints
                                </span>
                              </div>

                              <div className="mt-3 space-y-2.5">
                                {c.statusHistory && c.statusHistory.length > 0 ? (
                                  c.statusHistory.map((step, idx) => (
                                    <div key={idx} className="relative flex items-start gap-2.5 border-l-2 border-rose-500/40 pl-3">
                                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-orange-400" />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="font-bold text-zinc-200">
                                            Checkpoint {idx + 1}: {step.meetingTitle}
                                          </span>
                                          <span className="text-[10px] text-zinc-500">
                                            {new Date(step.timestamp).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                            })}
                                          </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">
                                          {step.reason}
                                        </p>
                                        <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-400">
                                          <span>
                                            Transition:{' '}
                                            <strong className="text-zinc-300">{step.previousStatus}</strong> →{' '}
                                            <strong className="text-emerald-400">{step.newStatus}</strong>
                                          </span>
                                          <span>Confidence: {Math.round(step.confidence * 100)}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-zinc-400">No multi-meeting status shifts recorded yet.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
