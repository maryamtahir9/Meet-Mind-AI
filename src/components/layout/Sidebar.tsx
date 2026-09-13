import React, { useState } from 'react';
import {
  Brain,
  LayoutDashboard,
  Calendar,
  ShieldCheck,
  MessageSquareCode,
  FileText,
  Plus,
  RefreshCw,
  Database,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { SystemStatus } from '../../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  systemStatus: SystemStatus | null;
  onResetSeed: () => void;
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  systemStatus,
  onResetSeed,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await onResetSeed();
    setTimeout(() => setResetting(false), 600);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Overview & metrics',
    },
    {
      id: 'meetings',
      label: 'Meeting Repository',
      icon: Calendar,
      badge: systemStatus ? `${systemStatus.totalMeetings}` : '3',
      desc: 'Transcripts & summaries',
    },
    {
      id: 'accountability',
      label: 'Accountability Tracker',
      icon: ShieldCheck,
      badge: systemStatus ? `${systemStatus.totalCommitments}` : '6',
      desc: 'Audit trails & commitments',
    },
    {
      id: 'chat',
      label: 'AI Memory Chat',
      icon: MessageSquareCode,
      badge: 'Groq',
      desc: 'Cross-meeting intelligence',
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      icon: FileText,
      badge: null,
      desc: 'Export presentation PDFs',
    },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-[#0d0911]">
      {/* Top Section */}
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <button
            id="sidebar-logo-btn"
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 text-left transition hover:opacity-95 group"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 shadow-md shadow-rose-500/30 group-hover:scale-105 transition">
              <Brain className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Outfit'] text-lg font-black tracking-tight text-white">
                  MeetMind
                </span>
                <span className="rounded bg-gradient-to-r from-rose-500/20 to-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Cross-Meeting Memory</p>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/40 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Action: Ingest New Meeting */}
        <button
          id="sidebar-new-meeting-btn"
          onClick={() => handleNavClick('new-meeting')}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 p-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 transition group-hover:rotate-90" />
          <span>Ingest New Meeting</span>
        </button>

        {/* Navigation List */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-orange-500/10 text-white border border-rose-500/40 shadow-sm shadow-rose-950/40'
                    : 'text-zinc-400 hover:bg-[#160f18] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                      isActive
                        ? 'bg-gradient-to-tr from-rose-500 to-orange-400 text-white shadow-sm shadow-rose-500/30'
                        : 'bg-zinc-900/80 text-zinc-400 group-hover:text-rose-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className={isActive ? 'font-bold text-rose-100' : 'text-zinc-300'}>
                      {item.label}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                        : item.id === 'chat'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Infrastructure Status & User Card */}
      <div className="space-y-3 pt-3 border-t border-rose-950/40">
        {/* System & Engine Status */}
        <div className="rounded-xl border border-rose-950/50 bg-[#130d17] p-2.5 text-xs">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-zinc-500">Infrastructure</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Database className="h-3 w-3 text-rose-400" />
                Database
              </span>
              <span className="font-medium text-emerald-300">Neon PostgreSQL</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Sparkles className="h-3 w-3 text-orange-400" />
                Inference
              </span>
              <span className="font-medium text-orange-300">Groq GPT-120B</span>
            </div>
          </div>

          {/* Reset Demo Data Action */}
          <button
            id="sidebar-reset-demo-btn"
            onClick={handleReset}
            disabled={resetting}
            title="Reset to 3-meeting Sprint 42 demo dataset"
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-950/70 bg-[#18101d] py-1.5 text-[11px] font-semibold text-zinc-300 transition hover:border-rose-800/60 hover:text-rose-200 disabled:opacity-50 active:scale-98"
          >
            <RefreshCw className={`h-3 w-3 ${resetting ? 'animate-spin text-rose-400' : 'text-zinc-400'}`} />
            <span>Reset Demo Sprint 42</span>
          </button>
        </div>

        {/* User Card */}
        {user ? (
          <div className="flex items-center justify-between rounded-xl border border-rose-950/60 bg-[#140e16] p-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 text-xs font-bold text-white shadow-sm">
                {user.name ? user.name[0].toUpperCase() : 'M'}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-xs font-bold text-white">{user.name}</p>
                <p className="truncate text-[10px] text-zinc-400">{user.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
          >
            <User className="h-3.5 w-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-rose-950/40 bg-[#0d0911]/95 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-zinc-300 hover:bg-rose-950/40 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-orange-400 text-white">
              <Brain className="h-4 w-4" />
            </div>
            <span className="font-['Outfit'] text-sm font-bold text-white">MeetMind AI</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('new-meeting')}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-[11px] font-bold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </button>
          {user ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-950/80 text-[11px] font-bold text-rose-300 border border-rose-900/50">
              {user.name[0]}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs text-rose-300 font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Desktop Sidebar (Fixed Sticky Left) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-rose-950/50 bg-[#0d0911]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-[#0d0911] shadow-2xl border-r border-rose-950/60 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
