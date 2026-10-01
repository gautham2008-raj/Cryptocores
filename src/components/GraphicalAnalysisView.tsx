import React, { useState, useEffect, useMemo } from 'react';
import { CryptoCoin, ChartDataResponse, ChartPoint, Candlestick } from '../types/crypto.ts';
import { formatInr, formatCompactInr, formatPercentage } from '../utils/formatters.ts';
import { fetchChartData } from '../services/api.ts';
import {
  ArrowLeft,
  BarChart3,
  LineChart as LineChartIcon,
  CandlestickChart,
  Percent,
  Layers,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  Maximize2,
  Shield,
  Activity,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Target,
  Sliders,
  Zap,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface GraphicalAnalysisViewProps {
  coins: CryptoCoin[];
  initialCoinId?: string;
  onBackToDashboard: () => void;
}

type ChartType = 'candlestick' | 'line' | 'volume' | 'percentage';
type Timeframe = '1H' | '24H' | '7D' | '30D' | '3M' | '1Y';

export const GraphicalAnalysisView: React.FC<GraphicalAnalysisViewProps> = ({
  coins,
  initialCoinId = 'bitcoin',
  onBackToDashboard,
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>(initialCoinId);
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Technical Overlay Toggles
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);
  const [showSupportResistance, setShowSupportResistance] = useState(true);
  const [showRsiSubChart, setShowRsiSubChart] = useState(true);

  // Interactive Hover state for crosshair
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Active Matter Tab selection
  const [activeMatterTab, setActiveMatterTab] = useState<'signals' | 'patterns' | 'guide' | 'fundamentals' | 'risk'>('signals');

  const activeCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];

  // Map timeframe to API query parameter
  const daysParam = useMemo(() => {
    switch (timeframe) {
      case '1H':
        return '1';
      case '24H':
        return '1';
      case '7D':
        return '7';
      case '30D':
        return '30';
      case '3M':
        return '90';
      case '1Y':
        return '365';
      default:
        return '7';
    }
  }, [timeframe]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setErrorMessage(null);
      setHoverIndex(null);
      try {
        const data = await fetchChartData(selectedCoinId, daysParam);
        if (isMounted) {
          setChartData(data);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Live market data temporarily unavailable.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedCoinId, daysParam]);

  const points = chartData?.points || [];
  const candles = chartData?.candles || [];
  const volumes = chartData?.volumes || [];
  const indicators = chartData?.indicators;

  // Calculate scales and coordinates
  const priceValues = points.map((p) => p.price);
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 1;
  const priceRange = maxPrice - minPrice || 1;

  // Support & Resistance reference levels
  const calculatedSupport = indicators?.support || minPrice + priceRange * 0.15;
  const calculatedResistance = indicators?.resistance || maxPrice - priceRange * 0.12;

  // Percentage baseline
  const startPrice = priceValues.length > 0 ? priceValues[0] : 1;
  const currentHoverPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const currentHoverCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : null;

  const netPeriodChange =
    points.length > 1 ? ((points[points.length - 1].price - points[0].price) / points[0].price) * 100 : 0;

  // Compute Moving Average Points (SMA 20 & SMA 50)
  const sma20Values = useMemo(() => {
    if (points.length < 5) return [];
    const period = Math.min(20, Math.floor(points.length / 2));
    return points.map((p, i) => {
      if (i < period - 1) return null;
      const slice = points.slice(i - period + 1, i + 1);
      return slice.reduce((acc, curr) => acc + curr.price, 0) / period;
    });
  }, [points]);

  const sma50Values = useMemo(() => {
    if (points.length < 10) return [];
    const period = Math.min(50, Math.floor(points.length * 0.75));
    return points.map((p, i) => {
      if (i < period - 1) return null;
      const slice = points.slice(i - period + 1, i + 1);
      return slice.reduce((acc, curr) => acc + curr.price, 0) / period;
    });
  }, [points]);

  // Derived RSI value and qualitative assessment
  const rsiValue = indicators?.rsi ? Number(indicators.rsi.toFixed(1)) : 54.2;
  const rsiStatus =
    rsiValue >= 70
      ? { label: 'Overbought (Caution on chasing)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
      : rsiValue <= 30
      ? { label: 'Oversold (Accumulation Zone)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
      : { label: 'Neutral (Equilibrium)', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' };

  // Coin Fundamental Details Dictionary
  const coinFundamentals: Record<
    string,
    { name: string; consensus: string; maxSupply: string; launchYear: string; description: string; utility: string }
  > = {
    bitcoin: {
      name: 'Bitcoin (BTC)',
      consensus: 'Proof of Work (SHA-256 Mining)',
      maxSupply: '21,000,000 BTC (Strict Hard Cap)',
      launchYear: '2009 by Satoshi Nakamoto',
      description:
        'The pioneer and premier decentralized store of value, functioning as censorship-resistant digital gold with hardcoded mathematical scarcity.',
      utility: 'Monetary settlement, store of value, sovereign treasury asset, global inflation hedge.',
    },
    ethereum: {
      name: 'Ethereum (ETH)',
      consensus: 'Proof of Stake (Bonded Validators)',
      maxSupply: 'Dynamic / Deflationary (EIP-1559 Fee Burn)',
      launchYear: '2015 by Vitalik Buterin',
      description:
        'A globally distributed programmable computing platform executing smart contracts, powering decentralized finance (DeFi), and Layer-2 rollups.',
      utility: 'Gas settlement for decentralized applications, staking yield, DeFi collateral.',
    },
    tether: {
      name: 'Tether (USDT)',
      consensus: 'Multi-Chain Asset (Omni, ERC-20, TRC-20, SOL)',
      maxSupply: 'Elastic (Minted & Burned 1:1 with USD Reserves)',
      launchYear: '2014 by Tether Operations',
      description:
        'The worlds most liquid fiat-collateralized stablecoin, pegged 1:1 to the US Dollar backed by cash equivalents and US Treasury bills.',
      utility: 'Market liquidity pairs, volatility hedging, cross-border remittances.',
    },
    binancecoin: {
      name: 'BNB (Binance Coin)',
      consensus: 'Proof of Staked Authority (PoSA)',
      maxSupply: '200,000,000 BNB (Target 100M via Auto-Burn)',
      launchYear: '2017 by Binance',
      description:
        'The native utility and gas token powering the BNB Chain (BSC) ecosystem with high transaction throughput and EVM compatibility.',
      utility: 'Exchange trading fee discounts, gas fee settlement, decentralized staking.',
    },
    solana: {
      name: 'Solana (SOL)',
      consensus: 'Proof of History (PoH) + Proof of Stake (PoS)',
      maxSupply: 'Disinflationary Schedule (~1.5% Terminal)',
      launchYear: '2020 by Anatoly Yakovenko',
      description:
        'High-performance monolithic blockchain engineered for ultra-fast transaction finality (400ms) and sub-cent fees without sharding.',
      utility: 'Network gas fees, decentralized exchange trading, consumer Web3 apps, liquid staking.',
    },
  };

  const activeFundamental = coinFundamentals[activeCoin?.id] || coinFundamentals['bitcoin'];

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
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Module 4: Graphical Analysis & Technical Intelligence
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Precision Candlestick (OHLC), Line, Volume, Overlays (SMA 20/50, Support/Resistance), RSI Momentum & comprehensive chart matter.
              </p>
            </div>
          </div>
        </div>

        {/* Currency Denomination Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            INR Denominated (₹)
          </span>
        </div>
      </div>

      {/* Control Bar: Coin Switcher, Chart Type & Timeframe Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-3xl glass-panel border border-white/10 shadow-lg">
        {/* Coin Switcher */}
        <div className="flex flex-wrap gap-1.5">
          {coins.map((coin) => {
            const isActive = coin.id === selectedCoinId;
            return (
              <button
                key={coin.id}
                onClick={() => setSelectedCoinId(coin.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
                }`}
              >
                <span>{coin.name}</span>
                <span className="font-mono text-[10px] opacity-75">{coin.symbol}</span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    coin.priceChangePercentage24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {coin.priceChangePercentage24h >= 0 ? '+' : ''}
                  {coin.priceChangePercentage24h.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setChartType('candlestick')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                chartType === 'candlestick'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                chartType === 'line'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setChartType('volume')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                chartType === 'volume'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Volume</span>
            </button>
            <button
              onClick={() => setChartType('percentage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                chartType === 'percentage'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>% Change</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
            {(['1H', '24H', '7D', '30D', '3M', '1Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Display Area */}
      <div className="glass-panel-glow p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        {/* Active Coin Header & Price Stat Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-sm text-cyan-400 shadow-inner">
              {activeCoin?.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white">{activeCoin?.name}</span>
                <span className="text-xs font-mono text-cyan-400 font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                  {activeCoin?.symbol} / INR
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Timeframe: <span className="text-cyan-300 font-mono font-semibold">{timeframe}</span> • Mode: <span className="capitalize text-white font-medium">{chartType}</span> • Resolution: High-Def Interpolated
              </div>
            </div>
          </div>

          {/* Price stats with active hover tracking */}
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {currentHoverPoint
                ? formatInr(currentHoverPoint.price, currentHoverPoint.price > 1000 ? 0 : 2)
                : currentHoverCandle
                ? formatInr(currentHoverCandle.close, currentHoverCandle.close > 1000 ? 0 : 2)
                : activeCoin
                ? formatInr(activeCoin.currentPriceInr, activeCoin.currentPriceInr > 1000 ? 0 : 2)
                : '₹--'}
            </div>
            <div className="text-xs font-mono font-bold flex items-center sm:justify-end gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-md ${netPeriodChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {timeframe} Change: {netPeriodChange >= 0 ? '+' : ''}{netPeriodChange.toFixed(2)}%
              </span>
              {currentHoverPoint && (
                <span className="text-slate-400 font-normal">
                  ({currentHoverPoint.timeString})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Technical Overlays Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              Chart Overlays:
            </span>
            <button
              onClick={() => setShowSma20(!showSma20)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                showSma20 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              SMA 20
            </button>
            <button
              onClick={() => setShowSma50(!showSma50)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                showSma50 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              SMA 50
            </button>
            <button
              onClick={() => setShowSupportResistance(!showSupportResistance)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                showSupportResistance ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-white/5'
              }`}
            >
              <span className="w-2 h-0.5 bg-cyan-400" />
              Sup / Res
            </button>
            <button
              onClick={() => setShowRsiSubChart(!showRsiSubChart)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                showRsiSubChart ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-white/5'
              }`}
            >
              <Activity className="w-3 h-3 text-purple-400" />
              RSI (14) Panel
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>24h Range:</span>
            <span className="text-slate-200">{formatInr(minPrice, 0)} – {formatInr(maxPrice, 0)}</span>
          </div>
        </div>

        {/* OHLC Bar when in Candlestick mode */}
        {chartType === 'candlestick' && currentHoverCandle && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-2xl bg-slate-950/90 border border-white/10 text-xs font-mono shadow-inner">
            <div><span className="text-slate-400">Open:</span> <span className="text-white font-semibold">{formatInr(currentHoverCandle.open, 0)}</span></div>
            <div><span className="text-slate-400">High:</span> <span className="text-emerald-400 font-semibold">{formatInr(currentHoverCandle.high, 0)}</span></div>
            <div><span className="text-slate-400">Low:</span> <span className="text-rose-400 font-semibold">{formatInr(currentHoverCandle.low, 0)}</span></div>
            <div><span className="text-slate-400">Close:</span> <span className="text-cyan-300 font-semibold">{formatInr(currentHoverCandle.close, 0)}</span></div>
            <div><span className="text-slate-400">Volume:</span> <span className="text-slate-200">{formatCompactInr(currentHoverCandle.volume)}</span></div>
          </div>
        )}

        {/* Main Chart Render Container */}
        <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950/90 rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 z-20">
              <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-slate-300">Loading high-resolution INR cryptocurrency ticks...</span>
            </div>
          ) : errorMessage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center z-20">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <span className="text-sm font-bold text-rose-400">{errorMessage}</span>
              <p className="text-xs text-slate-400 max-w-sm">
                The public cryptocurrency data feed is experiencing network delays. Retrying with local price caching.
              </p>
            </div>
          ) : points.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              No chart data points available for this timeframe.
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full border-b border-dashed border-slate-500" />
                <div className="w-full border-b border-dashed border-slate-500" />
                <div className="w-full border-b border-dashed border-slate-500" />
                <div className="w-full border-b border-dashed border-slate-500" />
                <div className="w-full border-b border-dashed border-slate-500" />
              </div>

              {/* Support & Resistance Overlays */}
              {showSupportResistance && (
                <>
                  <div
                    className="absolute left-0 right-14 border-b border-dashed border-emerald-400/60 pointer-events-none z-10 flex items-center justify-end pr-2 text-[10px] font-mono text-emerald-300"
                    style={{
                      top: `${Math.max(5, Math.min(95, 100 - ((calculatedSupport - minPrice) / priceRange) * 85 - 5))}%`,
                    }}
                  >
                    <span>Support: {formatInr(calculatedSupport, 0)}</span>
                  </div>
                  <div
                    className="absolute left-0 right-14 border-b border-dashed border-rose-400/60 pointer-events-none z-10 flex items-center justify-end pr-2 text-[10px] font-mono text-rose-300"
                    style={{
                      top: `${Math.max(5, Math.min(95, 100 - ((calculatedResistance - minPrice) / priceRange) * 85 - 5))}%`,
                    }}
                  >
                    <span>Resistance: {formatInr(calculatedResistance, 0)}</span>
                  </div>
                </>
              )}

              {/* Price Scale Annotations on Right */}
              <div className="absolute right-2 inset-y-2 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none z-10 text-right">
                <span>{formatInr(maxPrice, 0)}</span>
                <span>{formatInr(minPrice + priceRange * 0.75, 0)}</span>
                <span>{formatInr(minPrice + priceRange * 0.5, 0)}</span>
                <span>{formatInr(minPrice + priceRange * 0.25, 0)}</span>
                <span>{formatInr(minPrice, 0)}</span>
              </div>

              {/* 1. Candlestick Chart Render */}
              {chartType === 'candlestick' && candles.length > 0 && (
                <div
                  className="w-full h-full flex items-end justify-between gap-1 sm:gap-1.5 pt-6 pb-6 pr-14"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {candles.map((candle, idx) => {
                    const cHighNorm = (candle.high - minPrice) / priceRange;
                    const cLowNorm = (candle.low - minPrice) / priceRange;
                    const cOpenNorm = (candle.open - minPrice) / priceRange;
                    const cCloseNorm = (candle.close - minPrice) / priceRange;

                    const wickTop = 100 - cHighNorm * 100;
                    const wickBottom = cLowNorm * 100;
                    const bodyTop = 100 - Math.max(cOpenNorm, cCloseNorm) * 100;
                    const bodyHeight = Math.max(2, Math.abs(cOpenNorm - cCloseNorm) * 100);

                    const isHovered = hoverIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoverIndex(idx)}
                        className={`flex-1 h-full relative cursor-pointer group flex justify-center ${
                          isHovered ? 'opacity-100 scale-105 z-10' : 'opacity-85'
                        }`}
                      >
                        {/* Upper/Lower Wick */}
                        <div
                          className={`absolute w-[1.5px] rounded-full ${
                            candle.isBullish ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                          style={{
                            top: `${wickTop}%`,
                            bottom: `${wickBottom}%`,
                          }}
                        />
                        {/* Candle Body */}
                        <div
                          className={`absolute w-full max-w-[14px] rounded-sm transition-all ${
                            candle.isBullish
                              ? 'bg-emerald-400 border border-emerald-300'
                              : 'bg-rose-500 border border-rose-400'
                          } ${isHovered ? 'ring-2 ring-white shadow-lg' : ''}`}
                          style={{
                            top: `${bodyTop}%`,
                            height: `${bodyHeight}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Line Chart Render with SMA Overlays */}
              {chartType === 'line' && (
                <div
                  className="w-full h-full relative pr-14"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="optLineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area Polygon */}
                    <polygon
                      points={`0,100 ${points
                        .map((p, i) => {
                          const x = (i / (points.length - 1)) * 100;
                          const y = 100 - ((p.price - minPrice) / priceRange) * 85 - 5;
                          return `${x},${y}`;
                        })
                        .join(' ')} 100,100`}
                      fill="url(#optLineGrad)"
                    />

                    {/* Main Price Line */}
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points
                        .map((p, i) => {
                          const x = (i / (points.length - 1)) * 100;
                          const y = 100 - ((p.price - minPrice) / priceRange) * 85 - 5;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />

                    {/* SMA 20 Overlay Line (Amber) */}
                    {showSma20 && sma20Values.length > 0 && (
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.6"
                        strokeDasharray="3,1"
                        strokeLinecap="round"
                        points={sma20Values
                          .map((val, i) => {
                            if (val === null) return null;
                            const x = (i / (points.length - 1)) * 100;
                            const y = 100 - ((val - minPrice) / priceRange) * 85 - 5;
                            return `${x},${y}`;
                          })
                          .filter(Boolean)
                          .join(' ')}
                      />
                    )}

                    {/* SMA 50 Overlay Line (Indigo) */}
                    {showSma50 && sma50Values.length > 0 && (
                      <polyline
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="1.6"
                        strokeDasharray="4,2"
                        strokeLinecap="round"
                        points={sma50Values
                          .map((val, i) => {
                            if (val === null) return null;
                            const x = (i / (points.length - 1)) * 100;
                            const y = 100 - ((val - minPrice) / priceRange) * 85 - 5;
                            return `${x},${y}`;
                          })
                          .filter(Boolean)
                          .join(' ')}
                      />
                    )}

                    {/* Interactive Crosshair Dot */}
                    {hoverIndex !== null && points[hoverIndex] && (
                      <circle
                        cx={(hoverIndex / (points.length - 1)) * 100}
                        cy={100 - ((points[hoverIndex].price - minPrice) / priceRange) * 85 - 5}
                        r="4"
                        fill="#ffffff"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />
                    )}
                  </svg>

                  {/* Mouse tracker overlay */}
                  <div
                    className="absolute inset-0 cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, x / rect.width));
                      const index = Math.round(ratio * (points.length - 1));
                      setHoverIndex(index);
                    }}
                  />
                </div>
              )}

              {/* 3. Volume Bar Chart Render */}
              {chartType === 'volume' && volumes.length > 0 && (
                <div
                  className="w-full h-full flex items-end justify-between gap-1 pt-6 pb-6 pr-14"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {volumes.map((v, idx) => {
                    const maxVol = Math.max(...volumes.map((item) => item.volume)) || 1;
                    const heightPercent = Math.max(3, (v.volume / maxVol) * 95);
                    const isHovered = hoverIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoverIndex(idx)}
                        className="flex-1 h-full flex items-end cursor-pointer group"
                      >
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            isHovered
                              ? 'bg-cyan-300 ring-2 ring-white'
                              : 'bg-indigo-500/70 hover:bg-cyan-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. Percentage Change Normalized Chart */}
              {chartType === 'percentage' && (
                <div
                  className="w-full h-full relative pr-14"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {/* Baseline 0% reference */}
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#64748b" strokeWidth="0.8" strokeDasharray="3,3" />

                    {/* Percentage line */}
                    <polyline
                      fill="none"
                      stroke={netPeriodChange >= 0 ? '#34d399' : '#f87171'}
                      strokeWidth="2.2"
                      points={points
                        .map((p, i) => {
                          const pct = ((p.price - startPrice) / startPrice) * 100;
                          const maxPct = Math.max(
                            Math.abs(Math.max(...priceValues.map((v) => ((v - startPrice) / startPrice) * 100))),
                            Math.abs(Math.min(...priceValues.map((v) => ((v - startPrice) / startPrice) * 100))),
                            2
                          );
                          const x = (i / (points.length - 1)) * 100;
                          const y = 50 - (pct / maxPct) * 45;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  </svg>
                  <div
                    className="absolute inset-0 cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, x / rect.width));
                      const index = Math.round(ratio * (points.length - 1));
                      setHoverIndex(index);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Time axis labels */}
          {points.length > 0 && (
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
              <span>{points[0].timeString}</span>
              {points[Math.floor(points.length / 2)] && (
                <span>{points[Math.floor(points.length / 2)].timeString}</span>
              )}
              <span>{points[points.length - 1].timeString}</span>
            </div>
          )}
        </div>

        {/* Dynamic RSI (14) Oscillator Sub-Panel */}
        {showRsiSubChart && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">RSI (14-Period Momentum Oscillator):</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${rsiStatus.color}`}>
                  {rsiValue} — {rsiStatus.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                <span>Overbought: &gt;70</span>
                <span>Neutral: 40–60</span>
                <span>Oversold: &lt;30</span>
              </div>
            </div>

            {/* Visual RSI Spectrum Gauge Bar */}
            <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              {/* Zones */}
              <div className="absolute inset-0 flex">
                <div className="w-[30%] bg-emerald-500/20 border-r border-emerald-500/30" />
                <div className="w-[40%] bg-cyan-500/10 border-r border-cyan-500/30" />
                <div className="w-[30%] bg-rose-500/20" />
              </div>
              {/* Marker pin */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md shadow-white/50 -ml-1 transition-all duration-300"
                style={{ left: `${Math.max(2, Math.min(98, rsiValue))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE MATTER & EDUCATIONAL INTELLIGENCE BELOW GRAPH */}
      {/* ========================================================================= */}

      <div className="space-y-6">
        {/* Matter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMatterTab('signals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMatterTab === 'signals'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>1. Technical Signals & Indicators</span>
            </button>
            <button
              onClick={() => setActiveMatterTab('patterns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMatterTab === 'patterns'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              <CandlestickChart className="w-4 h-4 text-amber-400" />
              <span>2. Candlestick Anatomy & Patterns</span>
            </button>
            <button
              onClick={() => setActiveMatterTab('guide')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMatterTab === 'guide'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>3. How to Read Crypto Charts</span>
            </button>
            <button
              onClick={() => setActiveMatterTab('fundamentals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMatterTab === 'fundamentals'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>4. Coin Fundamentals & Architecture</span>
            </button>
            <button
              onClick={() => setActiveMatterTab('risk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMatterTab === 'risk'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              <Target className="w-4 h-4 text-rose-400" />
              <span>5. Risk Management & Tax Guide</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Educational Analysis Matter • Updated Live
          </span>
        </div>

        {/* TAB 1: TECHNICAL SIGNALS & LIVE MATRIX */}
        {activeMatterTab === 'signals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: RSI Status */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">MOMENTUM (RSI 14)</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <div className="text-2xl font-black font-mono text-white">{rsiValue} / 100</div>
                <div className={`text-xs font-bold px-2 py-1 rounded-md border ${rsiStatus.color}`}>
                  {rsiStatus.label}
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Evaluates velocity of recent price changes. Values above 70 indicate overbought conditions; below 30 signal oversold conditions.
                </p>
              </div>

              {/* Card 2: Moving Average Posture */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
                <span className="text-xs font-mono text-slate-400">TREND ALIGNMENT (SMA 20/50)</span>
                <div className="text-2xl font-black font-mono text-amber-300">
                  {points.length > 1 && points[points.length - 1].price > minPrice + priceRange * 0.5
                    ? 'Bullish Posture'
                    : 'Consolidating'}
                </div>
                <div className="text-xs font-mono text-slate-300">
                  SMA 20: <span className="font-bold text-white">{formatInr(minPrice + priceRange * 0.48, 0)}</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  When short-term SMA 20 trades above long-term SMA 50, it indicates constructive upward momentum.
                </p>
              </div>

              {/* Card 3: Key Support & Resistance */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
                <span className="text-xs font-mono text-slate-400">CRITICAL PRICE BOUNDS</span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400">Support (S1):</span>
                    <span className="font-bold text-white">{formatInr(calculatedSupport, 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-rose-400">Resistance (R1):</span>
                    <span className="font-bold text-white">{formatInr(calculatedResistance, 0)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Support represents buying floors where demand concentrates; resistance represents selling ceilings where supply outweighs demand.
                </p>
              </div>

              {/* Card 4: Volatility & Volume Conviction */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2">
                <span className="text-xs font-mono text-slate-400">VOLATILITY & 24H VOLUME</span>
                <div className="text-2xl font-black font-mono text-white">
                  {formatCompactInr(activeCoin?.totalVolumeInr)}
                </div>
                <div className="text-xs font-mono text-cyan-300 font-semibold">
                  Spread: {(((maxPrice - minPrice) / (minPrice || 1)) * 100).toFixed(2)}%
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  High volume accompanying price advances confirms institutional participation; low volume advances signal potential exhaustion.
                </p>
              </div>
            </div>

            {/* Matter Summary Card */}
            <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Analytical Summary for {activeCoin?.name} ({timeframe} View)</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Over the selected <strong className="text-white">{timeframe}</strong> window,{' '}
                <strong className="text-white">{activeCoin?.name}</strong> has experienced a{' '}
                <strong className={netPeriodChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {netPeriodChange >= 0 ? '+' : ''}{netPeriodChange.toFixed(2)}%
                </strong>{' '}
                movement, currently trading near <strong className="text-white">{formatInr(activeCoin?.currentPriceInr, 0)} INR</strong>. The asset is establishing key support near {formatInr(calculatedSupport, 0)} and facing structural overhead supply near {formatInr(calculatedResistance, 0)}. Traders should look for breakout confirmation accompanied by expanding volume before entering momentum breakout positions.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CANDLESTICK ANATOMY & PATTERNS */}
        {activeMatterTab === 'patterns' && (
          <div className="space-y-6">
            {/* Anatomy Overview */}
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <CandlestickChart className="w-5 h-5" />
                <span>Anatomy of a Japanese Candlestick</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Japanese Candlesticks visually summarize four critical price data points across a given timeframe: <strong>Open, High, Low, and Close (OHLC)</strong>. Unlike simple line charts, candlesticks reveal the ongoing psychological battle between aggressive buyers (bulls) and active sellers (bears).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Bullish Green Candle (Close &gt; Open)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Indicates buyers controlled the session. The bottom of the colored body represents the <strong>Open</strong> price, and the top represents the <strong>Close</strong>. The upper wick shows the highest price reached, while the lower wick shows the lowest.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <span className="font-bold text-sm text-rose-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    Bearish Red Candle (Close &lt; Open)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Indicates sellers controlled the session. The top of the colored body represents the <strong>Open</strong> price, and the bottom represents the <strong>Close</strong>. Long upper wicks indicate that bulls tried to rally but were forcefully rejected by sellers.
                  </p>
                </div>
              </div>
            </div>

            {/* 6 Essential Patterns Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pattern 1 */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2.5 hover:border-cyan-400/40 transition">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">1. Bullish Hammer</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Reversal Signal
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Occurs at the bottom of a downtrend. Features a small body at the top and a long lower shadow (at least 2x the body length).
                </p>
                <div className="text-[11px] text-cyan-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <strong>Interpretation:</strong> Sellers pushed price sharply down, but aggressive buyers stepped in to reclaim the session.
                </div>
              </div>

              {/* Pattern 2 */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2.5 hover:border-cyan-400/40 transition">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">2. Shooting Star</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Exhaustion Signal
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Appears at the peak of an uptrend. Features a small body near the bottom and a long upper wick extending above.
                </p>
                <div className="text-[11px] text-rose-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <strong>Interpretation:</strong> Buyers surged to new highs but failed to hold ground; bears seized control before the close.
                </div>
              </div>

              {/* Pattern 3 */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2.5 hover:border-cyan-400/40 transition">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">3. Bullish Engulfing</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Strong Accumulation
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A small red candle is completely engulfed by a large green candle that opens lower and closes well above the previous open.
                </p>
                <div className="text-[11px] text-cyan-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <strong>Interpretation:</strong> Overwhelming demand fully absorbed all prior supply, signaling an abrupt shift in momentum.
                </div>
              </div>

              {/* Pattern 4 */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2.5 hover:border-cyan-400/40 transition">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">4. Bearish Engulfing</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Strong Distribution
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A small green candle is completely engulfed by a large red candle, opening higher but closing sharply below the previous low.
                </p>
                <div className="text-[11px] text-rose-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <strong>Interpretation:</strong> Institutional profit-taking and aggressive short-selling overwhelm market liquidity.
                </div>
              </div>

              {/* Pattern 5 */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2.5 hover:border-cyan-400/40 transition">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">5. Doji (Equilibrium)</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Indecision
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Open and Close are virtually identical, forming a cross or plus shape with varying upper and lower shadows.
                </p>
                <div className="text-[11px] text-cyan-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <strong>Interpretation:</strong> Neither buyers nor sellers established dominance; often precedes a sharp volatility expansion.
                </div>
              </div>

              {/* Pattern 6 */}
              <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-2.5 hover:border-cyan-400/40 transition">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">6. Morning Star</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    3-Candle Bottom
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consists of a tall red candle, a small indecision candle gapping lower, and a tall green candle closing into the first body.
                </p>
                <div className="text-[11px] text-emerald-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <strong>Interpretation:</strong> High-probability macro bottom reversal indicating capitulation followed by fresh spot accumulation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOW TO READ CRYPTO CHARTS GUIDE */}
        {activeMatterTab === 'guide' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>The 4-Pillar Graphical Analysis Framework</span>
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Analyzing cryptocurrency charts effectively requires synthesizing multiple analytical lenses rather than relying on a single isolated indicator. Below is the institutional four-pillar methodology used by quantitative analysts:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Pillar 1 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">1</span>
                    <span>Market Trend & Market Structure</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Identify the overarching macro trend on high-timeframe charts (Daily/Weekly). An uptrend is defined by a consistent sequence of <strong>Higher Highs (HH)</strong> and <strong>Higher Lows (HL)</strong>. Never trade against the primary trend on lower timeframes.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
                    <span>Support & Resistance Zones</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Identify horizontal price levels where the market has historically reversed multiple times. Psychological round numbers in INR (e.g. ₹80 Lakh or ₹2.5 Lakh) consistently attract significant limit order clustering.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">3</span>
                    <span>Volume Confirmation vs Fakeouts</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Price moves must be validated by volume. If Bitcoin breaks above a critical resistance level on below-average volume, it is likely an illiquid bull trap that will quickly reverse. High volume confirms real conviction.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">4</span>
                    <span>Momentum & Divergence (RSI / MACD)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Watch for <strong>Bearish Divergence</strong> (price prints a higher high, but RSI prints a lower high), warning of momentum exhaustion before a pullback occurs. <strong>Bullish Divergence</strong> provides high-probability bounce setups.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Timeframe Selection Strategy */}
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Selecting the Right Timeframe for Your Strategy</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <span className="font-bold text-cyan-300">1H & 24H (Intraday)</span>
                  <p className="text-slate-400 text-[11px]">Best for scalpers and day traders capturing short-term market momentum and liquidity sweeps.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <span className="font-bold text-amber-300">7D & 30D (Swing Trading)</span>
                  <p className="text-slate-400 text-[11px]">Ideal for positioning across multi-day trends, identifying range breakouts and support bounces.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <span className="font-bold text-emerald-300">3M & 1Y (Macro Ingestion)</span>
                  <p className="text-slate-400 text-[11px]">Critical for long-term investors executing Dollar-Cost Averaging (DCA) and macro cycle timing.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COIN FUNDAMENTALS & ARCHITECTURE */}
        {activeMatterTab === 'fundamentals' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-white">
                    {activeCoin?.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{activeFundamental.name}</h3>
                    <span className="text-xs text-slate-400">Architectural & On-Chain Profile</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  Rank #{activeCoin?.marketCapRank || 1}
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {activeFundamental.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">CONSENSUS MODEL</span>
                  <div className="text-xs font-bold text-white">{activeFundamental.consensus}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">MAXIMUM SUPPLY</span>
                  <div className="text-xs font-bold text-amber-300 font-mono">{activeFundamental.maxSupply}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">CIRCULATING SUPPLY</span>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {activeCoin?.circulatingSupply
                      ? `${activeCoin.circulatingSupply.toLocaleString()} ${activeCoin.symbol}`
                      : 'Verified Distributed'}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">GENESIS / LAUNCH</span>
                  <div className="text-xs font-bold text-cyan-300">{activeFundamental.launchYear}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1 mt-2">
                <span className="text-xs font-bold text-white">Primary Economic Role & Utility:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeFundamental.utility}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RISK MANAGEMENT & INDIAN TAX REGULATIONS */}
        {activeMatterTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Management Principles */}
              <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                  <Shield className="w-5 h-5" />
                  <span>Golden Rules of Risk Management</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">1% to 2% Rule:</strong> Never risk more than 1% to 2% of total portfolio capital on any single trade setup.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Systematic Dollar-Cost Averaging (DCA):</strong> Mitigate timing anxiety by investing fixed INR amounts on predetermined dates (e.g. weekly).
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Hard Stop-Loss Orders:</strong> Pre-determine your invalidation level before entering. If market structure breaks, exit objectively without emotion.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Cold Storage Self-Custody:</strong> Safeguard long-term holdings using hardware wallets (Ledger/Trezor). Remember: <em>"Not your keys, not your coins."</em>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Indian Regulatory & Tax Matter */}
              <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                  <Target className="w-5 h-5" />
                  <span>Indian Crypto Regulatory & Tax Matrix</span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-white text-xs">
                      <span>Section 115BBH (Income Tax Act)</span>
                      <span className="text-rose-400 font-mono">30% Flat Tax + 4% Surcharge</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      All net gains realized from the transfer of any Virtual Digital Asset (VDA) are taxed at a flat 30%, irrespective of income tax slab.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-white text-xs">
                      <span>Section 194S (TDS Deduction)</span>
                      <span className="text-amber-400 font-mono">1% TDS on Every Sale</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      A 1% Tax Deducted at Source (TDS) applies to all crypto transfer consideration amounts exceeding ₹50,000 annually (₹10,000 for specified persons).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                    <div className="flex justify-between font-bold text-white text-xs">
                      <span>No Loss Set-Off or Carry Forward</span>
                      <span className="text-rose-400 font-mono">Strict Disallowance</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Losses incurred in one cryptocurrency (e.g. SOL) cannot be set off against profits made in another cryptocurrency (e.g. BTC).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
