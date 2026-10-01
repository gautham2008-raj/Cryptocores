import React from 'react';
import { CryptoCoin } from '../types/crypto.ts';
import { formatInr } from '../utils/formatters.ts';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Cpu,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface LandingHeroProps {
  onEnterDashboard: () => void;
  coins: CryptoCoin[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnterDashboard, coins }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center relative overflow-hidden bg-gradient-to-b from-[#0a0f1d] via-[#0d1527] to-[#080d19]">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 w-full">
        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side: Crypto Hero Section */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Cryptocurrency Intelligence Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  CRYPTO
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                  CORE
                </span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                Explore. Analyze. Understand Crypto.
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Demystifying decentralized finance with real-time Indian Rupee (INR) market analytics,
              comprehensive blockchain fundamentals, multi-timeframe interactive technical charts, and an AI intelligence companion grounded in live order flows.
            </p>

            {/* Key Feature Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-xl">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Live INR</span>
                </div>
                <p className="text-[11px] text-slate-400">Direct Rupee pricing & depth</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Interactive</span>
                </div>
                <p className="text-[11px] text-slate-400">Candlesticks, RSI, MACD</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">AI Assistant</span>
                </div>
                <p className="text-[11px] text-slate-400">Gemini-powered insights</p>
              </div>
            </div>

            {/* Animated Ticker Marquee Preview */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Asset Snapshot (5 Core Cryptos):
              </div>
              <div className="flex flex-wrap gap-2">
                {coins.map((coin) => (
                  <div
                    key={coin.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs shadow-sm hover:border-cyan-500/40 transition cursor-default"
                  >
                    <span className="font-bold text-slate-200">{coin.symbol}</span>
                    <span className="font-mono text-cyan-300 font-medium">
                      {formatInr(coin.currentPriceInr, coin.currentPriceInr > 1000 ? 0 : 2)}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        coin.priceChangePercentage24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {coin.priceChangePercentage24h >= 0 ? '+' : ''}
                      {coin.priceChangePercentage24h.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Clean Glassmorphic Panel */}
          <div className="lg:col-span-5">
            <div className="relative group">
              {/* Outer Glow Border Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-700 animate-glow-pulse" />

              <div className="relative glass-panel-glow p-8 sm:p-10 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center text-center space-y-6">
                {/* Visual Icon Badge */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center p-3 shadow-inner">
                  <div className="w-full h-full rounded-xl bg-slate-950/80 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition duration-300" />
                  </div>
                </div>

                {/* Gateway Heading */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Launch CryptoCore
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
                    Access live candlestick charts, 13 fundamental educational guides, technical indicators, and your AI market analyst.
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="w-full py-2.5 px-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>PostgreSQL Cloud Engine</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ONLINE
                  </span>
                </div>

                {/* ENTER DASHBOARD Main Action Button */}
                <button
                  onClick={onEnterDashboard}
                  className="w-full group/btn relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 hover:from-cyan-300 hover:to-white rounded-2xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <span className="relative z-10 tracking-wider uppercase">ENTER DASHBOARD</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition duration-300" />
                  {/* Sheen sweep effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent transition" />
                </button>

                {/* Quick Link Pillars */}
                <div className="w-full grid grid-cols-2 gap-2 text-left pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time INR Depth</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Multi-timeframe Graphs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Interactive Keypairs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Zero-Advisory AI Engine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
