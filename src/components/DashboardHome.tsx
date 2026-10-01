import React from 'react';
import { ActiveTab, CryptoCoin } from '../types/crypto.ts';
import { formatInr, formatCompactInr, formatPercentage } from '../utils/formatters.ts';
import {
  BookOpen,
  History,
  TrendingUp,
  BarChart3,
  Activity,
  Coins,
  Bot,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  PieChart,
  Flame,
} from 'lucide-react';

interface DashboardHomeProps {
  coins: CryptoCoin[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCoinForAnalysis?: (coinId: string) => void;
  onOpenWallets: () => void;
  onOpenAlerts: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  coins,
  setActiveTab,
  onSelectCoinForAnalysis,
  onOpenWallets,
  onOpenAlerts,
}) => {
  // Calculate aggregate metrics
  const totalMarketCapInr = coins.reduce((acc, c) => acc + (c.marketCapInr || 0), 0);
  const totalVolumeInr = coins.reduce((acc, c) => acc + (c.totalVolumeInr || 0), 0);
  const btcCoin = coins.find((c) => c.symbol === 'BTC');
  const btcDominance =
    totalMarketCapInr > 0 && btcCoin ? ((btcCoin.marketCapInr / totalMarketCapInr) * 100).toFixed(1) : '56.4';

  const modules: {
    id: ActiveTab;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
    metrics?: string;
  }[] = [
    {
      id: 'intro',
      title: '1. Introduction to Cryptocurrency',
      subtitle: 'Blockchain Fundamentals',
      description: 'Master 13 essential concepts: consensus mechanisms, public/private cryptography, hot vs cold wallets, mining, and Web3 architecture.',
      icon: <BookOpen className="w-6 h-6 text-sky-400" />,
      color: 'from-sky-500/20 to-blue-600/10 border-sky-500/30 group-hover:border-sky-400/60',
      badge: '13 Beginner Topics',
      metrics: 'Interactive Guides',
    },
    {
      id: 'history',
      title: '2. History of Cryptocurrency',
      subtitle: 'Evolutionary Timeline',
      description: 'Explore the digital money movement from the 1980s Cypherpunks, 2008 Satoshi Nakamoto whitepaper, Ethereum smart contracts, to ETF modern eras.',
      icon: <History className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 group-hover:border-amber-400/60',
      badge: '1980 - 2026+',
      metrics: 'Milestones & Origins',
    },
    {
      id: 'analysis',
      title: '3. Cryptocurrency Analysis',
      subtitle: 'Technical & Fundamental Deep-Dive',
      description: 'Quantitative breakdowns of BTC, ETH, USDT, BNB, and SOL with live RSI(14), Moving Averages (SMA 20/50), MACD, and Support/Resistance levels.',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 group-hover:border-emerald-400/60',
      badge: 'Technical + On-Chain',
      metrics: 'SMA, RSI, MACD',
    },
    {
      id: 'graphs',
      title: '4. Graphical Analysis',
      subtitle: 'Multi-Timeframe Visualizer',
      description: 'Interact with high-precision Line, Candlestick (OHLCV), Volume bars, and Percentage-change charts across 1H, 24H, 7D, 30D, 3M, and 1Y.',
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 group-hover:border-cyan-400/60',
      badge: 'Interactive OHLCV',
      metrics: '6 Timeframes',
    },
    {
      id: 'live-charts',
      title: '5. Live Crypto Charts',
      subtitle: 'Surveillance & Streaming',
      description: 'Real-time price feeds, 24h highs/lows, depth movements, auto-refresh countdown, and active market orders in Indian Rupees (INR).',
      icon: <Activity className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-600/10 border-purple-500/30 group-hover:border-purple-400/60',
      badge: 'Real-Time Feed',
      metrics: 'Auto-Refresh 15s',
    },
    {
      id: 'prices',
      title: '6. Current Prices',
      subtitle: 'Core 5 Asset Cards',
      description: 'Clean fintech rate cards for Bitcoin, Ethereum, Tether, BNB, and Solana with live INR prices, 24h % change, Market Cap, and 24h Volume.',
      icon: <Coins className="w-6 h-6 text-indigo-400" />,
      color: 'from-indigo-500/20 to-violet-600/10 border-indigo-500/30 group-hover:border-indigo-400/60',
      badge: 'Core 5 Dashboard',
      metrics: '₹ INR Denominated',
    },
    {
      id: 'assistant',
      title: '7. AI Crypto Assistant',
      subtitle: 'Intelligent Market Analyst',
      description: 'Ask deep questions about crypto trends, risk factors, technical concepts, and comparisons grounded in real-time INR prices using Gemini AI.',
      icon: <Bot className="w-6 h-6 text-pink-400" />,
      color: 'from-pink-500/20 to-rose-600/10 border-pink-500/30 group-hover:border-pink-400/60',
      badge: 'Gemini 3.8 Flash',
      metrics: 'Objective Analysis',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Welcome Banner & Macro Metrics */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Institutional Terminal Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              CryptoCore Central Navigation Hub
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Select any analytical suite or educational track below. All market metrics and order movements are updated in real-time in Indian Rupees (₹).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('assistant')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
            <button
              onClick={onOpenWallets}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Manage Wallets</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total 5-Coin Market Cap
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              {formatCompactInr(totalMarketCapInr)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">BTC, ETH, USDT, BNB, SOL</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              24h Total Trading Volume
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-cyan-300 mt-1">
              {formatCompactInr(totalVolumeInr)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Aggregated INR liquidity</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bitcoin Dominance
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1">
              {btcDominance}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Relative to core 5 basket</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Storage Engine
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5" /> PostgreSQL
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cloud SQL asia-southeast1</div>
          </div>
        </div>
      </div>

      {/* 5 Core Cryptocurrencies Fast Price Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Five Major Cryptocurrencies Live Overview
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('prices')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>View Full Price Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {coins.map((coin) => {
            const isPositive = coin.priceChangePercentage24h >= 0;
            return (
              <div
                key={coin.id}
                onClick={() => {
                  if (onSelectCoinForAnalysis) onSelectCoinForAnalysis(coin.id);
                  setActiveTab('analysis');
                }}
                className="glass-panel glass-card-hover p-4 rounded-2xl border border-white/10 cursor-pointer relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                      {coin.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                        {coin.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{coin.symbol}</div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isPositive ? '+' : ''}{coin.priceChangePercentage24h.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 font-medium">Current Price</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-white">
                    {formatInr(coin.currentPriceInr, coin.currentPriceInr > 1000 ? 0 : 2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">24h Vol</span>
                    <span className="text-slate-200 font-mono font-medium">{formatCompactInr(coin.totalVolumeInr)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Market Cap</span>
                    <span className="text-slate-200 font-mono font-medium">{formatCompactInr(coin.marketCapInr)}</span>
                  </div>
                </div>

                <div className="mt-2 text-right">
                  <span className="text-[10px] text-cyan-400/80 group-hover:text-cyan-300 font-semibold flex items-center justify-end gap-0.5">
                    Analyze <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 7 Separate Navigation Hub Modules */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Dedicated Platform Modules</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Navigate to individual dedicated interfaces for learning, deep charting, technical indicators, and AI analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`glass-panel glass-card-hover p-6 rounded-3xl border bg-gradient-to-br ${m.color} cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
            >
              {/* Corner Ambient Glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition duration-500 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 group-hover:scale-110 transition duration-300 shadow-md">
                    {m.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-white/10">
                    {m.badge}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {m.subtitle}
                </div>
                <h3 className="text-lg font-bold text-white mt-1 group-hover:text-cyan-300 transition">
                  {m.title}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mt-2.5">
                  {m.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {m.metrics}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
