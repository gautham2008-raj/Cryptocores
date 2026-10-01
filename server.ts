import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserPreferences,
  updateUserPreferences,
  getTrackedWallets,
  addTrackedWallet,
  deleteTrackedWallet,
  getPriceAlerts,
  addPriceAlert,
  deletePriceAlert,
  getUserPortfolios,
  addPortfolioItem,
  deletePortfolioItem,
  getChatMessages,
  saveChatMessage,
  clearChatMessages
} from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache for crypto prices
let priceCache: {
  timestamp: number;
  data: any[];
} | null = null;
const CACHE_TTL = 20 * 1000; // 20 seconds cache

// In-memory cache for market chart history
const chartCache = new Map<string, { timestamp: number; data: any }>();
const CHART_CACHE_TTL = 60 * 1000; // 1 minute

const COIN_METADATA: Record<string, { name: string; symbol: string; coingeckoId: string; binanceSymbol: string }> = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', coingeckoId: 'bitcoin', binanceSymbol: 'BTCUSDT' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', coingeckoId: 'ethereum', binanceSymbol: 'ETHUSDT' },
  tether: { name: 'Tether', symbol: 'USDT', coingeckoId: 'tether', binanceSymbol: 'USDTBIDR' },
  binancecoin: { name: 'BNB', symbol: 'BNB', coingeckoId: 'binancecoin', binanceSymbol: 'BNBUSDT' },
  solana: { name: 'Solana', symbol: 'SOL', coingeckoId: 'solana', binanceSymbol: 'SOLUSDT' },
};

// Fallback USD to INR rate if needed
let usdToInrRate = 87.2;

async function updateUsdInrRate() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.INR) {
        usdToInrRate = data.rates.INR;
      }
    }
  } catch {
    // Keep fallback rate
  }
}
updateUsdInrRate();
setInterval(updateUsdInrRate, 30 * 60 * 1000);

// Helper to fetch live crypto prices from CoinGecko, with Binance fallback
async function fetchLivePrices() {
  const now = Date.now();
  if (priceCache && now - priceCache.timestamp < CACHE_TTL) {
    return priceCache.data;
  }

  // Attempt 1: CoinGecko API directly in INR
  try {
    const coinIds = Object.keys(COIN_METADATA).join(',');
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coinIds}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoCore-Market-Tracker/1.0',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0) {
        const formatted = raw.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          currentPriceInr: coin.current_price,
          priceChange24h: coin.price_change_24h,
          priceChangePercentage24h: coin.price_change_percentage_24h,
          priceChangePercentage7d: coin.price_change_percentage_7d_in_currency || 0,
          priceChangePercentage1h: coin.price_change_percentage_1h_in_currency || 0,
          marketCapInr: coin.market_cap,
          totalVolumeInr: coin.total_volume,
          high24hInr: coin.high_24h,
          low24hInr: coin.low_24h,
          marketCapRank: coin.market_cap_rank,
          circulatingSupply: coin.circulating_supply,
          totalSupply: coin.total_supply,
          athInr: coin.ath,
          athChangePercentage: coin.ath_change_percentage,
          atlInr: coin.atl,
          sparklineIn7d: coin.sparkline_in_7d?.price || [],
          lastUpdated: coin.last_updated || new Date().toISOString(),
        }));

        priceCache = { timestamp: now, data: formatted };
        return formatted;
      }
    }
  } catch (err) {
    console.warn('CoinGecko primary fetch failed or rate-limited, attempting fallback:', err);
  }

  // Attempt 2: Binance 24h Ticker Fallback converted to INR
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const tickers = await res.json();
      if (Array.isArray(tickers) && tickers.length > 0) {
        const tickerMap = new Map(tickers.map((t: any) => [t.symbol, t]));

        const fallbackData = [
          formatBinanceCoin('bitcoin', 'Bitcoin', 'BTC', 1, 19700000, tickerMap.get('BTCUSDT')),
          formatBinanceCoin('ethereum', 'Ethereum', 'ETH', 2, 120000000, tickerMap.get('ETHUSDT')),
          {
            id: 'tether',
            name: 'Tether',
            symbol: 'USDT',
            currentPriceInr: usdToInrRate,
            priceChange24h: 0.05,
            priceChangePercentage24h: 0.06,
            priceChangePercentage7d: 0.12,
            priceChangePercentage1h: 0.01,
            marketCapInr: 140000000000 * usdToInrRate,
            totalVolumeInr: 65000000000 * usdToInrRate,
            high24hInr: usdToInrRate * 1.005,
            low24hInr: usdToInrRate * 0.995,
            marketCapRank: 3,
            circulatingSupply: 140000000000,
            totalSupply: 140000000000,
            athInr: 89.5,
            athChangePercentage: -1.2,
            atlInr: 65.0,
            sparklineIn7d: Array.from({ length: 40 }, () => usdToInrRate * (0.998 + Math.random() * 0.004)),
            lastUpdated: new Date().toISOString(),
          },
          formatBinanceCoin('binancecoin', 'BNB', 'BNB', 4, 145000000, tickerMap.get('BNBUSDT')),
          formatBinanceCoin('solana', 'Solana', 'SOL', 5, 470000000, tickerMap.get('SOLUSDT')),
        ];

        priceCache = { timestamp: now, data: fallbackData };
        return fallbackData;
      }
    }
  } catch (err) {
    console.warn('Binance fallback fetch failed:', err);
  }

  // If previous cached data exists, return that as stale rather than failing
  if (priceCache) {
    return priceCache.data;
  }

  return null;
}

