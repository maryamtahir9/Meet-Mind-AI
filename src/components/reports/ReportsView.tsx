import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  ClockAlert,
  Repeat,
  ShieldCheck,
  Sparkles,
  Calendar,
  Filter,
} from 'lucide-react';
import { fetchReportData } from '../../lib/api';
import { generateAccountabilityPDF } from '../../lib/pdf';
import { Commitment, UnresolvedIssue } from '../../types';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<string>('full');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const reportTypes = [
    { id: 'full', label: 'Full Accountability Report', desc: 'Complete multi-meeting commitments, audit trails, and decisions' },
    { id: 'overdue', label: 'Overdue Tasks Report', desc: 'Urgent commitments that have passed deadlines without completion' },
    { id: 'pending', label: 'Pending Commitments Report', desc: 'All active deliverables currently in-flight across the team' },
    { id: 'repeated', label: 'Repeated Issues Report', desc: 'Unresolved technical and organizational blockers appearing in ≥ 2 meetings' },
  ];

  const loadReport = async (type: string) => {
    try {
      setLoading(true);
      const data = await fetchReportData(type);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(reportType);
  }, [reportType]);

  const handleDownloadPDF = () => {
    if (!reportData) return;
    generateAccountabilityPDF({
      title: reportData.title,
      subtitle: reportData.subtitle,
      generatedAt: reportData.generatedAt,
      stats: reportData.stats,
      commitments: reportData.commitments || [],
      issues: reportData.repeatedIssues || [],
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-950/60 pb-5">
        <div>
          <h1 className="font-['Outfit'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Accountability Reports
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Export presentation-grade executive reports.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={loading || !reportData}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 disabled:opacity-50 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Report Type Selector Pills */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((rt) => (
          <button
            key={rt.id}
            onClick={() => setReportType(rt.id)}
            className={`rounded-2xl border p-3.5 text-left transition ${
              reportType === rt.id
                ? 'border-rose-500/60 bg-gradient-to-br from-rose-950/30 to-orange-950/20 shadow-md shadow-rose-950/40'
                : 'border-rose-950/60 bg-[#140e16]/80 hover:border-rose-800/60 hover:bg-[#19101d]'
            }`}
          >
            <h3 className={`text-xs font-bold ${reportType === rt.id ? 'text-rose-300' : 'text-zinc-200'}`}>
              {rt.label}
            </h3>
            <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Live Report Preview Canvas */}
      <div className="mt-6 rounded-2xl border border-rose-950/60 bg-[#140e16]/90 p-5 shadow-2xl backdrop-blur-md sm:p-7">
        {loading || !reportData ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            Compiling accountability data...
          </div>
        ) : (
          <div>
            {/* Header Document Block */}
            <div className="border-b border-rose-950/60 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <span className="font-mono text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                  MeetMind AI Intelligence Output
                </span>
                <span>Generated: {new Date(reportData.generatedAt).toLocaleString()}</span>
              </div>
              <h2 className="mt-2 font-['Outfit'] text-2xl font-extrabold text-white">{reportData.title}</h2>
              <p className="mt-1 text-xs text-zinc-400 max-w-2xl">{reportData.subtitle}</p>
            </div>

            {/* Statistics Banner */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5 text-center text-xs">
              <div className="rounded-xl border border-rose-950/60 bg-[#19101d] p-3">
                <span className="block font-['Outfit'] text-lg font-bold text-white">
                  {reportData.stats.totalCommitments}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Tracked</span>
              </div>
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                <span className="block font-['Outfit'] text-lg font-bold text-emerald-400">
                  {reportData.stats.completed}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Completed</span>
              </div>
              <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-3">
                <span className="block font-['Outfit'] text-lg font-bold text-orange-400">
                  {reportData.stats.pending}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Pending</span>
              </div>
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
                <span className="block font-['Outfit'] text-lg font-bold text-rose-400">
                  {reportData.stats.overdue}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Overdue</span>
              </div>
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 col-span-2 sm:col-span-1">
                <span className="block font-['Outfit'] text-lg font-bold text-amber-400">
                  {reportData.stats.recurringIssuesCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Blockers</span>
              </div>
            </div>

            {/* Commitments Table Preview */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Commitment Roster ({reportData.commitments?.length || 0})
              </h3>
              <div className="mt-2.5 overflow-hidden rounded-xl border border-rose-950/60 bg-[#120a14]/60">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-rose-950/60 bg-[#180e1b] text-[10px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-2 px-3">Person</th>
                      <th className="py-2 px-3">Deliverable</th>
                      <th className="py-2 px-3">Meeting</th>
                      <th className="py-2 px-3">Deadline</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-950/40">
                    {reportData.commitments?.map((c: Commitment) => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap">{c.person}</td>
                        <td className="py-2 px-3 text-zinc-300">{c.description}</td>
                        <td className="py-2 px-3 text-zinc-400 whitespace-nowrap">{c.meetingTitle}</td>
                        <td className="py-2 px-3 text-zinc-400 whitespace-nowrap">
                          {c.deadline ? c.deadline.split('T')[0] : 'None'}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              c.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : c.status === 'OVERDUE'
                                ? 'bg-rose-500/20 text-rose-300'
                                : c.status === 'REPEATED_UNRESOLVED'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-orange-500/20 text-orange-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recurring Issues Section */}
            {reportData.repeatedIssues && reportData.repeatedIssues.length > 0 && (
              <div className="mt-6 border-t border-rose-950/60 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Recurring Blockers
                </h3>
                <div className="mt-2.5 space-y-2">
                  {reportData.repeatedIssues.map((iss: UnresolvedIssue) => (
                    <div
                      key={iss.id}
                      className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">
                          {iss.timesRepeated} Meetings Blocked
                        </span>
                        <span className="text-[10px] text-zinc-400">{iss.status}</span>
                      </div>
                      <p className="mt-1 text-zinc-300">{iss.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
