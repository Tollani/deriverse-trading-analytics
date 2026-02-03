// Core types for Deriverse Trading Analytics Dashboard

export type MarketType = 'spot' | 'perpetual' | 'options';
export type TradeSide = 'long' | 'short';
export type OrderType = 'market' | 'limit' | 'stop-loss' | 'take-profit';

export interface Trade {
  id: string;
  symbol: string;
  marketType: MarketType;
  side: TradeSide;
  orderType: OrderType;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage?: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  entryTime: Date;
  exitTime: Date;
  duration: number; // in minutes
  notes?: string;
  txSignature?: string; // Solana transaction signature
}

export interface PortfolioMetrics {
  totalPnl: number;
  totalPnlPercent: number;
  realizedPnl: number;
  unrealizedPnl: number;
  roi: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  scratchTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  sharpeRatio: number;
  maxDrawdown: number;
  expectancy: number;
  profitFactor: number;
  longRatio: number;
  shortRatio: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  longestWinStreak: number;
  longestLossStreak: number;
  totalFees: number;
  totalVolume: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
  drawdown: number;
  drawdownPercent: number;
}

export interface VolumeData {
  date: string;
  spot: number;
  perpetual: number;
  options: number;
  total: number;
}

export interface FeeBreakdown {
  type: string;
  amount: number;
  percentage: number;
}

export interface TimePerformance {
  label: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export interface DailyPerformance {
  daily: TimePerformance[];
  hourly: TimePerformance[];
}

export interface Position {
  symbol: string;
  marketType: MarketType;
  side: TradeSide;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage?: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  margin?: number;
}

// Empty state defaults
export const emptyMetrics: PortfolioMetrics = {
  totalPnl: 0,
  totalPnlPercent: 0,
  realizedPnl: 0,
  unrealizedPnl: 0,
  roi: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  scratchTrades: 0,
  winRate: 0,
  averageWin: 0,
  averageLoss: 0,
  largestWin: 0,
  largestLoss: 0,
  avgTradeDuration: 0,
  sharpeRatio: 0,
  maxDrawdown: 0,
  expectancy: 0,
  profitFactor: 0,
  longRatio: 50,
  shortRatio: 50,
  currentStreak: 0,
  currentStreakType: 'none',
  longestWinStreak: 0,
  longestLossStreak: 0,
  totalFees: 0,
  totalVolume: 0,
};