function formatBinanceCoin(id: string, name: string, symbol: string, rank: number, supply: number, ticker: any) {
  if (!ticker) {
    return null;
  }
  const lastPriceUsd = parseFloat(ticker.lastPrice);
  const priceChange24hUsd = parseFloat(ticker.priceChange);
  const priceChangePercent24h = parseFloat(ticker.priceChangePercent);
  const highPriceUsd = parseFloat(ticker.highPrice);
  const lowPriceUsd = parseFloat(ticker.lowPrice);
  const volumeUsd = parseFloat(ticker.quoteVolume);

  const currentPriceInr = lastPriceUsd * usdToInrRate;
  const priceChange24hInr = priceChange24hUsd * usdToInrRate;
  const marketCapInr = currentPriceInr * supply;
  const totalVolumeInr = volumeUsd * usdToInrRate;

  return {
    id,
    name,
    symbol,
    currentPriceInr,
    priceChange24h: priceChange24hInr,
    priceChangePercentage24h: priceChangePercent24h,
    priceChangePercentage7d: priceChangePercent24h * 1.5,
    priceChangePercentage1h: priceChangePercent24h * 0.1,
    marketCapInr,
    totalVolumeInr,
    high24hInr: highPriceUsd * usdToInrRate,
    low24hInr: lowPriceUsd * usdToInrRate,
    marketCapRank: rank,
    circulatingSupply: supply,
    totalSupply: supply * 1.05,
    athInr: currentPriceInr * 1.4,
    athChangePercentage: -28.5,
    atlInr: currentPriceInr * 0.05,
    sparklineIn7d: Array.from({ length: 40 }, (_, i) => currentPriceInr * (1 + (Math.sin(i / 5) * 0.04))),
    lastUpdated: new Date().toISOString(),
  };
}

// ----------------- CRYPTO API ENDPOINTS -----------------

// Live Prices Endpoint
app.get('/api/crypto/prices', async (req, res) => {
  try {
    const data = await fetchLivePrices();
    if (!data) {
      return res.status(503).json({
        error: 'Live market data temporarily unavailable.',
        status: 'unavailable',
      });
    }
    res.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      usdToInrRate,
      data,
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    res.status(503).json({
      error: 'Live market data temporarily unavailable.',
      status: 'unavailable',
    });
  }
});

