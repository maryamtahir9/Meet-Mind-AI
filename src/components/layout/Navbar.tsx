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
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import { SystemStatus } from '../../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  systemStatus: SystemStatus | null;
  onResetSeed: () => void;
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  systemStatus,
  onResetSeed,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await onResetSeed();
    setTimeout(() => setResetting(false), 600);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'accountability', label: 'Accountability', icon: ShieldCheck },
    { id: 'chat', label: 'AI Memory', icon: MessageSquareCode },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-950/40 bg-[#0c090e]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-7">
          <button
            id="nav-logo-btn"
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left transition hover:opacity-95"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 shadow-md shadow-rose-500/30">
              <Brain className="h-4.5 w-4.5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Outfit'] text-base font-extrabold tracking-tight text-white">MeetMind</span>
                <span className="rounded bg-gradient-to-r from-rose-500/20 to-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                  AI
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500/15 to-orange-500/15 text-rose-200 border border-rose-500/30 shadow-sm'
                      : 'text-zinc-400 hover:bg-rose-950/30 hover:text-rose-100'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-rose-400' : 'text-zinc-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Neon & Groq Connection Status Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-rose-950/60 bg-[#140e15] px-2.5 py-1 text-[11px] text-zinc-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="h-3 w-3 text-rose-400" />
              <span className="text-zinc-500">DB</span>
              <span className="text-emerald-400 font-semibold">Neon PG</span>
            </span>
            <span className="h-2.5 w-px bg-rose-950/80"></span>
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3 w-3 text-orange-400" />
              <span className="text-zinc-500">AI</span>
              <span className="text-orange-300 font-semibold">Groq + Whisper</span>
            </span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            id="reset-demo-btn"
            onClick={handleReset}
            disabled={resetting}
            title="Reset to 3-meeting Sprint 42 demo dataset"
            className="flex items-center gap-1.5 rounded-lg border border-rose-950/60 bg-[#161019] px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-rose-800/40 hover:text-rose-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin text-rose-400' : ''}`} />
            <span className="hidden sm:inline">Demo Data</span>
          </button>

          {/* Ingest Meeting Button */}
          <button
            id="nav-new-meeting-btn"
            onClick={() => setCurrentTab('new-meeting')}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Meeting</span>
          </button>

          {/* User Profile / Auth */}
          <div className="relative">
            {user ? (
              <button
                id="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-950/60 bg-[#140e15] p-1.5 text-xs font-medium text-zinc-300 transition hover:bg-rose-950/40"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 text-[10px] font-bold text-white">
                  {user.name ? user.name[0].toUpperCase() : 'M'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            ) : (
              <button
                id="login-trigger-btn"
                onClick={onOpenAuth}
                className="rounded-lg border border-rose-900/40 bg-[#161019] px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-900/20"
              >
                Sign In
              </button>
            )}

            {showUserMenu && user && (
              <div
                id="user-menu-dropdown"
                className="absolute right-0 mt-2 w-52 rounded-xl border border-rose-950/80 bg-[#140e15] p-2 shadow-xl backdrop-blur-lg"
              >
                <div className="border-b border-rose-950/60 px-3 py-2 text-left">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                </div>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setCurrentTab('dashboard');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-300 hover:bg-rose-950/30 hover:text-white"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-zinc-400" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex border-t border-rose-950/40 bg-[#0c090e] px-2 py-1.5 md:hidden justify-around overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-medium ${
                isActive ? 'text-rose-400 font-semibold' : 'text-zinc-400'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
