import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { MeetingsList } from './components/meetings/MeetingsList';
import { MeetingDetailView } from './components/meetings/MeetingDetailView';
import { NewMeetingView } from './components/meetings/NewMeetingView';
import { AccountabilityDashboard } from './components/accountability/AccountabilityDashboard';
import { ChatView } from './components/chat/ChatView';
import { ReportsView } from './components/reports/ReportsView';
import { AuthModal } from './components/auth/AuthModal';
import { fetchSystemStatus, resetToDemoSeed } from './lib/api';
import { SystemStatus } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>({
    name: 'Maryam Tahir',
    email: 'maryam@meetmind.ai',
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadSystemStatus = async () => {
    try {
      const status = await fetchSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.warn('System status check:', err);
    }
  };

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const handleResetSeed = async () => {
    try {
      await resetToDemoSeed();
      await loadSystemStatus();
      setNotification('Reset to Sprint 42 demo dataset (Ali API & login bug across 3 meetings).');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert('Failed to reset demo dataset: ' + err.message);
    }
  };

  const navigateToMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setCurrentTab('meeting-detail');
  };

  const handleTabNavigation = (tab: string, meetingId?: string) => {
    if (meetingId) {
      setSelectedMeetingId(meetingId);
      setCurrentTab('meeting-detail');
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b070d] text-zinc-100 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Responsive Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        systemStatus={systemStatus}
        onResetSeed={handleResetSeed}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
      />

      {/* Main Content View with Sidebar offset */}
      <div className="flex flex-col min-w-0 md:pl-64 min-h-screen">
        <main className="flex-1 transition-all duration-200">
          {currentTab === 'landing' && (
            <LandingPage
              onGetStarted={() => setCurrentTab('dashboard')}
              onViewDemo={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={handleTabNavigation}
              userName={user?.name.split(' ')[0] || 'Maryam'}
            />
          )}

          {currentTab === 'meetings' && (
            <MeetingsList
              onSelectMeeting={navigateToMeeting}
              onNewMeeting={() => setCurrentTab('new-meeting')}
            />
          )}

          {currentTab === 'meeting-detail' && selectedMeetingId && (
            <MeetingDetailView
              meetingId={selectedMeetingId}
              onBack={() => setCurrentTab('meetings')}
              onNavigateMeeting={navigateToMeeting}
            />
          )}

          {currentTab === 'new-meeting' && (
            <NewMeetingView
              onMeetingProcessed={(id) => navigateToMeeting(id)}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {currentTab === 'accountability' && (
            <AccountabilityDashboard onSelectMeeting={navigateToMeeting} />
          )}

          {currentTab === 'chat' && <ChatView onSelectMeeting={navigateToMeeting} />}

          {currentTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/40 bg-[#160f18]/95 px-4 py-3 text-xs font-semibold text-emerald-400 shadow-2xl backdrop-blur-md">
          {notification}
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(loggedUser) => setUser(loggedUser)}
      />
    </div>
  );
}