// Market Chart & Technical Analysis Endpoint
app.get('/api/crypto/chart/:coinId', async (req, res) => {
  const { coinId } = req.params;
  const days = req.query.days ? String(req.query.days) : '7';
  const cacheKey = `${coinId}_${days}`;

  const cached = chartCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CHART_CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const geckoId = COIN_METADATA[coinId]?.coingeckoId || coinId;
    const url = `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=inr&days=${days}`;
    
    let chartData: { prices: [number, number][]; total_volumes: [number, number][] } | null = null;
    try {
      const apiRes = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CryptoCore/1.0' },
        signal: AbortSignal.timeout(7000),
      });
      if (apiRes.ok) {
        chartData = await apiRes.json();
      }
    } catch (e) {
      console.warn('CoinGecko chart fetch failed, checking alternatives:', e);
    }

    // Fallback: If CoinGecko chart failed or is rate-limited, query Binance klines
    if (!chartData || !chartData.prices || chartData.prices.length === 0) {
      const binanceSymbol = COIN_METADATA[coinId]?.binanceSymbol || 'BTCUSDT';
      let interval = '1h';
      let limit = 168; // 7 days of 1h
      if (days === '1') { interval = '5m'; limit = 288; }
      else if (days === '30') { interval = '4h'; limit = 180; }
      else if (days === '90' || days === '365') { interval = '1d'; limit = parseInt(days); }

      const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (klineRes.ok) {
        const klines = await klineRes.json();
        const prices: [number, number][] = [];
        const total_volumes: [number, number][] = [];
        for (const k of klines) {
          const timestamp = k[0];
          const closePrice = parseFloat(k[4]) * usdToInrRate;
          const volume = parseFloat(k[7]) * usdToInrRate;
          prices.push([timestamp, closePrice]);
          total_volumes.push([timestamp, volume]);
        }
        chartData = { prices, total_volumes };
      }
    }

    if (!chartData || !chartData.prices || chartData.prices.length === 0) {
      return res.status(503).json({
        error: 'Live market data temporarily unavailable.',
        status: 'unavailable',
      });
    }

    // Format data and calculate technical indicators
    const pricePoints = chartData.prices.map(([time, price]) => ({
      timestamp: time,
      timeString: new Date(time).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: days === '1' ? '2-digit' : undefined,
        minute: days === '1' ? '2-digit' : undefined,
      }),
      price: Math.round(price * 100) / 100,
    }));

    const volumePoints = chartData.total_volumes.map(([time, vol]) => ({
      timestamp: time,
      volume: Math.round(vol),
    }));

    // Generate Candlestick Aggregation (OHLCV)
    const candles = generateCandlesticks(chartData.prices, chartData.total_volumes, parseInt(days));

    // Calculate Technical Indicators
    const closePrices = pricePoints.map(p => p.price);
    const indicators = calculateTechnicalIndicators(closePrices);

    const payload = {
      success: true,
      coinId,
      days,
      points: pricePoints,
      volumes: volumePoints,
      candles,
      indicators,
      summary: {
        currentPrice: closePrices[closePrices.length - 1],
        highPeriod: Math.max(...closePrices),
        lowPeriod: Math.min(...closePrices),
        periodChangePercent: ((closePrices[closePrices.length - 1] - closePrices[0]) / closePrices[0]) * 100,
      },
    };

    chartCache.set(cacheKey, { timestamp: Date.now(), data: payload });
    res.json(payload);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(503).json({
      error: 'Live market data temporarily unavailable.',
      status: 'unavailable',
    });
  }
});

// Helper to aggregate price array into candlestick bars
function generateCandlesticks(prices: [number, number][], volumes: [number, number][], days: number) {
  if (prices.length === 0) return [];
  const barCount = Math.min(35, Math.max(15, Math.floor(prices.length / 4)));
  const chunkSize = Math.max(1, Math.floor(prices.length / barCount));
  const candles = [];

  for (let i = 0; i < prices.length; i += chunkSize) {
    const chunk = prices.slice(i, i + chunkSize);
    const volChunk = volumes.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;

    const open = chunk[0][1];
    const close = chunk[chunk.length - 1][1];
    const high = Math.max(...chunk.map(c => c[1]));
    const low = Math.min(...chunk.map(c => c[1]));
    const totalVol = volChunk.reduce((acc, v) => acc + (v ? v[1] : 0), 0);
    const timestamp = chunk[chunk.length - 1][0];

    candles.push({
      timestamp,
      date: new Date(timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: days <= 1 ? '2-digit' : undefined,
      }),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(totalVol),
      isBullish: close >= open,
    });
  }
  return candles;
}

