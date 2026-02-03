// Mock trading data for Deriverse Dashboard

export interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  marketType: 'spot' | 'perpetual' | 'options';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  fees: {
    maker: number;
    taker: number;
    funding?: number;
    premium?: number;
  };
  entryTime: Date;
  exitTime: Date;
  orderType: 'market' | 'limit' | 'stop-loss';
  leverage?: number;
  notes?: string;
  txHash: string;
}

export interface PortfolioMetrics {
  totalPnl: number;
  totalPnlPercent: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalVolume: number;
  totalFees: number;
  winRate: number;
  lossRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  scratchTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgTradeDuration: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  longRatio: number;
  shortRatio: number;
  roi: number;
  expectancy: number;
}

export interface EquityPoint {
  date: Date;
  equity: number;
  pnl: number;
  drawdown: number;
  benchmark?: number;
}

export interface VolumeData {
  date: string;
  spot: number;
  perpetual: number;
  options: number;
}

export interface FeeBreakdown {
  type: string;
  amount: number;
  percentage: number;
}

export interface TimePerformance {
  period: string;
  pnl: number;
  winRate: number;
  trades: number;
}

// Generate random trades
const symbols = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'RAY/USDC', 'BONK/USDC', 'JTO/USDC', 'PYTH/USDC', 'ORCA/USDC'];
const marketTypes: Trade['marketType'][] = ['spot', 'perpetual', 'options'];
const orderTypes: Trade['orderType'][] = ['market', 'limit', 'stop-loss'];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateTrade(index: number, baseDate: Date): Trade {
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const side: Trade['side'] = Math.random() > 0.45 ? 'long' : 'short';
  const marketType = marketTypes[Math.floor(Math.random() * marketTypes.length)];
  const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
  
  const entryPrice = symbol.includes('SOL') ? randomBetween(80, 150) :
                     symbol.includes('BTC') ? randomBetween(40000, 70000) :
                     symbol.includes('ETH') ? randomBetween(2000, 4000) :
                     randomBetween(0.1, 50);
  
  const priceChange = randomBetween(-0.15, 0.2);
  const exitPrice = entryPrice * (1 + (side === 'long' ? priceChange : -priceChange));
  
  const quantity = randomBetween(1, 100);
  const pnl = (exitPrice - entryPrice) * quantity * (side === 'long' ? 1 : -1);
  const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100 * (side === 'long' ? 1 : -1);
  
  const entryTime = new Date(baseDate);
  entryTime.setHours(entryTime.getHours() - Math.floor(randomBetween(1, 72)));
  
  const exitTime = new Date(entryTime);
  exitTime.setMinutes(exitTime.getMinutes() + Math.floor(randomBetween(5, 480)));
  
  const leverage = marketType === 'perpetual' ? Math.floor(randomBetween(1, 20)) : undefined;
  
  return {
    id: `trade-${index}-${Date.now()}`,
    symbol,
    side,
    marketType,
    entryPrice,
    exitPrice,
    quantity,
    pnl,
    pnlPercent,
    fees: {
      maker: Math.abs(pnl) * 0.001,
      taker: Math.abs(pnl) * 0.002,
      funding: marketType === 'perpetual' ? Math.abs(pnl) * 0.0005 : undefined,
      premium: marketType === 'options' ? Math.abs(pnl) * 0.01 : undefined,
    },
    entryTime,
    exitTime,
    orderType,
    leverage,
    notes: Math.random() > 0.7 ? 'Followed trading plan, good entry' : undefined,
    txHash: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
  };
}

export function generateTrades(count: number = 150): Trade[] {
  const trades: Trade[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < count; i++) {
    const tradeDate = new Date(baseDate);
    tradeDate.setDate(tradeDate.getDate() - Math.floor(i / 3));
    trades.push(generateTrade(i, tradeDate));
  }
  
  return trades.sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());
}

