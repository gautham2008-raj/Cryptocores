import React, { useState, useEffect } from 'react';
import { CryptoCoin, ChartDataResponse } from '../types/crypto.ts';
import { formatInr, formatCompactInr, formatPercentage, formatDate } from '../utils/formatters.ts';
import { fetchChartData } from '../services/api.ts';
import {
  ArrowLeft,
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Clock,
  Radio,
  Sliders,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';

interface LiveChartsViewProps {
  coins: CryptoCoin[];
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshSeconds: number;
  lastUpdated: string;
  errorMessage: string | null;
  onBackToDashboard: () => void;
  onSelectCoinForAnalysis: (coinId: string) => void;
}

export const LiveChartsView: React.FC<LiveChartsViewProps> = ({
  coins,
  isRefreshing,
  onRefresh,
  refreshSeconds,
  lastUpdated,
  errorMessage,
  onBackToDashboard,
  onSelectCoinForAnalysis,
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);

  const activeCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];

  useEffect(() => {
    let isMounted = true;
    async function loadChart() {
      if (!activeCoin) return;
      setLoadingChart(true);
      try {
        const res = await fetchChartData(activeCoin.id, '1');
        if (isMounted) setChartData(res);
      } catch {
        // Handled gracefully
      } finally {
        if (isMounted) setLoadingChart(false);
      }
    }
    loadChart();
    return () => {
      isMounted = false;
    };
  }, [selectedCoinId, activeCoin]);

  const points = chartData?.points || [];
  const minPrice = points.length > 0 ? Math.min(...points.map((p) => p.price)) : 0;
  const maxPrice = points.length > 0 ? Math.max(...points.map((p) => p.price)) : 1;
  const priceRange = maxPrice - minPrice || 1;

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
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Module 5: Live Crypto Charts & Market Feed
                </h1>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Automated 15-second heartbeat market polling, INR pricing, depth volume, and live 24H micro-charts.
              </p>
            </div>
          </div>
        </div>

        {/* Live Refresh Controls */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next Sync: {refreshSeconds}s</span>
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

      {/* Global Error Banner if API Unavailable */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Surveillance Split: Left 5-Asset Table, Right Active Stream Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5 Assets Live Monitor */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Core 5 Live Watchlist (INR)</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Updated: {formatDate(lastUpdated)}
            </span>
          </div>

          <div className="space-y-3">
            {coins.map((coin) => {
              const isSelected = coin.id === selectedCoinId;
              const isPositive = coin.priceChangePercentage24h >= 0;

              // 24H High/Low Progress calculation
              const low = coin.low24hInr || coin.currentPriceInr * 0.98;
              const high = coin.high24hInr || coin.currentPriceInr * 1.02;
              const currentRangePercent = Math.max(
                0,
                Math.min(100, ((coin.currentPriceInr - low) / (high - low || 1)) * 100)
              );

              return (
                <div
                  key={coin.id}
                  onClick={() => setSelectedCoinId(coin.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {coin.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{coin.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{coin.symbol}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Vol: <span className="text-slate-200 font-mono">{formatCompactInr(coin.totalVolumeInr)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-bold font-mono text-white">
                        {formatInr(coin.currentPriceInr, coin.currentPriceInr > 1000 ? 0 : 2)}
                      </div>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}{coin.priceChangePercentage24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* 24h High/Low Range Bar */}
                  <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>24h L: {formatInr(low, 0)}</span>
                      <span>24h H: {formatInr(high, 0)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                        style={{ width: `${currentRangePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Asset Live Intraday Chart Preview */}
        <div className="lg:col-span-5 glass-panel-glow p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-slate-400">INTRADAY LIVE 24H STREAM</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeCoin?.name} ({activeCoin?.symbol})</h3>
              </div>
              <button
                onClick={() => onSelectCoinForAnalysis(activeCoin?.id || 'bitcoin')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                Deep Analysis →
              </button>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black font-mono text-white">
                {activeCoin ? formatInr(activeCoin.currentPriceInr, activeCoin.currentPriceInr > 1000 ? 0 : 2) : '₹--'}
              </div>
              <div className="text-xs font-mono text-slate-300 mt-1">
                Market Cap: <span className="font-bold text-white">{formatCompactInr(activeCoin?.marketCapInr)}</span>
              </div>
            </div>

            {/* 24H Mini Chart Area */}
            <div className="relative w-full h-56 bg-slate-950/80 rounded-2xl border border-white/5 mt-4 p-3 overflow-hidden">
              {loadingChart ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              ) : points.length > 1 ? (
                <div className="relative w-full h-full">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`0,100 ${points
                        .map((p, i) => {
                          const x = (i / (points.length - 1)) * 100;
                          const y = 100 - ((p.price - minPrice) / priceRange) * 85 - 5;
                          return `${x},${y}`;
                        })
                        .join(' ')} 100,100`}
                      fill="url(#liveGrad)"
                    />
                    <polyline
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.2"
                      points={points
                        .map((p, i) => {
                          const x = (i / (points.length - 1)) * 100;
                          const y = 100 - ((p.price - minPrice) / priceRange) * 85 - 5;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>{points[0].timeString}</span>
                    <span>{points[points.length - 1].timeString}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  Live intraday ticks synchronizing...
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Price Conversion:</span>
            <span className="font-mono text-cyan-300 font-semibold">1 USD ≈ ₹87.20 INR</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE SURVEILLANCE & MARKET MECHANICS MATTER BELOW */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Activity className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Live Cryptocurrency Surveillance & Order Flow Matter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2.5">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Heartbeat Polling & WebSocket Integrity
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              CryptoCore AI polls liquidity order books every <strong>15 seconds</strong> with fallback failover. This guarantees precision pricing denominated in Indian Rupees (INR) while protecting against exchange stale quotes during high-volatility flash crashes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2.5">
            <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              2. Order Flow & Slippage Mechanics
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Large market orders consume limit orders up the order book (slippage). The <strong>24-Hour Range Bar</strong> above displays where the current spot price sits between the daily floor and ceiling, highlighting accumulation exhaustion.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2.5">
            <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              3. Global Trading Sessions (IST)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Peak global crypto volatility occurs during the <strong>London & New York overlap (7:00 PM – 11:30 PM IST)</strong>, when institutional ETF order flows and derivative settlement windows execute concurrently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