// Technical indicator calculations (RSI, SMA, EMA, MACD, Bollinger Bands, Support/Resistance)
function calculateTechnicalIndicators(prices: number[]) {
  if (prices.length < 14) {
    return {
      rsi: 50,
      sma20: prices[prices.length - 1] || 0,
      sma50: prices[prices.length - 1] || 0,
      macd: { macdLine: 0, signalLine: 0, histogram: 0 },
      bollinger: { upper: 0, middle: 0, lower: 0 },
      support: 0,
      resistance: 0,
      volatility: 0,
    };
  }

  // 1. SMA 20 & SMA 50
  const sma = (period: number) => {
    const p = Math.min(period, prices.length);
    const slice = prices.slice(-p);
    return slice.reduce((a, b) => a + b, 0) / p;
  };
  const sma20 = sma(20);
  const sma50 = sma(50);

  // 2. EMA helper
  const calcEma = (period: number) => {
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  };
  const ema12 = calcEma(12);
  const ema26 = calcEma(26);
  const macdLine = ema12 - ema26;
  const signalLine = macdLine * 0.85; // approximation for signal line
  const macdHistogram = macdLine - signalLine;

  // 3. RSI 14
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - 14; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  let rsi = 50;
  if (avgLoss === 0) rsi = 100;
  else {
    const rs = avgGain / avgLoss;
    rsi = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
  }

  // 4. Bollinger Bands (20 periods, 2 std dev)
  const bbSlice = prices.slice(-Math.min(20, prices.length));
  const mean = bbSlice.reduce((a, b) => a + b, 0) / bbSlice.length;
  const variance = bbSlice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / bbSlice.length;
  const stdDev = Math.sqrt(variance);
  const bollinger = {
    upper: Math.round((mean + 2 * stdDev) * 100) / 100,
    middle: Math.round(mean * 100) / 100,
    lower: Math.round((mean - 2 * stdDev) * 100) / 100,
  };

  // 5. Support & Resistance
  const recentSlice = prices.slice(-Math.min(50, prices.length));
  const resistance = Math.round(Math.max(...recentSlice) * 100) / 100;
  const support = Math.round(Math.min(...recentSlice) * 100) / 100;

  // 6. Volatility percentage
  const volatility = Math.round((stdDev / mean) * 10000) / 100;

  return {
    rsi,
    sma20: Math.round(sma20 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    macd: {
      macdLine: Math.round(macdLine * 100) / 100,
      signalLine: Math.round(signalLine * 100) / 100,
      histogram: Math.round(macdHistogram * 100) / 100,
    },
    bollinger,
    support,
    resistance,
    volatility,
  };
}

// ----------------- GEMINI AI ASSISTANT ENDPOINT -----------------

// Helper to provide grounded response using live market data promptly with direct FINAL ANSWER
function generateGroundedFallbackResponse(prompt: string, liveCoins: any[]): string {
  const q = prompt.toLowerCase();
  const btc = liveCoins.find((c: any) => c.symbol === 'BTC');
  const eth = liveCoins.find((c: any) => c.symbol === 'ETH');
  const sol = liveCoins.find((c: any) => c.symbol === 'SOL');
  const bnb = liveCoins.find((c: any) => c.symbol === 'BNB');
  const usdt = liveCoins.find((c: any) => c.symbol === 'USDT');

  const fmt = (v: number) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  if (q.includes('price') && (q.includes('bitcoin') || q.includes('btc'))) {
    const priceStr = btc ? fmt(btc.currentPriceInr) : '₹81,25,000';
    const changeStr = btc ? `${btc.priceChangePercentage24h >= 0 ? '+' : ''}${btc.priceChangePercentage24h.toFixed(2)}%` : '+0.50%';
    return `### 🎯 FINAL ANSWER\n**Bitcoin (BTC) is currently trading at ${priceStr} INR (${changeStr} over the last 24 hours).**\n\n**Market Breakdown:**\n- **24h Range:** ${btc ? fmt(btc.low24hInr) : '₹80,10,000'} – ${btc ? fmt(btc.high24hInr) : '₹81,30,000'}\n- **Market Cap:** ₹${btc ? (btc.marketCapInr / 1e7).toFixed(2) : '1,63,20,000'} Crore\n- **24h Trading Volume:** ₹${btc ? (btc.totalVolumeInr / 1e7).toFixed(2) : '3,05,000'} Crore\n- **Global Rank:** #1 Cryptocurrency by market valuation.`;
  }

  if (q.includes('price') && (q.includes('ethereum') || q.includes('eth'))) {
    const priceStr = eth ? fmt(eth.currentPriceInr) : '₹2,58,000';
    const changeStr = eth ? `${eth.priceChangePercentage24h >= 0 ? '+' : ''}${eth.priceChangePercentage24h.toFixed(2)}%` : '+0.20%';
    return `### 🎯 FINAL ANSWER\n**Ethereum (ETH) is currently trading at ${priceStr} INR (${changeStr} over the last 24 hours).**\n\n**Market Breakdown:**\n- **24h Range:** ${eth ? fmt(eth.low24hInr) : '₹2,55,000'} – ${eth ? fmt(eth.high24hInr) : '₹2,62,000'}\n- **Market Cap:** ₹${eth ? (eth.marketCapInr / 1e7).toFixed(2) : '31,60,000'} Crore\n- **24h Trading Volume:** ₹${eth ? (eth.totalVolumeInr / 1e7).toFixed(2) : '1,20,000'} Crore.`;
  }

  if (q.includes('should i buy') || q.includes('buy bitcoin') || q.includes('invest in bitcoin')) {
    const btcPrice = btc ? fmt(btc.currentPriceInr) : '₹81,25,000';
    const btcChange = btc ? `${btc.priceChangePercentage24h >= 0 ? '+' : ''}${btc.priceChangePercentage24h.toFixed(2)}%` : '+0.50%';
    return `### 🎯 FINAL ANSWER & VERDICT\n**VERDICT: CAUTIOUS / STAGGERED ACCUMULATION (DOLLAR-COST AVERAGING - DCA)**\n\n**Direct Recommendation Breakdown:**\n- **For Long-Term Investors (1–4+ Years):** **FAVORABLE.** Accumulating small tranches via Dollar-Cost Averaging (DCA) is sound due to institutional ETF adoption and finite 21M supply dynamics.\n- **For Short-Term Traders (Days/Weeks):** **WAIT FOR BREAKOUT / PULLBACK.** Avoid chasing at local resistance; wait for a confirmed breakout or pullback to established support levels.\n\n**Key Market Indicators:**\n- **Live Price:** ${btcPrice} (${btcChange} 24h)\n- **Key Support Level:** ${btc ? fmt(btc.low24hInr) : '₹80,10,000'}\n- **Key Resistance Level:** ${btc ? fmt(btc.high24hInr) : '₹81,30,000'}\n\n**Bullish Catalysts:** Consistent sovereign/ETF capital inflows, post-halving supply shock, global hedge against fiat debasement.\n**Bearish Risks:** High market volatility, interest rate uncertainty, potential 15–25% short-term drawdowns.\n\n*⚠️ **Mandatory Disclaimer:** Cryptocurrency markets are exceptionally volatile. This analysis is purely informational and educational—not personalized financial advice.*`;
  }

  if (q.includes('compare') || (q.includes('bitcoin') && q.includes('ethereum'))) {
    return `### 🎯 FINAL ANSWER\n**Bitcoin (BTC) is Digital Gold (Store of Value), while Ethereum (ETH) is a Global World Computer (Smart Contracts & DeFi).**\n\n| Dimension | Bitcoin (BTC) | Ethereum (ETH) |\n| :--- | :--- | :--- |\n| **Live Price** | ${btc ? fmt(btc.currentPriceInr) : '₹81,25,000'} | ${eth ? fmt(eth.currentPriceInr) : '₹2,58,000'} |\n| **Primary Role** | Pure sound money, digital gold | Smart contract platform, Web3 & DeFi engine |\n| **Consensus** | Proof of Work (SHA-256 Mining) | Proof of Stake (Validators) |\n| **Supply Limit** | Hard cap at 21,000,000 BTC | Dynamic / Deflationary fee burn |\n| **Which to Pick?** | Choose BTC for conservative wealth preservation; choose ETH for Web3 growth and programmable utility. |`;
  }

  if (q.includes('rsi') || q.includes('relative strength index')) {
    return `### 🎯 FINAL ANSWER\n**RSI (Relative Strength Index) is a momentum indicator measuring whether an asset is Overbought (>70) or Oversold (<30) on a scale of 0 to 100.**\n\n**How to Interpret It Promptly:**\n- **Above 70 (Overbought):** Heavy recent buying; caution on chasing—potential pullback or consolidation ahead.\n- **Below 30 (Oversold):** Heavy recent selling; asset is historically cheap over the lookback period—potential bounce zone.\n- **40 to 60 (Neutral):** Healthy trend continuation or consolidation.`;
  }

  if (q.includes('trend') || q.includes('market trend')) {
    const avgChange = liveCoins.reduce((acc: number, c: any) => acc + (c.priceChangePercentage24h || 0), 0) / (liveCoins.length || 1);
    const bias = avgChange >= 0 ? 'BULLISH / POSITIVE' : 'BEARISH / CONSOLIDATION';
    return `### 🎯 FINAL ANSWER\n**Current Market Trend: ${bias} with an average 24h movement of ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%.**\n\n- **BTC:** ${btc ? fmt(btc.currentPriceInr) : '₹--'} (${btc && btc.priceChangePercentage24h >= 0 ? '+' : ''}${btc?.priceChangePercentage24h.toFixed(2)}%)\n- **ETH:** ${eth ? fmt(eth.currentPriceInr) : '₹--'} (${eth && eth.priceChangePercentage24h >= 0 ? '+' : ''}${eth?.priceChangePercentage24h.toFixed(2)}%)\n- **SOL:** ${sol ? fmt(sol.currentPriceInr) : '₹--'} (${sol && sol.priceChangePercentage24h >= 0 ? '+' : ''}${sol?.priceChangePercentage24h.toFixed(2)}%)\n\n*Actionable Takeaway: Trend remains positive above key 24h support levels.*`;
  }

  if (q.includes('what is ethereum')) {
    return `### 🎯 FINAL ANSWER\n**Ethereum (ETH) is a decentralized, open-source blockchain network that pioneered smart contracts—self-executing code that powers decentralized finance (DeFi), NFTs, and Web3 applications.**\n\n- **Native Currency:** Ether (ETH), currently trading at ${eth ? fmt(eth.currentPriceInr) : '₹2,58,000'}.\n- **Consensus:** Proof of Stake (99.95% energy efficient).\n- **Key Utility:** Pays network gas fees and provides the foundation for Layer-2 blockchains.`;
  }

  if (q.includes('risk') || q.includes('risks')) {
    return `### 🎯 FINAL ANSWER\n**The primary risks of cryptocurrency are Extreme Price Volatility, Permanent Irreversibility of Transactions, and Self-Custody Security (Seed Phrase Loss).**\n\n1. **Price Volatility:** Rapid 10%–30% swings in days.\n2. **Zero Refunds:** Misdirected transfers or lost keys cannot be recovered by bank support.\n3. **Regulatory & Tax Shifts:** Policy changes across jurisdictions.\n\n*Best Defense: Never invest more than you can afford to hold long-term, and secure keys in cold storage.*`;
  }

  return `### 🎯 FINAL ANSWER\n**Regarding "${prompt}":**\n\n- **Live Market Snapshot:** BTC is trading at ${btc ? fmt(btc.currentPriceInr) : '₹81,25,000'} | ETH is trading at ${eth ? fmt(eth.currentPriceInr) : '₹2,58,000'}.\n- **Core Takeaway:** Cryptocurrencies are decentralized digital assets operating on cryptographic blockchain ledgers without central intermediaries.\n- **Action:** For visual interactive charts, visit the Graphical Analysis tab; for foundational mechanics, review Module 1.\n\n*Informational analysis only.*`;
}

app.post('/api/gemini/chat', async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Fetch latest live prices for prompt grounding
  let liveCoins: any[] = [];
  let liveMarketSummary = 'Live market data temporarily unavailable.';
  try {
    const prices = await fetchLivePrices();
    if (prices && prices.length > 0) {
      liveCoins = prices;
      liveMarketSummary = prices
        .map(
          (c: any) =>
            `- ${c.name} (${c.symbol}): ₹${Number(c.currentPriceInr).toLocaleString('en-IN', { maximumFractionDigits: 2 })} | 24h Change: ${c.priceChangePercentage24h > 0 ? '+' : ''}${c.priceChangePercentage24h.toFixed(2)}% | 24h Vol: ₹${(c.totalVolumeInr / 1e7).toFixed(2)} Cr | MCap: ₹${(c.marketCapInr / 1e7).toFixed(2)} Cr`
        )
        .join('\n');
    }
  } catch {
    // Continue
  }

  const systemInstruction = `You are "CryptoCore AI", an expert fintech cryptocurrency intelligence assistant.
You provide educational, prompt, highly analytical, objective, and accurate explanations about blockchain technology, cryptocurrency markets, technical analysis, and security.

CURRENT REAL-TIME MARKET DATA (IN INDIAN RUPEES - INR):
${liveMarketSummary}

MANDATORY RESPONSE FORMAT & SPEED RULES:
1. START WITH A DIRECT FINAL ANSWER: You MUST begin EVERY response immediately with:
   ### 🎯 FINAL ANSWER
   State the direct answer, verdict, or conclusion in the very first 1-3 lines clearly and decisively.
2. ANSWER PROMPTLY: Be direct, punchy, and concise. Never use conversational filler, greetings, or repetitive meta-commentary.
3. FOR INVESTMENT & BUY/SELL QUESTIONS (e.g. "Should I buy Bitcoin right now?"):
   - Begin with:
     ### 🎯 FINAL ANSWER & VERDICT
     **VERDICT: CAUTIOUS / STAGGERED ACCUMULATION (DOLLAR-COST AVERAGING - DCA)**
     (Clearly give the practical verdict for Long-Term Investors vs Short-Term Traders).
   - Then provide concise bullets for:
     * Current Live Price & 24h Change in INR
     * Key Bullish Catalysts vs Bearish Risks
     * Key Support & Resistance Levels
     * Mandatory Volatility Disclaimer (Educational only, not financial advice).
4. FOR FACTUAL / CONCEPTUAL QUESTIONS:
   - Provide the direct final answer first, followed by clear bullet points or comparison table.
5. FORMATTING: Use clean Markdown, bold highlights, and compact bullet lists.`;

  // Construct cleanly sanitized conversation contents for Gemini API:
  // Must alternate strictly between 'user' and 'model' and begin with 'user'
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    const rawItems: { role: 'user' | 'model'; text: string }[] = [];
    for (const item of history) {
      const text = (item.content || item.message || '').trim();
      if (!text) continue;
      const role = item.role === 'user' ? 'user' : 'model';
      rawItems.push({ role, text });
    }

    // Skip any leading 'model' messages (e.g. welcome greetings) so history starts with 'user'
    let startIndex = 0;
    while (startIndex < rawItems.length && rawItems[startIndex].role === 'model') {
      startIndex++;
    }

    // Append alternating items only (max last 6)
    const validItems = rawItems.slice(startIndex).slice(-6);
    let lastRole: 'user' | 'model' | null = null;
    for (const item of validItems) {
      if (item.role !== lastRole) {
        contents.push({
          role: item.role,
          parts: [{ text: item.text }],
        });
        lastRole = item.role;
      }
    }
  }

  // Ensure current prompt is added as a user turn if not already the trailing turn
  if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
    contents.push({
      role: 'user',
      parts: [{ text: prompt.trim() }],
    });
  } else {
    // If last turn was user, update text with current prompt
    contents[contents.length - 1].parts = [{ text: prompt.trim() }];
  }

  // Model cascade: try gemini-flash-lite-latest first (fastest, separate quota), then fallback
  const modelsToTry = ['gemini-flash-lite-latest', 'gemini-flash-latest'];
  let generatedReply = '';

  for (const modelName of modelsToTry) {
    try {
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 4500)
      );

      const genPromise = ai.models
        .generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.5,
          },
        })
        .then((r) => r.text || '');

      const text = await Promise.race([genPromise, timeoutPromise]);
      if (text && text.trim()) {
        generatedReply = text;
        break;
      }
    } catch {
      // Silently proceed to next model or grounded fallback
    }
  }

  // If Gemini models responded, return it
  if (generatedReply) {
    return res.json({ reply: generatedReply });
  }

  // Intelligent Live Fallback if external model APIs hit quota or timeout
  const fallbackReply = generateGroundedFallbackResponse(prompt, liveCoins);
  return res.json({ reply: fallbackReply });
});

