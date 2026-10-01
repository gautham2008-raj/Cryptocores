export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  currentPriceInr: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceChangePercentage7d?: number;
  priceChangePercentage1h?: number;
  marketCapInr: number;
  totalVolumeInr: number;
  high24hInr?: number;
  low24hInr?: number;
  marketCapRank?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  athInr?: number;
  athChangePercentage?: number;
  atlInr?: number;
  sparklineIn7d?: number[];
  lastUpdated?: string;
}

export interface ChartPoint {
  timestamp: number;
  timeString: string;
  price: number;
}

export interface VolumePoint {
  timestamp: number;
  volume: number;
}

export interface Candlestick {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isBullish: boolean;
}

export interface TechnicalIndicators {
  rsi: number;
  sma20: number;
  sma50: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
  volatility: number;
}

export interface ChartDataResponse {
  success: boolean;
  coinId: string;
  days: string;
  points: ChartPoint[];
  volumes: VolumePoint[];
  candles: Candlestick[];
  indicators: TechnicalIndicators;
  summary: {
    currentPrice: number;
    highPeriod: number;
    lowPeriod: number;
    periodChangePercent: number;
  };
}

export interface TrackedWallet {
  id: number;
  userUid: string;
  walletAddress: string;
  chain: string;
  label: string;
  notes?: string;
  createdAt: string;
}

export interface PriceAlert {
  id: number;
  userUid: string;
  coinId: string;
  symbol: string;
  targetPriceInr: string;
  condition: 'GREATER_THAN' | 'LESS_THAN';
  isActive: boolean;
  createdAt: string;
}

export interface PortfolioHolding {
  id: number;
  userUid: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: string;
  buyPriceInr: string;
  buyDate: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'intro'
  | 'history'
  | 'analysis'
  | 'graphs'
  | 'live-charts'
  | 'prices'
  | 'assistant';
