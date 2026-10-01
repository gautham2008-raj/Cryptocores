import React, { useState, useEffect, useRef } from 'react';
import { CryptoCoin, ChatMessage } from '../types/crypto.ts';
import { formatInr } from '../utils/formatters.ts';
import { sendGeminiPrompt, getChatHistoryApi, saveChatMessageApi, clearChatHistoryApi } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ArrowLeft,
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface AiAssistantViewProps {
  coins: CryptoCoin[];
  onBackToDashboard: () => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ coins, onBackToDashboard }) => {
  const { user, idToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts as requested in specification
  const suggestedPrompts = [
    'What is the current price of Bitcoin?',
    'What is Ethereum?',
    'Compare Bitcoin and Ethereum.',
    'Why is Bitcoin price changing?',
    'What does RSI mean?',
    'What is the current market trend?',
    'What are the risks of buying cryptocurrency?',
    'Should I buy Bitcoin right now?',
    'What factors should I consider before buying Bitcoin?',
  ];

  // Load chat history from PostgreSQL (if logged in) or LocalStorage
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (idToken) {
        try {
          const dbHistory = await getChatHistoryApi(idToken);
          if (isMounted && dbHistory.length > 0) {
            setMessages(dbHistory);
            return;
          }
        } catch {
          // fallback to localStorage
        }
      }

      const local = localStorage.getItem('cryptocore_chat_history');
      if (local && isMounted) {
        try {
          setMessages(JSON.parse(local));
          return;
        } catch {}
      }

      // Default welcome message
      if (isMounted) {
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I am **CryptoCore AI**, your cryptocurrency and blockchain intelligence assistant. 

I am continuously grounded with live INR market prices, technical indicators, and blockchain fundamentals.

Feel free to ask me about:
- Live valuations and price movements (e.g. *"What is the current price of Bitcoin in INR?"*)
- Technical indicators (e.g. *"What does RSI mean?"*, *"Explain MACD"*)
- Fundamental comparisons (e.g. *"Compare Bitcoin and Ethereum"*)
- Objective market evaluations (e.g. *"Should I buy Bitcoin right now?"*)

*Please note: Crypto markets are highly volatile. All analytical responses are strictly informational and educational, never guaranteed financial advice.*`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [idToken]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);
    setErrorMsg(null);

    // Persist user message
    if (idToken) {
      saveChatMessageApi(idToken, 'user', query).catch(console.error);
    }
    localStorage.setItem('cryptocore_chat_history', JSON.stringify(newMessages));

    try {
      const replyText = await sendGeminiPrompt(query, messages);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      if (idToken) {
        saveChatMessageApi(idToken, 'assistant', replyText).catch(console.error);
      }
      localStorage.setItem('cryptocore_chat_history', JSON.stringify(finalMessages));
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (idToken) {
      clearChatHistoryApi(idToken).catch(console.error);
    }
    localStorage.removeItem('cryptocore_chat_history');
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared. How can I assist your crypto analysis today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Helper to format Markdown-like bold and bullet text
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, lIdx) => {
          if (line.startsWith('### 🎯 FINAL ANSWER')) {
            return (
              <div key={lIdx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 text-cyan-300 font-extrabold text-sm sm:text-base my-1 shadow-sm">
                <span>{line.replace('### ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h4 key={lIdx} className="font-bold text-sm text-cyan-300 mt-2">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={lIdx} className="font-extrabold text-base text-white mt-3">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const itemText = line.substring(2);
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{renderInlineFormatting(itemText)}</span>
              </div>
            );
          }
          return <p key={lIdx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Module 7: AI Crypto Assistant
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Real-time INR market-grounded intelligence companion. Objective analysis with zero financial bias.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 text-xs font-semibold transition cursor-pointer self-start sm:self-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Grounding Status Pill Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>
            Active Real-Time Grounding:{' '}
            <strong className="text-white">
              BTC ({formatInr(coins[0]?.currentPriceInr, 0)}) | ETH ({formatInr(coins[1]?.currentPriceInr, 0)}) | SOL ({formatInr(coins[4]?.currentPriceInr, 0)})
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Informational only • Not financial advice</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Carousel */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-xs font-medium transition cursor-pointer text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-panel-glow rounded-3xl border border-white/10 flex flex-col h-[560px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUser
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border-cyan-500/40 text-white'
                      : 'bg-slate-900/90 border-white/10 text-slate-200'
                  }`}
                >
                  {renderFormattedMessage(msg.content)}
                  <div className="text-[10px] text-slate-400 mt-2 text-right font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400 text-indigo-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>CryptoCore AI is analyzing real-time order flow and technical indicators...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about crypto, RSI, Bitcoin vs Ethereum, or market trends..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-white text-slate-950 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
