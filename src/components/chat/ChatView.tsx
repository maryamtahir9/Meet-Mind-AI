import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Calendar,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Database,
  Search,
} from 'lucide-react';
import { askMeetingMemory } from '../../lib/api';
import { RAGMessage, RAGSource } from '../../types';

interface ChatViewProps {
  onSelectMeeting: (meetingId: string) => void;
}

interface PromptCategory {
  title: string;
  icon: React.ElementType;
  queries: string[];
}

const CATEGORIZED_PROMPTS: PromptCategory[] = [
  {
    title: 'Accountability & Promises',
    icon: ShieldCheck,
    queries: [
      'What did Ali promise across all meetings?',
      'Did Sarah complete her timeline UI task?',
      'Who is responsible for the database migration?',
    ],
  },
  {
    title: 'Blockers & Overdue Work',
    icon: AlertTriangle,
    queries: [
      'Which tasks are currently overdue?',
      'What recurring issues were discussed more than once?',
      'What blocker is holding up the frontend release?',
    ],
  },
  {
    title: 'Decisions & Agreements',
    icon: FileCheck,
    queries: [
      'What decisions were made regarding authentication and API?',
      'What was agreed upon for the production launch date?',
      'Summarize all architectural agreements made this sprint.',
    ],
  },
];

export const ChatView: React.FC<ChatViewProps> = ({ onSelectMeeting }) => {
  const [messages, setMessages] = useState<RAGMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **MeetMind AI Memory Assistant** powered by Groq and continuous Neon PostgreSQL indexing.\n\nAsk me about any commitment, overdue deliverable, recurring blocker, or decision made across your team's meetings.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSourcesFor, setShowSourcesFor] = useState<Record<string, boolean>>({});
  const [expandedSuggestions, setExpandedSuggestions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: RAGMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const resp = await askMeetingMemory(userMsg.text);
      const aiMsg: RAGMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: resp.answer,
        sources: resp.sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      // Default expand sources for new AI message
      if (resp.sources && resp.sources.length > 0) {
        setShowSourcesFor((prev) => ({ ...prev, [aiMsg.id]: true }));
      }
    } catch (err: any) {
      const errorMsg: RAGMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `### Memory Query Notice\n\nUnable to retrieve cross-meeting context: **${err.message}**.\nPlease verify the backend service connection or try rephrasing your question.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Conversation cleared. What would you like to explore across your meetings next?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const toggleSources = (msgId: string) => {
    setShowSourcesFor((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const getItemTypeBadge = (type: RAGSource['itemType']) => {
    switch (type) {
      case 'commitment':
        return (
          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
            Commitment
          </span>
        );
      case 'decision':
        return (
          <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-300 border border-orange-500/30">
            Decision
          </span>
        );
      case 'issue':
        return (
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
            Blocker
          </span>
        );
      case 'actionItem':
        return (
          <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-bold text-pink-300 border border-pink-500/30">
            Action Item
          </span>
        );
      default:
        return (
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">
            Transcript
          </span>
        );
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isOnlyWelcomeMessage = messages.length <= 1;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen w-full flex-col bg-[#0b070d]">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-rose-950/50 bg-[#0d0911]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 text-white shadow-md shadow-rose-500/20">
            <MessageSquareCode className="h-4.5 w-4.5" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Outfit'] text-base font-extrabold text-white">
                Cross-Meeting AI Memory
              </h1>
              <span className="rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                Groq GPT-120B
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Continuous retrieval across transcripts, commitments, and decisions
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandedSuggestions(!expandedSuggestions)}
            title="Toggle suggested topics"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-rose-950/60 bg-[#160f18] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-rose-500/30 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>Topics</span>
          </button>

          <button
            onClick={handleClearChat}
            title="Clear chat history"
            className="flex items-center gap-1.5 rounded-lg border border-rose-950/60 bg-[#160f18] px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:border-rose-800/60 hover:text-rose-300 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Expandable Suggestions Panel */}
      {expandedSuggestions && (
        <div className="border-b border-rose-950/50 bg-[#130d17] p-3 sm:px-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
              Suggested Memory Inquiries
            </span>
            <button
              onClick={() => setExpandedSuggestions(false)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {CATEGORIZED_PROMPTS.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="rounded-xl border border-rose-950/60 bg-[#19101d] p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 mb-1.5">
                    <Icon className="h-3.5 w-3.5 text-orange-400" />
                    <span>{cat.title}</span>
                  </div>
                  <div className="space-y-1">
                    {cat.queries.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => {
                          handleSend(q);
                          setExpandedSuggestions(false);
                        }}
                        className="block w-full text-left text-[11px] text-zinc-400 hover:text-rose-200 hover:underline truncate"
                      >
                        • {q}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 space-y-6 scrollbar-thin scrollbar-thumb-rose-950">
        {/* Welcome Empty State if first message */}
        {isOnlyWelcomeMessage && (
          <div className="mx-auto max-w-2xl text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-orange-500/20 border border-rose-500/30 text-rose-300 shadow-xl shadow-rose-950/50 mb-3">
              <Sparkles className="h-7 w-7 text-orange-400 animate-pulse" />
            </div>
            <h2 className="font-['Outfit'] text-xl font-bold text-white sm:text-2xl">
              What would you like to recall?
            </h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              MeetMind indexes every commitment, deadline, and agreement across your meetings so you never have to search meeting notes manually.
            </p>

            {/* Quick Starters Grid */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-left">
              {CATEGORIZED_PROMPTS.map((cat, idx) => {
                const Icon = cat.icon;
                const starter = cat.queries[0];
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(starter)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-rose-950/60 bg-[#140e16]/80 p-3.5 transition hover:border-rose-500/50 hover:bg-[#19101d] active:scale-[0.98]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <Icon className="h-4 w-4 text-orange-400 group-hover:scale-110 transition" />
                        <span>{cat.title}</span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-300 leading-relaxed font-medium line-clamp-2">
                        "{starter}"
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-orange-400 group-hover:translate-x-0.5 transition">
                      <span>Ask memory</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 group ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* AI Avatar */}
            {msg.sender === 'ai' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 text-white shadow-md shadow-rose-500/25">
                <Bot className="h-4 w-4" />
              </div>
            )}

            {/* Message Bubble */}
            <div className="flex flex-col max-w-2xl sm:max-w-3xl">
              <div
                className={`relative rounded-2xl p-4 text-xs leading-relaxed sm:text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium shadow-lg shadow-rose-500/20'
                    : 'border border-rose-950/60 bg-[#140e16]/90 text-zinc-200 backdrop-blur-md shadow-lg shadow-rose-950/30'
                }`}
              >
                {/* Content */}
                {msg.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div>
                    <Markdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-bold text-rose-200 mb-1.5 mt-2.5 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-orange-200 mb-1 mt-2 first:mt-0">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 leading-relaxed text-zinc-200 last:mb-0">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 mb-2 space-y-1 text-zinc-200">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 mb-2 space-y-1 text-zinc-200">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-bold text-rose-200">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-rose-950/60 px-1.5 py-0.5 font-mono text-[11px] text-orange-300 border border-rose-900/40">
                            {children}
                          </code>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-rose-500 pl-3 my-2 text-zinc-400 italic">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>
                )}

                {/* Sources & Citations Area */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 border-t border-rose-950/60 pt-2.5">
                    <button
                      type="button"
                      onClick={() => toggleSources(msg.id)}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-300 hover:text-rose-200 transition"
                    >
                      <Database className="h-3 w-3 text-orange-400" />
                      <span>
                        Verified Citations ({msg.sources.length})
                      </span>
                      {showSourcesFor[msg.id] ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    {showSourcesFor[msg.id] && (
                      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="group flex flex-col justify-between rounded-xl border border-rose-950/70 bg-[#1a111f]/90 p-2.5 transition hover:border-orange-500/50 hover:bg-[#201526]"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                {getItemTypeBadge(src.itemType)}
                                <span className="text-[10px] text-zinc-400">
                                  {new Date(src.meetingDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-zinc-100 truncate">
                                {src.meetingTitle}
                              </h4>
                              <p className="mt-1 line-clamp-2 text-[10px] text-zinc-300 italic leading-snug">
                                "{src.snippet}"
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onSelectMeeting(src.meetingId)}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 group-hover:text-orange-300 hover:underline"
                            >
                              <span>Inspect meeting audit</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Footer: Timestamp & Copy Button */}
              <div
                className={`mt-1 flex items-center gap-2 px-1 text-[10px] text-zinc-500 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{formatTimestamp(msg.timestamp)}</span>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(msg.id, msg.text)}
                  className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition"
                  title="Copy message text"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-950/70 border border-rose-900/50 text-rose-300 shadow-sm">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading / Inference indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 text-white animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-rose-950/60 bg-[#140e16]/80 p-3.5 text-xs text-zinc-300 flex items-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin text-orange-400" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-200">Querying Continuous Memory...</p>
                <p className="text-[10px] text-zinc-400">
                  Retrieving embeddings from Neon DB and synthesizing with Groq GPT-120B
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips row if conversation is active */}
      {!isOnlyWelcomeMessage && (
        <div className="shrink-0 px-4 sm:px-8 pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">
              Quick Inquire:
            </span>
            {[
              'What did Ali promise?',
              'Overdue deliverables',
              'Decisions this sprint',
              'Recurring blockers',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="shrink-0 flex items-center gap-1 rounded-full border border-rose-950/60 bg-[#140e16] px-2.5 py-1 text-[11px] text-zinc-300 hover:border-rose-500/40 hover:text-rose-200 transition"
              >
                <Sparkles className="h-2.5 w-2.5 text-orange-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Box */}
      <div className="shrink-0 border-t border-rose-950/50 bg-[#0d0911]/95 p-3 sm:px-8 sm:py-3.5 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-rose-950/70 bg-[#140e16]/95 p-2 shadow-inner focus-within:border-rose-500/60 focus-within:ring-1 focus-within:ring-rose-500/30 transition"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything across past and current meetings... (Enter to send, Shift+Enter for new line)"
            className="max-h-36 min-h-[38px] flex-1 resize-none bg-transparent px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none sm:text-sm scrollbar-none"
          />

          <div className="flex items-center gap-1 pb-1 pr-1">
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white shadow-md shadow-rose-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send query"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-1.5 flex items-center justify-between px-2 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Grounded with Neon PostgreSQL & Groq continuous memory
          </span>
          <span className="hidden sm:inline font-mono">Press Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
