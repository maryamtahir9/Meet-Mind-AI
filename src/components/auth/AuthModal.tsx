import React, { useState } from 'react';
import { X, Brain, Sparkles, User, Mail, Lock, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Maryam Tahir');
  const [email, setEmail] = useState('maryam@meetmind.ai');
  const [password, setPassword] = useState('password123');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: name || 'Maryam Tahir', email });
    onClose();
  };

  const handleQuickDemoUser = () => {
    onLogin({ name: 'Maryam Tahir', email: 'maryam@meetmind.ai' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-blue-500/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-['Outfit'] text-base font-bold text-white">MeetMind AI</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Accountability Workspace</p>
          </div>
        </div>

        <h3 className="mt-5 text-sm font-bold text-white">
          {isSignUp ? 'Create your workspace account' : 'Sign in to your meeting memory'}
        </h3>

        {/* Quick Demo Access Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleQuickDemoUser}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Continue as Demo User (Maryam Tahir)</span>
          </button>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <span className="w-full border-t border-slate-800" />
          <span className="absolute bg-slate-900 px-2 text-[10px] uppercase tracking-wider text-slate-500">
            or credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300">Full Name</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maryam Tahir"
                  className="ml-2 w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300">Email Address</label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@team.com"
                className="ml-2 w-full bg-transparent text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ml-2 w-full bg-transparent text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-blue-400 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
