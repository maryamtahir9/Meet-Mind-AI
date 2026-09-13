import React from 'react';
import {
  Brain,
  ShieldCheck,
  GitBranch,
  ClockAlert,
  Repeat,
  MessageSquareCode,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onViewDemo }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI Meeting Intelligence',
      description: 'Automatically transcribes audio and extracts high-fidelity executive summaries, decisions, and action items with zero manual note-taking.',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      icon: ShieldCheck,
      title: 'Commitment Tracking',
      description: 'Identifies promises ("I will deliver...", "I will complete...") and attributes them to specific owners with explicit or inferred deadlines.',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      icon: GitBranch,
      title: 'Cross-Meeting Memory',
      description: 'Connects past and current meetings into a single living graph. Never treats meetings in isolation; links follow-ups directly to original promises.',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    },
    {
      icon: ClockAlert,
      title: 'Overdue Detection',
      description: 'Autonomously flags commitments whose target delivery dates have passed without reported completion evidence, providing an audit trail.',
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400',
    },
    {
      icon: Repeat,
      title: 'Repeated Issue Detection',
      description: 'Semantically links unresolved blockers across multiple meetings. If a login bug is raised 3 times, MeetMind AI escalates it as recurring.',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      icon: MessageSquareCode,
      title: 'RAG-Powered AI Chat',
      description: 'Ask deep cross-meeting questions grounded directly in transcripts, commitments, and decisions. Always returns verifiable, clickable citations.',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Upload Meeting', desc: 'Audio recording or raw pasted transcript' },
    { step: '02', title: 'AI Transcription', desc: 'Fast speech-to-text via Groq Whisper' },
    { step: '03', title: 'Structured Extraction', desc: 'Summary, decisions, commitments & issues' },
    { step: '04', title: 'Meeting Memory', desc: 'Neon PostgreSQL storage with vector chunks' },
    { step: '05', title: 'Cross-Meeting Engine', desc: 'Compares with all past open commitments' },
    { step: '06', title: 'Accountability Tracking', desc: 'Updates status to Completed, Overdue, or Repeated' },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-purple-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-[700px] right-[-100px] h-[400px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />

      <main className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        {/* Tagline Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-xs font-semibold text-blue-300 shadow-sm shadow-blue-500/10 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Turn Meeting Conversations Into Accountability</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-8 text-center">
          <h1 className="font-['Outfit'] text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Your Meetings Remember What{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Your Team Forgets.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg lg:text-xl">
            MeetMind AI transforms meeting conversations into trackable decisions, commitments, deadlines,
            and unresolved issues — then follows them across every future meeting.
          </p>

          {/* CTA Group */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/35 active:scale-98"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              id="hero-view-demo-btn"
              onClick={onViewDemo}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
            >
              <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
              <span>View Interactive Demo</span>
            </button>
          </div>
        </div>

        {/* Interactive Visual AI Mockup (Cross-Meeting Intelligence Engine in action) */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Cross-Meeting Accountability Trail in Action
              </span>
            </div>
            <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400 border border-blue-500/20">
              Autonomous Status Evolution
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Step 1 Card */}
            <div className="relative rounded-xl border border-slate-800/90 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-blue-400">Meeting 1: Sprint 42 Kickoff</span>
                <span className="flex items-center gap-1 text-[10px]"><Clock className="h-3 w-3" /> Sep 2</span>
              </div>
              <p className="text-xs italic text-slate-400">
                "Ali: I will complete the API by Friday. Auth bug is blocking users."
              </p>
              <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Ali • Core REST API</span>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    <Clock className="h-2.5 w-2.5" /> PENDING
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Deadline: Sep 5</p>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="relative rounded-xl border border-amber-500/30 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-amber-400">Meeting 2: Mid-Sprint Sync</span>
                <span className="flex items-center gap-1 text-[10px]"><Clock className="h-3 w-3" /> Sep 5</span>
              </div>
              <p className="text-xs italic text-slate-400">
                "Ali: The API is still not completed due to Neon connection pooling."
              </p>
              <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Ali • Core REST API</span>
                  <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    <AlertCircle className="h-2.5 w-2.5" /> OVERDUE
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-rose-300/80">Cross-Meeting Engine detected delay evidence</p>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="relative rounded-xl border border-emerald-500/30 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-emerald-400">Meeting 3: Release Review</span>
                <span className="flex items-center gap-1 text-[10px]"><Clock className="h-3 w-3" /> Sep 8</span>
              </div>
              <p className="text-xs italic text-slate-400">
                "Ali: The API is now fully completed, tested, and deployed to staging."
              </p>
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Ali • Core REST API</span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <CheckCircle2 className="h-2.5 w-2.5" /> COMPLETED
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-300/80">Verified completion with full audit trail</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Feature Cards */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="font-['Outfit'] text-2xl font-bold text-white sm:text-3xl">
              Architected for Real Team Accountability
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Meeting notes are passive. MeetMind AI is an active intelligence engine that bridges every conversation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/80"
                >
                  <div className={`inline-flex rounded-xl border p-3 ${feat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-100">{feat.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works Diagram */}
        <div className="mt-28">
          <div className="text-center">
            <h2 className="font-['Outfit'] text-2xl font-bold text-white sm:text-3xl">
              How the Intelligence Pipeline Works
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              From raw audio wave to continuous multi-meeting accountability.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-blue-400">{step.step}</span>
                  <h4 className="mt-2 text-xs font-bold text-slate-200">{step.title}</h4>
                  <p className="mt-1 text-[11px] text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/30 to-slate-900/60 p-8 text-center sm:p-12">
          <h2 className="font-['Outfit'] text-2xl font-bold text-white sm:text-4xl">
            Start Tracking Team Accountability Across Meetings Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-slate-400">
            Upload audio or paste transcripts. MeetMind AI immediately starts connecting the dots.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500"
            >
              <span>Open Meeting Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