export function calculateMetrics(trades: Trade[]): PortfolioMetrics {
  if (trades.length === 0) {
    return {
      totalPnl: 0, totalPnlPercent: 0, realizedPnl: 0, unrealizedPnl: 0,
      totalVolume: 0, totalFees: 0, winRate: 0, lossRate: 0,
      totalTrades: 0, winningTrades: 0, losingTrades: 0, scratchTrades: 0,
      averageWin: 0, averageLoss: 0, largestWin: 0, largestLoss: 0,
      sharpeRatio: 0, maxDrawdown: 0, avgTradeDuration: 0,
      longestWinStreak: 0, longestLossStreak: 0,
      currentStreak: 0, currentStreakType: 'none',
      longRatio: 50, shortRatio: 50, roi: 0, expectancy: 0,
    };
  }

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const scratchTrades = trades.filter(t => Math.abs(t.pnl) < 0.01);
  
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalVolume = trades.reduce((sum, t) => sum + (t.entryPrice * t.quantity), 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees.maker + t.fees.taker + (t.fees.funding || 0) + (t.fees.premium || 0), 0);
  
  const averageWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
  
  const largestWin = Math.max(...trades.map(t => t.pnl), 0);
  const largestLoss = Math.min(...trades.map(t => t.pnl), 0);
  
  const longTrades = trades.filter(t => t.side === 'long').length;
  const shortTrades = trades.filter(t => t.side === 'short').length;
  
  // Calculate streaks
  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;
  
  for (const trade of trades) {
    if (trade.pnl > 0) {
      tempWinStreak++;
      tempLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    } else if (trade.pnl < 0) {
      tempLossStreak++;
      tempWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
    }
  }
  
  if (trades[0]?.pnl > 0) {
    currentStreakType = 'win';
    currentStreak = tempWinStreak;
  } else if (trades[0]?.pnl < 0) {
    currentStreakType = 'loss';
    currentStreak = tempLossStreak;
  }

  // Calculate max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnl = 0;
  
  for (const trade of [...trades].reverse()) {
    runningPnl += trade.pnl;
    peak = Math.max(peak, runningPnl);
    const drawdown = peak > 0 ? ((peak - runningPnl) / peak) * 100 : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  // Calculate average trade duration in minutes
  const avgTradeDuration = trades.reduce((sum, t) => {
    return sum + (t.exitTime.getTime() - t.entryTime.getTime()) / (1000 * 60);
  }, 0) / trades.length;
  
  // Calculate Sharpe Ratio (simplified - using daily returns)
  const dailyReturns = trades.map(t => t.pnlPercent);
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const stdDev = Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  
  const winRate = (winningTrades.length / trades.length) * 100;
  const expectancy = (winRate / 100 * averageWin) - ((100 - winRate) / 100 * averageLoss);

  return {
    totalPnl,
    totalPnlPercent: (totalPnl / totalVolume) * 100,
    realizedPnl: totalPnl,
    unrealizedPnl: randomBetween(-1000, 3000),
    totalVolume,
    totalFees,
    winRate,
    lossRate: (losingTrades.length / trades.length) * 100,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    scratchTrades: scratchTrades.length,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    sharpeRatio,
    maxDrawdown,
    avgTradeDuration,
    longestWinStreak,
    longestLossStreak,
    currentStreak,
    currentStreakType,
    longRatio: (longTrades / trades.length) * 100,
    shortRatio: (shortTrades / trades.length) * 100,
    roi: (totalPnl / 10000) * 100, // Assuming 10k starting capital
    expectancy,
  };
}

export function generateEquityCurve(trades: Trade[]): EquityPoint[] {
  const sortedTrades = [...trades].sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  const points: EquityPoint[] = [];
  
  let equity = 10000; // Starting capital
  let peak = equity;
  let benchmarkStart = 100; // SOL price start
  
  for (let i = 0; i < sortedTrades.length; i++) {
    const trade = sortedTrades[i];
    equity += trade.pnl;
    peak = Math.max(peak, equity);
    const drawdown = ((peak - equity) / peak) * 100;
    
    // Simulate benchmark (SOL price movement)
    benchmarkStart *= (1 + randomBetween(-0.02, 0.03));
    
    points.push({
      date: trade.exitTime,
      equity,
      pnl: trade.pnl,
      drawdown,
      benchmark: benchmarkStart,
    });
  }
  
  return points;
}

export function generateVolumeData(trades: Trade[]): VolumeData[] {
  const volumeByDate: Record<string, VolumeData> = {};
  
  trades.forEach(trade => {
    const dateKey = trade.exitTime.toISOString().split('T')[0];
    if (!volumeByDate[dateKey]) {
      volumeByDate[dateKey] = { date: dateKey, spot: 0, perpetual: 0, options: 0 };
    }
    
    const volume = trade.entryPrice * trade.quantity;
    volumeByDate[dateKey][trade.marketType] += volume;
  });
  
  return Object.values(volumeByDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
}

export function generateFeeBreakdown(trades: Trade[]): FeeBreakdown[] {
  const totalMaker = trades.reduce((sum, t) => sum + t.fees.maker, 0);
  const totalTaker = trades.reduce((sum, t) => sum + t.fees.taker, 0);
  const totalFunding = trades.reduce((sum, t) => sum + (t.fees.funding || 0), 0);
  const totalPremium = trades.reduce((sum, t) => sum + (t.fees.premium || 0), 0);
  const total = totalMaker + totalTaker + totalFunding + totalPremium;
  
  return [
    { type: 'Maker Fees', amount: totalMaker, percentage: (totalMaker / total) * 100 },
    { type: 'Taker Fees', amount: totalTaker, percentage: (totalTaker / total) * 100 },
    { type: 'Funding Fees', amount: totalFunding, percentage: (totalFunding / total) * 100 },
    { type: 'Option Premiums', amount: totalPremium, percentage: (totalPremium / total) * 100 },
  ].filter(f => f.amount > 0);
}

export function generateTimePerformance(trades: Trade[]): { daily: TimePerformance[]; hourly: TimePerformance[] } {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const dailyData: Record<string, { pnl: number; wins: number; trades: number }> = {};
  const hourlyData: Record<number, { pnl: number; wins: number; trades: number }> = {};
  
  days.forEach(day => {
    dailyData[day] = { pnl: 0, wins: 0, trades: 0 };
  });
  
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { pnl: 0, wins: 0, trades: 0 };
  }
  
  trades.forEach(trade => {
    const day = days[trade.exitTime.getDay()];
    const hour = trade.exitTime.getHours();
    
    dailyData[day].pnl += trade.pnl;
    dailyData[day].trades++;
    if (trade.pnl > 0) dailyData[day].wins++;
    
    hourlyData[hour].pnl += trade.pnl;
    hourlyData[hour].trades++;
    if (trade.pnl > 0) hourlyData[hour].wins++;
  });
  
  const daily = days.map(day => ({
    period: day,
    pnl: dailyData[day].pnl,
    winRate: dailyData[day].trades > 0 ? (dailyData[day].wins / dailyData[day].trades) * 100 : 0,
    trades: dailyData[day].trades,
  }));
  
  const hourly = Object.entries(hourlyData).map(([hour, data]) => ({
    period: `${hour.toString().padStart(2, '0')}:00`,
    pnl: data.pnl,
    winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    trades: data.trades,
  }));
  
  return { daily, hourly };
}
