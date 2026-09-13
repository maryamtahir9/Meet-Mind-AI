import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ClockAlert,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { fetchMeetings, deleteMeeting } from '../../lib/api';
import { Meeting } from '../../types';

interface MeetingsListProps {
  onSelectMeeting: (meetingId: string) => void;
  onNewMeeting: () => void;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({ onSelectMeeting, onNewMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this meeting and its extracted memory?')) {
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-950/60 pb-5">
        <div>
          <h1 className="font-['Outfit'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Meeting Repository
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Recorded and transcribed cross-meeting memory.
          </p>
        </div>
        <button
          onClick={onNewMeeting}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Ingest Meeting</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mt-5 flex items-center rounded-xl border border-rose-950/60 bg-[#140e16]/80 px-3.5 py-2 backdrop-blur-sm">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meetings by title, commitments, decisions..."
          className="ml-2.5 w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="mt-12 text-center text-xs text-zinc-400">Loading meeting memories...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-rose-500/30" />
          <h3 className="mt-3 text-sm font-bold text-zinc-200">No Meetings Found</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            Ingest your first audio recording or transcript to begin tracking commitments.
          </p>
          <button
            onClick={onNewMeeting}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-xs font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Meeting</span>
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMeeting(m.id)}
              className="group flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-rose-950/60 bg-[#140e16]/80 p-4 transition hover:border-rose-800/60 hover:bg-[#19101d] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition">
                    {m.title}
                  </h3>
                  <span className="flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400 font-medium">
                    <Calendar className="h-3 w-3 text-orange-400" />
                    {new Date(m.meetingDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-300 line-clamp-2 leading-relaxed">{m.summary}</p>

                {/* Badges */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-medium text-rose-300">
                    {m.commitments?.length || 0} Commitments
                  </span>
                  <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-medium text-orange-300">
                    {m.decisions?.length || 0} Decisions
                  </span>
                  <span className="rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 font-medium text-zinc-300">
                    {m.actionItems?.length || 0} Actions
                  </span>
                  {m.unresolvedIssues && m.unresolvedIssues.length > 0 && (
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 font-medium text-amber-300">
                      {m.unresolvedIssues.length} Blockers
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, m.id)}
                  title="Delete meeting"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:translate-x-0.5 transition">
                  <span>View</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