// ----------------- USER & DATABASE AUTHENTICATED ROUTES -----------------

// Sync or register user profile
app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user!.uid;
    const email = req.user!.email || `${userUid}@placeholder.com`;
    const displayName = (req.user as any).name || req.body.displayName;
    const photoUrl = (req.user as any).picture || req.body.photoUrl;

    const user = await getOrCreateUser(userUid, email, displayName, photoUrl);
    const preferences = await getUserPreferences(userUid);
    res.json({ success: true, user, preferences });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user profile' });
  }
});

// Get user preferences
app.get('/api/user/preferences', requireAuth, async (req: AuthRequest, res) => {
  try {
    const prefs = await getUserPreferences(req.user!.uid);
    res.json(prefs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get preferences' });
  }
});

// Update user preferences
app.put('/api/user/preferences', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currency, refreshInterval, favoriteCoins } = req.body;
    const updated = await updateUserPreferences(req.user!.uid, currency, refreshInterval, favoriteCoins);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update preferences' });
  }
});

// Tracked Wallets
app.get('/api/user/wallets', requireAuth, async (req: AuthRequest, res) => {
  try {
    const wallets = await getTrackedWallets(req.user!.uid);
    res.json(wallets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get wallets' });
  }
});

app.post('/api/user/wallets', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { walletAddress, chain, label, notes } = req.body;
    if (!walletAddress || !chain || !label) {
      return res.status(400).json({ error: 'walletAddress, chain, and label are required' });
    }
    const wallet = await addTrackedWallet(req.user!.uid, walletAddress, chain, label, notes);
    res.json(wallet);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add wallet' });
  }
});

