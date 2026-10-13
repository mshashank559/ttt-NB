import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MessageSquare, Bot, RefreshCw, ChevronRight } from 'lucide-react';
import AiEnergyOrb from './AiEnergyOrb';
import { useApp } from '../context/AppContext';
import { askNbAi } from '../services/groqService';
import { buildOperationalDatabaseSnapshot, generateLocalDashboardAnswer } from '../services/dashboardDataAggregator';

// Clean text formatter that removes raw ** and highlights text cleanly
const formatMessageText = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    // If line has **text**, remove the asterisks and emphasize cleanly
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={lIdx} className={line.trim() === '' ? 'h-2' : ''}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={pIdx} className="font-semibold text-white">
                {part.slice(2, -2)}
              </span>
            );
          }
          return part.replace(/\*\*/g, '');
        })}
      </div>
    );
  });
};

export default function NbAiPanel({ isOpen, onClose }) {
  const { tasks, visibleInterviews, interviews, users, currentUser, currentRole, feedbacks } = useApp();

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello Shashank here, how may I assist you?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isThinking]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    // Compute live operational database snapshot in real-time
    const snapshotData = buildOperationalDatabaseSnapshot({
      tasks,
      feedbacks,
      interviews: (interviews && interviews.length) ? interviews : (visibleInterviews || []),
      users,
      currentUser,
      currentRole,
    });

    try {
      const dashboardContext = {
        ...snapshotData,
        currentUserName: currentUser?.name || 'Shashank Mishra',
      };

      // Call Real Groq LPU Cloud AI with full operational database
      const answer = await askNbAi({
        query,
        conversationHistory: messages,
        dashboardContext,
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer,
        time: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('[NB AI] Groq query fallback to local engine:', err);
      const fallbackAnswer = generateLocalDashboardAnswer(query, snapshotData);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackAnswer,
        time: 'Just now',
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setTimeout(() => {
        setIsThinking(false);
      }, 800);
    }
  };

  const quickPrompts = [
    'Who is best TSE member?',
    'Interview Clear Rate?',
    'Overdue tasks summary',
    'Amber Afreen task status',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50"
          />

          {/* Left Rectangle Chat Box - PURE VOID BLACK */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[440px] max-w-[95vw] bg-[#000000] border-r border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col text-white overflow-hidden rounded-r-[28px]"
          >
            {/* Header */}
            <div className="relative z-10 h-16 px-5 border-b border-white/10 flex items-center justify-between bg-[#000000] shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shadow-md">
                  <img src="/intro-assets/nb_mark_white.png" alt="NetBounce Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white tracking-wide">
                    NB AI
                  </div>
                  <div className="text-[10px] font-medium text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                    <span>MongoDB Atlas Live (Mumbai)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setMessages([
                      {
                        id: 'welcome',
                        sender: 'ai',
                        text: `Greetings ${salutation}! How may I assist you today?`,
                        time: 'Just now',
                      },
                    ])
                  }
                  title="Clear chat"
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="ai-panel-close-btn"
                  title="Close AI Assistant"
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Circular NetBounce AI Logo with Ripple Wave on Question Enter */}
            <div className="relative z-10 py-3 flex flex-col items-center justify-center shrink-0 bg-[#000000]">
              <AiEnergyOrb size={105} isSpeaking={isThinking} />
            </div>

            {/* Chat Stream Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-[#000000]">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#141dc7] to-[#1e40af] text-white border border-blue-400/30 rounded-tr-xs'
                        : 'bg-[#111114] text-zinc-100 border border-white/10 rounded-tl-xs'
                    }`}
                  >
                    {formatMessageText(msg.text)}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#111114] border border-white/10 max-w-[70%]">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="text-xs text-cyan-200 font-medium ml-1">Analyzing live data...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="relative z-10 px-4 py-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-[#000000]">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#111114] hover:bg-[#1a1a20] border border-white/15 hover:border-cyan-400/40 text-cyan-300 hover:text-white transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Bottom Chat Input Form */}
            <div className="relative z-10 p-3.5 border-t border-white/10 bg-[#000000] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-[#121215] hover:bg-[#16161a] focus-within:bg-[#16161a] border border-white/15 focus-within:border-cyan-400/60 rounded-2xl px-3 py-2 transition-all shadow-inner"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask NB AI about your dashboard..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                  data-testid="ai-chat-input"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  data-testid="ai-chat-send-btn"
                  title="Send message"
                  className="h-8 w-8 rounded-xl bg-gradient-to-r from-[#141dc7] to-[#00c6ff] disabled:opacity-40 hover:opacity-95 text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send size={13} className="ml-0.5" />
                </button>
              </form>
              <div className="text-[10px] text-center text-zinc-500 mt-2 font-medium">
                NB AI • Live Operations Copilot
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
