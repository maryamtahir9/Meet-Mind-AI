import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Mic,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileAudio,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { processMeeting, ProcessMeetingResponse } from '../../lib/api';

interface NewMeetingViewProps {
  onMeetingProcessed: (meetingId: string) => void;
  onNavigateTab: (tab: string) => void;
}

const PRESET_TRANSCRIPTS = [
  {
    label: 'Meeting 1: Ali commits to core API by Friday',
    title: 'Sprint 42 Architecture Kickoff',
    date: '2026-09-02',
    transcript: `Maryam: Good morning team. Let's align on our deliverables for Sprint 42. Ali, what is the status of the OAuth and core REST API endpoints?
Ali: I will complete the API by Friday. I'll make sure all user validation and rate limiting are properly structured.
Sarah: Great. On the frontend, I will build the accountability timeline UI by next Tuesday.
David: We also noticed an authentication bug where session tokens expire prematurely during login.
Ali: Yes, the auth bug is blocking some users intermittently.
Maryam: Okay, we decided to adopt JWT with rotating refresh tokens for the new auth flow. Let's make sure the API is prioritized.`,
  },
  {
    label: 'Meeting 2: Mid-Sprint Sync (API delayed & login bug unresolved)',
    title: 'Mid-Sprint 42 Checkpoint & Blockers Sync',
    date: '2026-09-05',
    transcript: `Maryam: Welcome everyone. Ali, how are we looking with the core API deliverable that was due Friday?
Ali: Unfortunately, the API is still not completed. We ran into database lock contention with Neon connection pooling. I am working through the connection retry logic today.
Maryam: Understood, but this is now pushing back integration tests. What about the login issue?
David: Users still cannot log in consistently. The authentication bug remains unresolved and customers are contacting support.
Sarah: I have finished 80% of the timeline UI and will have the PR up by tomorrow.
Ali: I will prioritize the Neon connection pool bugfix and aim to wrap the API by Sunday evening.`,
  },
  {
    label: 'Meeting 3: Final Review (API completed & login bug 3rd repeat)',
    title: 'Sprint 42 Review & Production Deployment',
    date: '2026-09-08',
    transcript: `Maryam: Let's review our sprint wrap-up. Ali, what is the final state of the core API?
Ali: I am happy to report that the API is now fully completed, tested, and deployed to staging. Neon pooling issues are resolved.
Maryam: That is fantastic news! Ali's API commitment is officially completed.
David: What about the customer login failures?
David: The login issue remains unresolved. Users are still experiencing premature token logouts after 15 minutes. This is the third meeting in a row we have discussed this.
Ali: I will personally take over the session token timeout investigation tomorrow morning.
Maryam: We decided to deploy the staging release to production tomorrow at 10 AM, with emergency monitoring on the auth service.`,
  },
];

const PIPELINE_STAGES = [
  'Transcribing meeting audio...',
  'Generating executive summary...',
  'Extracting commitments & owners...',
  'Detecting deadlines & deliverables...',
  'Finding unresolved issues & blockers...',
  'Comparing with previous meetings (Cross-Meeting Engine)...',
  'Updating accountability statuses & audit trails...',
  'Saving meeting memory into Neon PostgreSQL...',
];