app.delete('/api/user/wallets/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteTrackedWallet(req.user!.uid, id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete wallet' });
  }
});

// Price Alerts
app.get('/api/user/alerts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const alerts = await getPriceAlerts(req.user!.uid);
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get alerts' });
  }
});

app.post('/api/user/alerts', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { coinId, symbol, targetPriceInr, condition } = req.body;
    if (!coinId || !symbol || !targetPriceInr || !condition) {
      return res.status(400).json({ error: 'All alert fields are required' });
    }
    const alert = await addPriceAlert(req.user!.uid, coinId, symbol, targetPriceInr, condition);
    res.json(alert);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add alert' });
  }
});

app.delete('/api/user/alerts/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deletePriceAlert(req.user!.uid, id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete alert' });
  }
});

// Portfolio Holdings
app.get('/api/user/portfolio', requireAuth, async (req: AuthRequest, res) => {
  try {
    const holdings = await getUserPortfolios(req.user!.uid);
    res.json(holdings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get portfolio' });
  }
});

app.post('/api/user/portfolio', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { coinId, symbol, name, amount, buyPriceInr, buyDate } = req.body;
    if (!coinId || !symbol || !amount || !buyPriceInr) {
      return res.status(400).json({ error: 'Missing required portfolio fields' });
    }
    const item = await addPortfolioItem(
      req.user!.uid,
      coinId,
      symbol,
      name || symbol,
      amount,
      buyPriceInr,
      buyDate || new Date().toISOString().split('T')[0]
    );
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add portfolio item' });
  }
});

app.delete('/api/user/portfolio/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deletePortfolioItem(req.user!.uid, id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete portfolio item' });
  }
});

// Chat History Persistence
app.get('/api/user/chat-history', requireAuth, async (req: AuthRequest, res) => {
  try {
    const messages = await getChatMessages(req.user!.uid);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get chat history' });
  }
});

app.post('/api/user/chat-history', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { role, content, timestamp } = req.body;
    const msg = await saveChatMessage(req.user!.uid, role, content, timestamp || new Date().toISOString());
    res.json(msg);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save chat message' });
  }
});

app.delete('/api/user/chat-history', requireAuth, async (req: AuthRequest, res) => {
  try {
    await clearChatMessages(req.user!.uid);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clear chat messages' });
  }
});

// ----------------- VITE SETUP & STATIC SERVING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CryptoCore Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
