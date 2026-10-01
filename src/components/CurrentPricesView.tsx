import React from 'react';
import { CryptoCoin } from '../types/crypto.ts';
import { formatInr, formatCompactInr, formatPercentage, formatDate } from '../utils/formatters.ts';
import {
  ArrowLeft,
  Coins,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface CurrentPricesViewProps {
  coins: CryptoCoin[];
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshSeconds: number;
  lastUpdated: string;
  errorMessage: string | null;
  onBackToDashboard: () => void;
  onSelectCoinForAnalysis: (coinId: string) => void;
}

export const CurrentPricesView: React.FC<CurrentPricesViewProps> = ({
  coins,
  isRefreshing,
  onRefresh,
  refreshSeconds,
  lastUpdated,
  errorMessage,
  onBackToDashboard,
  onSelectCoinForAnalysis,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Module 6: Current Price Dashboard
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Real-time valuation in Indian Rupees (INR) for the 5 benchmark cryptocurrencies.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync: {refreshSeconds}s</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Error state if API is temporarily unavailable */}
      {errorMessage && (
        <div className="p-5 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3.5 text-rose-300 text-sm">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <div className="font-bold">{errorMessage}</div>
            <div className="text-xs text-rose-400/90 mt-0.5">
              Prices displayed below represent the last confirmed cache state. Automatic reconnection is active.
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Currency: <strong className="text-white">Indian Rupee (INR - ₹)</strong></span>
        </div>
        <div className="font-mono">
          Last Updated: <span className="text-slate-200">{formatDate(lastUpdated)}</span>
        </div>
      </div>

      {/* 5 Core Cryptocurrency Cards */}
      <div className="space-y-4">
        {coins.map((coin) => {
          const isPositive = coin.priceChangePercentage24h >= 0;
          const sparkline = coin.sparklineIn7d || [];
          const minSpark = sparkline.length > 0 ? Math.min(...sparkline) : 0;
          const maxSpark = sparkline.length > 0 ? Math.max(...sparkline) : 1;
          const rangeSpark = maxSpark - minSpark || 1;

          return (
            <div
              key={coin.id}
              className="glass-panel glass-card-hover p-6 rounded-3xl border border-white/10 group relative overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* 1. Coin Info */}
                <div className="md:col-span-3 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center font-extrabold text-base text-white group-hover:scale-105 transition">
                    {coin.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                      {coin.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                      <span className="font-bold text-slate-300">{coin.symbol}</span>
                      <span>•</span>
                      <span>Rank #{coin.marketCapRank || '--'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Current Price in INR & 24H Change */}
                <div className="md:col-span-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Current INR Price
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight mt-0.5">
                    {formatInr(coin.currentPriceInr, coin.currentPriceInr > 1000 ? 0 : 2)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? '+' : ''}{coin.priceChangePercentage24h.toFixed(2)}%</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({formatInr(coin.priceChange24h, 2)})
                    </span>
                  </div>
                </div>

                {/* 3. Market Cap & Volume */}
                <div className="md:col-span-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Market Cap
                    </div>
                    <div className="text-sm font-bold font-mono text-white mt-1">
                      {formatCompactInr(coin.marketCapInr)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatInr(coin.marketCapInr, 0)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      24h Volume
                    </div>
                    <div className="text-sm font-bold font-mono text-cyan-300 mt-1">
                      {formatCompactInr(coin.totalVolumeInr)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatInr(coin.totalVolumeInr, 0)}
                    </div>
                  </div>
                </div>

                {/* 4. Mini Sparkline & Action Button */}
                <div className="md:col-span-3 flex items-center justify-between gap-4">
                  {sparkline.length > 5 ? (
                    <div className="w-28 h-10 hidden sm:block">
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <polyline
                          fill="none"
                          stroke={isPositive ? '#34d399' : '#f87171'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          points={sparkline
                            .map((val, idx) => {
                              const x = (idx / (sparkline.length - 1)) * 100;
                              const y = 100 - ((val - minSpark) / rangeSpark) * 80 - 10;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                      </svg>
                      <div className="text-[9px] font-mono text-slate-500 text-center mt-0.5">7D Trend</div>
                    </div>
                  ) : (
                    <div className="w-28 hidden sm:block" />
                  )}

                  <button
                    onClick={() => onSelectCoinForAnalysis(coin.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition shadow-sm cursor-pointer ml-auto"
                  >
                    <span>Full Analysis</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