export const NewMeetingView: React.FC<NewMeetingViewProps> = ({ onMeetingProcessed, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'transcript'>('transcript');
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [transcriptText, setTranscriptText] = useState('');

  // Audio file upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [result, setResult] = useState<ProcessMeetingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudioSelect = (file: File) => {
    setAudioFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAudioBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioSelect(e.dataTransfer.files[0]);
    }
  };

  const loadPreset = (preset: (typeof PRESET_TRANSCRIPTS)[0]) => {
    setTitle(preset.title);
    setMeetingDate(preset.date);
    setTranscriptText(preset.transcript);
    setActiveTab('transcript');
    setAudioFile(null);
    setAudioBase64(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptText.trim() && !audioBase64) {
      setError('Please provide a meeting transcript or upload an audio file.');
      return;
    }

    setError(null);
    setProcessing(true);
    setCurrentStageIndex(0);

    // Animate stages interval
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 650);

    try {
      const resp = await processMeeting({
        title: title.trim() || `Meeting on ${meetingDate}`,
        meetingDate: new Date(meetingDate).toISOString(),
        transcriptText: transcriptText.trim() || undefined,
        audioBase64: audioBase64 || undefined,
        audioMimeType: audioFile?.type || 'audio/mp3',
        audioFilename: audioFile?.name,
      });

      clearInterval(interval);
      setCurrentStageIndex(PIPELINE_STAGES.length);
      setResult(resp);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Failed to process meeting');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-rose-950/40 pb-5">
        <h1 className="font-['Outfit'] text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Ingest & Process Meeting
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Upload audio or paste transcripts. MeetMind AI extracts commitments and autonomously links previous meetings.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="mt-5 rounded-2xl border border-rose-950/60 bg-[#160f18] p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            Instant Evaluation Scenarios (Sprint 42)
          </span>
          <span className="text-[10px] text-zinc-400">One-click load</span>
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PRESET_TRANSCRIPTS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="flex items-start gap-2 rounded-xl border border-rose-950/50 bg-[#120b14] p-3 text-left transition hover:border-rose-500/40 hover:bg-[#1a0f1d]"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-200">{preset.title}</p>
                <p className="mt-0.5 text-[10px] text-zinc-400 line-clamp-1">{preset.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Success Modal / Result Banner */}
      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-950/60 bg-emerald-950/20 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <h2 className="text-sm font-bold text-white">Meeting Ingested & Linked</h2>
              <p className="text-[11px] text-emerald-300/80">
                Memorized into Neon PostgreSQL and correlated across past meetings.
              </p>
            </div>
          </div>

          <div className="mt-3.5 rounded-xl border border-rose-950/50 bg-[#140e16]/80 p-3.5 text-xs">
            <p className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Executive Summary</p>
            <p className="mt-1 text-zinc-300 leading-relaxed">{result.meeting.summary}</p>
          </div>

          {/* Cross Meeting Highlights */}
          <div className="mt-3.5 rounded-xl border border-rose-900/40 bg-[#1a0f1c] p-3.5">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              Cross-Meeting Memory Linkage
            </div>
            <p className="mt-1 text-xs text-zinc-200 font-medium">
              {result.crossMeetingResult.summaryInsight}
            </p>

            {result.crossMeetingResult.updatedCommitments.length > 0 && (
              <div className="mt-2.5 space-y-1 border-t border-rose-950/60 pt-2">
                <span className="text-[10px] font-semibold text-rose-300">Updated Prior Deliverables:</span>
                {result.crossMeetingResult.updatedCommitments.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-zinc-300">
                    <span>
                      Transition: <span className="text-zinc-500 line-through">{u.previousStatus}</span>{' '}
                      → <strong className="text-emerald-400">{u.newStatus}</strong>
                    </span>
                    <span className="text-[10px] text-zinc-400">{u.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center text-xs">
            <div className="rounded-lg border border-rose-950/50 bg-[#140e16]/80 p-2">
              <span className="block font-bold text-rose-300">{result.meeting.commitments.length}</span>
              <span className="text-[10px] text-zinc-400">Commitments</span>
            </div>
            <div className="rounded-lg border border-rose-950/50 bg-[#140e16]/80 p-2">
              <span className="block font-bold text-orange-300">{result.meeting.decisions.length}</span>
              <span className="text-[10px] text-zinc-400">Decisions</span>
            </div>
            <div className="rounded-lg border border-rose-950/50 bg-[#140e16]/80 p-2">
              <span className="block font-bold text-pink-300">{result.meeting.actionItems.length}</span>
              <span className="text-[10px] text-zinc-400">Action Items</span>
            </div>
            <div className="rounded-lg border border-rose-950/50 bg-[#140e16]/80 p-2">
              <span className="block font-bold text-amber-400">{result.meeting.unresolvedIssues.length}</span>
              <span className="text-[10px] text-zinc-400">Blockers</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
            <button
              onClick={() => setResult(null)}
              className="rounded-lg border border-rose-950/60 bg-[#160f18] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-[#1f1422]"
            >
              Ingest Another
            </button>
            <button
              onClick={() => onMeetingProcessed(result.meeting.id)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:brightness-110"
            >
              <span>Inspect Meeting</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Ingestion Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="mt-6">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300">Meeting Title</label>
              <input
                type="text"
                id="meeting-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sprint 43 Milestone Review"
                className="mt-1 w-full rounded-xl border border-rose-950/60 bg-[#140e16]/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300">Date</label>
              <input
                type="date"
                id="meeting-date-input"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-rose-950/60 bg-[#140e16]/90 px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="mt-5 flex border-b border-rose-950/60">
            <button
              type="button"
              id="tab-paste-transcript"
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition ${
                activeTab === 'transcript'
                  ? 'border-rose-500 text-rose-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Paste Transcript</span>
            </button>
            <button
              type="button"
              id="tab-upload-audio"
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition ${
                activeTab === 'audio'
                  ? 'border-orange-500 text-orange-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Upload Audio (Groq Whisper)</span>
            </button>
          </div>

          {/* Tab 1: Paste Transcript */}
          {activeTab === 'transcript' && (
            <div className="mt-3.5">
              <textarea
                id="transcript-textarea"
                rows={11}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste meeting transcript here...
Speaker A: I will deliver the REST API by Friday.
Speaker B: The auth token expiration is still blocking login."
                className="w-full rounded-2xl border border-rose-950/60 bg-[#140e16]/90 p-4 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:border-rose-500 focus:outline-none leading-relaxed"
              />
            </div>
          )}

          {/* Tab 2: Upload Audio */}
          {activeTab === 'audio' && (
            <div className="mt-3.5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-950/80 bg-[#140e16]/60 p-8 text-center transition hover:border-orange-500/50 hover:bg-[#1a0f1d]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
                  accept="audio/mp3,audio/wav,audio/m4a,audio/webm,.mp3,.wav,.m4a,.webm"
                  className="hidden"
                />
                <div className="rounded-full bg-gradient-to-tr from-rose-500/10 to-orange-500/10 p-3.5 text-orange-400">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="mt-2 text-xs font-bold text-zinc-200">
                  {audioFile ? audioFile.name : 'Click or drop meeting recording here'}
                </h3>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  MP3, WAV, M4A, WebM (Transcribed with Groq Whisper)
                </p>
                {audioFile && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-rose-950/60 px-2.5 py-1 text-xs text-rose-300">
                    <FileAudio className="h-3.5 w-3.5" />
                    <span>{(audioFile.size / (1024 * 1024)).toFixed(2)} MB loaded</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-900/50 bg-rose-950/30 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Processing Stages Animated UI */}
          {processing && (
            <div className="mt-5 rounded-2xl border border-rose-900/40 bg-[#140e16]/95 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-rose-950/60 pb-2.5">
                <span className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <Sparkles className="h-4 w-4 animate-spin text-orange-400" />
                  Cross-Meeting Analysis in Progress
                </span>
                <span className="text-[10px] text-zinc-400">
                  Stage {Math.min(currentStageIndex + 1, PIPELINE_STAGES.length)} of {PIPELINE_STAGES.length}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {PIPELINE_STAGES.map((stg, i) => {
                  const isDone = i < currentStageIndex;
                  const isCurrent = i === currentStageIndex;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition ${
                        isCurrent
                          ? 'bg-rose-500/10 text-rose-200 border border-rose-500/30 font-semibold'
                          : isDone
                          ? 'text-emerald-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="flex h-3.5 w-3.5 items-center justify-center">
                          <span className="h-2 w-2 animate-ping rounded-full bg-orange-400" />
                        </span>
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-zinc-800" />
                      )}
                      <span>{stg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!processing && (
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                id="submit-process-btn"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-110 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Process & Link Cross-Meeting Memory</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
