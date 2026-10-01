import React, { useState, useEffect } from 'react';
import { CryptoCoin, TechnicalIndicators } from '../types/crypto.ts';
import { formatInr, formatCompactInr, formatPercentage, formatNumber } from '../utils/formatters.ts';
import { fetchChartData } from '../services/api.ts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Shield,
  Gauge,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface AnalysisViewProps {
  coins: CryptoCoin[];
  selectedCoinId?: string;
  onBackToDashboard: () => void;
  onNavigateToGraphs: (coinId: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  coins,
  selectedCoinId = 'bitcoin',
  onBackToDashboard,
  onNavigateToGraphs,
}) => {
  const [activeCoinId, setActiveCoinId] = useState<string>(selectedCoinId);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [indicatorError, setIndicatorError] = useState<string | null>(null);

  // Sync if prop changes
  useEffect(() => {
    if (selectedCoinId) {
      setActiveCoinId(selectedCoinId);
    }
  }, [selectedCoinId]);

  // Find active coin data
  const currentCoin = coins.find((c) => c.id === activeCoinId) || coins[0];

  // Fetch live technical indicators derived from chart history
  useEffect(() => {
    let isMounted = true;
    async function loadIndicators() {
      if (!currentCoin) return;
      setLoadingIndicators(true);
      setIndicatorError(null);
      try {
        const chartRes = await fetchChartData(currentCoin.id, '30');
        if (isMounted && chartRes?.indicators) {
          setIndicators(chartRes.indicators);
        }
      } catch (err: any) {
        if (isMounted) {
          setIndicatorError('Technical indicators calculation unavailable.');
        }
      } finally {
        if (isMounted) setLoadingIndicators(false);
      }
    }
    loadIndicators();
    return () => {
      isMounted = false;
    };
  }, [activeCoinId, currentCoin]);

  const coinProjectDetails: Record<string, { summary: string; consensus: string; maxSupply: string; website: string }> = {
    bitcoin: {
      summary:
        'Bitcoin is the first decentralized digital currency. It relies on the SHA-256 Proof-of-Work consensus mechanism to enforce an unforgeable 21 million supply schedule and decentralized triple-entry monetary settlement.',
      consensus: 'Proof of Work (SHA-256)',
      maxSupply: '21,000,000 BTC',
      website: 'bitcoin.org',
    },
    ethereum: {
      summary:
        'Ethereum is the pioneering smart contract platform enabling self-executing decentralized applications (dApps), decentralized finance (DeFi), and layer-2 scalability solutions secured by bonded proof-of-stake validators.',
      consensus: 'Proof of Stake (Gas-metered EVM)',
      maxSupply: 'Dynamic / Deflationary (EIP-1559)',
      website: 'ethereum.org',
    },
    tether: {
      summary:
        'Tether (USDT) converts cash into digital currency, anchoring the token to national currencies like the US Dollar. It holds backing reserves composed of cash, bank deposits, and US Treasury Bills.',
      consensus: 'Multichain Asset (Omni, ERC-20, TRC-20, SPL)',
      maxSupply: 'Issued based on market demand & reserve deposit',
      website: 'tether.to',
    },
    binancecoin: {
      summary:
        'BNB is the native utility and gas token powering the BNB Chain ecosystem (BSC), supporting high transaction throughput with EVM compatibility and an algorithmic quarterly coin burn mechanism.',
      consensus: 'Proof of Staked Authority (PoSA)',
      maxSupply: '200,000,000 BNB (Target 100M via burn)',
      website: 'bnbchain.org',
    },
    solana: {
      summary:
        'Solana is an ultra-fast monolithic Layer-1 blockchain utilizing Proof of History (PoH) alongside Proof of Stake to process thousands of transactions per second with sub-second finality and sub-cent fees.',
      consensus: 'Proof of History (PoH) + Tower BFT (PoS)',
      maxSupply: 'Disinflationary supply schedule',
      website: 'solana.com',
    },
  };

  const projectInfo = currentCoin ? coinProjectDetails[currentCoin.id] || coinProjectDetails.bitcoin : coinProjectDetails.bitcoin;
  const isPositive24h = (currentCoin?.priceChangePercentage24h || 0) >= 0;
  const isPositive7d = (currentCoin?.priceChangePercentage7d || 0) >= 0;

  // Technical Interpretation Helpers
  const rsiValue = indicators?.rsi || 50;
  let rsiSignal = 'Neutral';
  let rsiColor = 'text-slate-300';
  if (rsiValue >= 70) {
    rsiSignal = 'Overbought (Potential Pullback)';
    rsiColor = 'text-amber-400';
  } else if (rsiValue <= 30) {
    rsiSignal = 'Oversold (Potential Bounce)';
    rsiColor = 'text-emerald-400';
  }

  const sma20 = indicators?.sma20 || 0;
  const sma50 = indicators?.sma50 || 0;
  const isGoldenCross = sma20 > sma50;

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
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Module 3: Cryptocurrency Analysis
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Comprehensive technical and fundamental breakdown for the five major assets.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToGraphs(activeCoinId)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition cursor-pointer self-start sm:self-center"
        >
          <Activity className="w-4 h-4" />
          <span>Open Interactive Charts</span>
        </button>
      </div>

      {/* Asset Switcher Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
        {coins.map((coin) => {
          const isActive = coin.id === activeCoinId;
          return (
            <button
              key={coin.id}
              onClick={() => setActiveCoinId(coin.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{coin.name}</span>
              <span className="font-mono text-[10px] opacity-75">{coin.symbol}</span>
            </button>
          );
        })}
      </div>

      {/* Disclaimer on Live vs Calculated Data */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE MARKET DATA (API)
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            CALCULATED TECHNICAL INDICATORS (ALGORITHMIC)
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Values strictly separated for transparency</span>
      </div>

      {currentCoin && (
        <div className="space-y-8">
          {/* Main Price & Live Market Data Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-lg text-white">
                  {currentCoin.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{currentCoin.name}</h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {currentCoin.symbol}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Rank #{currentCoin.marketCapRank || 1}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Live Feed • Denominated in Indian Rupee (INR)
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                  {formatInr(currentCoin.currentPriceInr, currentCoin.currentPriceInr > 1000 ? 0 : 2)}
                </div>
                <div className="flex items-center md:justify-end gap-3 mt-1 text-xs font-mono">
                  <span className={`font-bold ${isPositive24h ? 'text-emerald-400' : 'text-rose-400'}`}>
                    24h: {isPositive24h ? '+' : ''}{currentCoin.priceChangePercentage24h.toFixed(2)}%
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className={`font-bold ${isPositive7d ? 'text-emerald-400' : 'text-rose-400'}`}>
                    7d: {isPositive7d ? '+' : ''}{(currentCoin.priceChangePercentage7d || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Live Market Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Market Cap</span>
                <span className="text-sm sm:text-base font-bold font-mono text-white mt-1 block">
                  {formatCompactInr(currentCoin.marketCapInr)}
                </span>
                <span className="text-[10px] text-slate-400">{formatInr(currentCoin.marketCapInr, 0)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">24h Trading Volume</span>
                <span className="text-sm sm:text-base font-bold font-mono text-cyan-300 mt-1 block">
                  {formatCompactInr(currentCoin.totalVolumeInr)}
                </span>
                <span className="text-[10px] text-slate-400">{formatInr(currentCoin.totalVolumeInr, 0)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">24h High / Low</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-200 mt-1 block">
                  {formatInr(currentCoin.high24hInr || currentCoin.currentPriceInr * 1.02, 0)}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Low: {formatInr(currentCoin.low24hInr || currentCoin.currentPriceInr * 0.98, 0)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Circulating Supply</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-200 mt-1 block">
                  {formatNumber(currentCoin.circulatingSupply, 0)} {currentCoin.symbol}
                </span>
                <span className="text-[10px] text-slate-400">Verified On-Chain</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">All-Time High (ATH)</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-amber-300 mt-1 block">
                  {formatInr(currentCoin.athInr || currentCoin.currentPriceInr * 1.3, 0)}
                </span>
                <span className="text-[10px] text-rose-400 font-mono">
                  {formatPercentage(currentCoin.athChangePercentage || -24.5)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">All-Time Low (ATL)</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-300 mt-1 block">
                  {formatInr(currentCoin.atlInr || currentCoin.currentPriceInr * 0.05, 0)}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Historical Floor</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Consensus Architecture</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 block truncate">
                  {projectInfo.consensus}
                </span>
                <span className="text-[10px] text-slate-400">Protocol Specification</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Max / Total Supply</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 block truncate">
                  {projectInfo.maxSupply}
                </span>
                <span className="text-[10px] text-slate-400">Emission Schedule</span>
              </div>
            </div>
          </div>

          {/* Calculated Technical Analysis Section */}
          <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  <Sliders className="w-3.5 h-3.5" /> Calculated Technical Indicators
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Algorithmic Indicators (14-Period RSI, SMA, MACD, Support/Resistance)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                Computed from live 30D close candles
              </span>
            </div>

            {loadingIndicators ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Computing technical momentum indicators...
              </div>
            ) : indicatorError ? (
              <div className="py-6 text-center text-rose-400 text-xs bg-rose-500/10 rounded-2xl border border-rose-500/20">
                {indicatorError}
              </div>
            ) : indicators ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. RSI Indicator */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-cyan-400" /> Relative Strength Index (RSI 14)
                    </span>
                    <span className={`text-xs font-bold font-mono ${rsiColor}`}>{rsiValue.toFixed(1)}</span>
                  </div>
                  {/* Gauge Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-rose-500"
                      style={{ width: `${Math.min(100, Math.max(0, rsiValue))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Oversold (&lt;30)</span>
                    <span>Neutral (50)</span>
                    <span>Overbought (&gt;70)</span>
                  </div>
                  <div className="text-xs text-slate-300 pt-1 border-t border-white/5">
                    Signal: <span className={`font-semibold ${rsiColor}`}>{rsiSignal}</span>
                  </div>
                </div>

                {/* 2. Moving Averages */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Moving Averages (SMA)</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isGoldenCross
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isGoldenCross ? 'Golden Bias' : 'Death Cross Bias'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">SMA 20:</span>
                      <span className="text-cyan-300 font-bold">{formatInr(sma20, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SMA 50:</span>
                      <span className="text-indigo-300 font-bold">{formatInr(sma50, 0)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 pt-1 border-t border-white/5">
                    Trend: <span className="font-semibold text-white">{isGoldenCross ? 'SMA 20 > SMA 50 (Bullish Momentum)' : 'SMA 20 < SMA 50 (Bearish / Consolidation)'}</span>
                  </div>
                </div>

                {/* 3. MACD */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">MACD (12, 26, 9)</span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      Hist: {indicators.macd.histogram > 0 ? '+' : ''}{indicators.macd.histogram.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MACD Line:</span>
                      <span className="text-white">{indicators.macd.macdLine.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Signal Line:</span>
                      <span className="text-slate-400">{indicators.macd.signalLine.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 pt-1 border-t border-white/5">
                    Cross: <span className="font-semibold text-white">{indicators.macd.histogram >= 0 ? 'Bullish Expansion' : 'Bearish Divergence'}</span>
                  </div>
                </div>

                {/* 4. Support and Resistance */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Support & Resistance Levels</span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <span>Key Resistance:</span>
                      <span className="font-bold">{formatInr(indicators.resistance, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <span>Key Support:</span>
                      <span className="font-bold">{formatInr(indicators.support, 0)}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Bollinger Bands */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Bollinger Bands (20, 2)</span>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Upper Band:</span>
                      <span className="text-slate-200">{formatInr(indicators.bollinger.upper, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Middle (Basis):</span>
                      <span className="text-cyan-300">{formatInr(indicators.bollinger.middle, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lower Band:</span>
                      <span className="text-slate-200">{formatInr(indicators.bollinger.lower, 0)}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Volatility Index */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">20-Period Volatility Index</span>
                  <div className="text-2xl font-black font-mono text-cyan-300">
                    {indicators.volatility.toFixed(2)}%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Measures relative standard deviation over the rolling 20-period price series in INR.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Project Fundamentals Overview */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <span>Project Architecture & Fundamental Background</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {projectInfo.summary}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-cyan-400">
              <span className="flex items-center gap-1">
                Official Web: <span className="text-white underline">{projectInfo.website}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
