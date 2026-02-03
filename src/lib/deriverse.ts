// Deriverse Protocol Integration
// Program ID: Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu

import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { 
  Trade, 
  MarketType, 
  TradeSide, 
  OrderType, 
  EquityPoint, 
  VolumeData, 
  FeeBreakdown,
  PortfolioMetrics,
  DailyPerformance,
  TimePerformance,
  emptyMetrics
} from './types';

// Deriverse Program ID on Solana Mainnet
export const DERIVERSE_PROGRAM_ID = new PublicKey('Drvrseg8AQLP8B96DBGmHRjFGviFNYTkHueY9g3k27Gu');

// Known Deriverse instruction discriminators (first 8 bytes of instruction data)
// These would need to be verified against actual program
const INSTRUCTION_DISCRIMINATORS = {
  openPosition: 'open_position',
  closePosition: 'close_position',
  placeOrder: 'place_order',
  cancelOrder: 'cancel_order',
  swap: 'swap',
};

// Fee types for breakdown
const FEE_TYPES = ['Trading Fees', 'Network Fees', 'Funding Fees', 'Liquidation Fees'];

interface DeriverseTransaction {
  signature: string;
  timestamp: number;
  type: string;
  symbol: string;
  side: TradeSide;
  marketType: MarketType;
  orderType: OrderType;
  price: number;
  quantity: number;
  fee: number;
  pnl?: number;
  isEntry: boolean;
}

/**
 * Parse Deriverse transaction logs to extract trade data
 */
function parseDeriverseLog(log: string): Partial<DeriverseTransaction> | null {
  try {
    // Look for program-specific log patterns
    // Deriverse likely emits logs like: "Program log: TradeExecuted: {...}"
    
    if (log.includes('TradeExecuted') || log.includes('PositionOpened') || log.includes('PositionClosed')) {
      // Extract JSON data if present
      const jsonMatch = log.match(/\{.*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          symbol: data.symbol || data.market,
          side: data.isLong || data.side === 'long' ? 'long' : 'short',
          price: parseFloat(data.price) || 0,
          quantity: parseFloat(data.amount || data.size || data.quantity) || 0,
          fee: parseFloat(data.fee) || 0,
          pnl: data.pnl ? parseFloat(data.pnl) : undefined,
          isEntry: log.includes('PositionOpened') || log.includes('Open'),
        };
      }
    }

    // Alternative log format: key-value pairs
    if (log.includes('symbol:') || log.includes('price:')) {
      const pairs: Record<string, string> = {};
      log.split(',').forEach(part => {
        const [key, value] = part.split(':').map(s => s.trim());
        if (key && value) pairs[key.toLowerCase()] = value;
      });
      
      if (pairs.symbol || pairs.market) {
        return {
          symbol: pairs.symbol || pairs.market,
          side: pairs.side === 'long' || pairs.islong === 'true' ? 'long' : 'short',
          price: parseFloat(pairs.price) || 0,
          quantity: parseFloat(pairs.amount || pairs.size || pairs.quantity) || 0,
          fee: parseFloat(pairs.fee) || 0,
          pnl: pairs.pnl ? parseFloat(pairs.pnl) : undefined,
          isEntry: pairs.type?.includes('open') || pairs.action?.includes('open'),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Determine market type from symbol or instruction
 */
function inferMarketType(symbol: string, logs: string[]): MarketType {
  const symbolLower = symbol.toLowerCase();
  const logsJoined = logs.join(' ').toLowerCase();
  
  if (symbolLower.includes('perp') || logsJoined.includes('perpetual') || logsJoined.includes('perp')) {
    return 'perpetual';
  }
  if (symbolLower.includes('opt') || logsJoined.includes('option') || logsJoined.includes('call') || logsJoined.includes('put')) {
    return 'options';
  }
  return 'spot';
}

/**
 * Infer order type from logs
 */
function inferOrderType(logs: string[]): OrderType {
  const logsJoined = logs.join(' ').toLowerCase();
  
  if (logsJoined.includes('limit')) return 'limit';
  if (logsJoined.includes('stop') || logsJoined.includes('stop-loss')) return 'stop-loss';
  if (logsJoined.includes('take-profit') || logsJoined.includes('tp')) return 'take-profit';
  return 'market';
}

/**
 * Fetch and parse transactions for a wallet from Deriverse program
 */
export async function fetchDeriverseTransactions(
  connection: Connection,
  walletPubkey: PublicKey,
  limit: number = 100
): Promise<DeriverseTransaction[]> {
  const transactions: DeriverseTransaction[] = [];

  try {
    // Get transaction signatures for the wallet
    const signatures = await connection.getSignaturesForAddress(walletPubkey, { limit });

    if (signatures.length === 0) {
      return transactions;
    }

    // Fetch parsed transactions in batches
    const batchSize = 10;
    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);
      const txs = await connection.getParsedTransactions(
        batch.map(s => s.signature),
        { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }
      );

      for (let j = 0; j < txs.length; j++) {
        const tx = txs[j];
        const sig = batch[j];
        
        if (!tx || !tx.meta) continue;

        // Check if this transaction involves the Deriverse program
        const isDeriverseTransaction = tx.transaction.message.accountKeys.some(
          key => key.pubkey.equals(DERIVERSE_PROGRAM_ID)
        );

        if (!isDeriverseTransaction) continue;

        const logs = tx.meta.logMessages || [];
        
        // Parse logs for trade data
        for (const log of logs) {
          const parsed = parseDeriverseLog(log);
          if (parsed && parsed.symbol) {
            transactions.push({
              signature: sig.signature,
              timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
              type: parsed.isEntry ? 'open' : 'close',
              symbol: parsed.symbol,
              side: parsed.side || 'long',
              marketType: inferMarketType(parsed.symbol, logs),
              orderType: inferOrderType(logs),
              price: parsed.price || 0,
              quantity: parsed.quantity || 0,
              fee: parsed.fee || 0,
              pnl: parsed.pnl,
              isEntry: parsed.isEntry ?? true,
            });
          }
        }
      }
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching Deriverse transactions:', error);
    throw error;
  }
}

/**
 * Convert raw transactions to Trade objects by matching entries with exits
 */
export function convertToTrades(transactions: DeriverseTransaction[]): Trade[] {
  const trades: Trade[] = [];
  const openPositions: Map<string, DeriverseTransaction> = new Map();

  // Sort by timestamp ascending
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

  for (const tx of sorted) {
    const positionKey = `${tx.symbol}-${tx.side}`;

    if (tx.isEntry || tx.type === 'open') {
      // Opening a position
      openPositions.set(positionKey, tx);
    } else if (openPositions.has(positionKey)) {
      // Closing a position
      const entry = openPositions.get(positionKey)!;
      openPositions.delete(positionKey);

      const entryTime = new Date(entry.timestamp);
      const exitTime = new Date(tx.timestamp);
      const duration = Math.round((exitTime.getTime() - entryTime.getTime()) / (1000 * 60)); // minutes

      // Calculate PnL
      let pnl = tx.pnl ?? 0;
      if (!tx.pnl) {
        const priceDiff = tx.price - entry.price;
        pnl = entry.side === 'long' 
          ? priceDiff * entry.quantity 
          : -priceDiff * entry.quantity;
      }

      const totalFees = (entry.fee || 0) + (tx.fee || 0);
      pnl -= totalFees;

      const notionalValue = entry.price * entry.quantity;
      const pnlPercent = notionalValue > 0 ? (pnl / notionalValue) * 100 : 0;

      trades.push({
        id: tx.signature,
        symbol: tx.symbol,
        marketType: tx.marketType,
        side: entry.side,
        orderType: entry.orderType,
        entryPrice: entry.price,
        exitPrice: tx.price,
        quantity: entry.quantity,
        pnl,
        pnlPercent,
        fees: totalFees,
        entryTime,
        exitTime,
        duration,
        txSignature: tx.signature,
      });
    }
  }

  // Sort by exit time descending (most recent first)
  return trades.sort((a, b) => b.exitTime.getTime() - a.exitTime.getTime());
}

/**
 * Calculate portfolio metrics from trades
 */
export function calculateMetrics(trades: Trade[]): PortfolioMetrics {
  if (trades.length === 0) return emptyMetrics;

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const scratches = trades.filter(t => t.pnl === 0);

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  const totalVolume = trades.reduce((sum, t) => sum + (t.entryPrice * t.quantity), 0);

  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0;

  const largestWin = wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0;

  const avgDuration = trades.length > 0 
    ? trades.reduce((sum, t) => sum + t.duration, 0) / trades.length 
    : 0;

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

  // Current streak from most recent trade
  if (trades.length > 0) {
    const recent = trades[0];
    currentStreakType = recent.pnl > 0 ? 'win' : recent.pnl < 0 ? 'loss' : 'none';
    currentStreak = 1;
    for (let i = 1; i < trades.length; i++) {
      if ((currentStreakType === 'win' && trades[i].pnl > 0) ||
          (currentStreakType === 'loss' && trades[i].pnl < 0)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Long/Short ratio
  const longs = trades.filter(t => t.side === 'long');
  const shorts = trades.filter(t => t.side === 'short');
  const totalTrades = trades.length;
  const longRatio = totalTrades > 0 ? (longs.length / totalTrades) * 100 : 50;
  const shortRatio = totalTrades > 0 ? (shorts.length / totalTrades) * 100 : 50;

  // Risk metrics
  const returns = trades.map(t => t.pnlPercent);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1
    ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
    : 0;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

  // Max Drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let cumPnl = 0;
  for (const trade of [...trades].reverse()) {
    cumPnl += trade.pnl;
    peak = Math.max(peak, cumPnl);
    const drawdown = peak > 0 ? ((peak - cumPnl) / peak) * 100 : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Profit factor
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Expectancy
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

  // ROI (assuming $10,000 starting capital)
  const startingCapital = 10000;
  const roi = (totalPnl / startingCapital) * 100;

  return {
    totalPnl,
    totalPnlPercent: roi,
    realizedPnl: totalPnl,
    unrealizedPnl: 0, // Would need live positions
    roi,
    totalTrades,
    winningTrades: wins.length,
    losingTrades: losses.length,
    scratchTrades: scratches.length,
    winRate,
    averageWin: avgWin,
    averageLoss: avgLoss,
    largestWin,
    largestLoss,
    avgTradeDuration: avgDuration,
    sharpeRatio,
    maxDrawdown,
    expectancy,
    profitFactor,
    longRatio,
    shortRatio,
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
    totalFees,
    totalVolume,
  };
}

/**
 * Generate equity curve from trades
 */
export function generateEquityCurve(trades: Trade[], startingCapital: number = 10000): EquityPoint[] {
  if (trades.length === 0) return [];

  const sortedTrades = [...trades].sort((a, b) => a.exitTime.getTime() - b.exitTime.getTime());
  const equityCurve: EquityPoint[] = [];
  
  let equity = startingCapital;
  let peak = startingCapital;

  for (const trade of sortedTrades) {
    equity += trade.pnl;
    peak = Math.max(peak, equity);
    const drawdown = peak - equity;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

    equityCurve.push({
      date: trade.exitTime.toISOString().split('T')[0],
      equity,
      pnl: trade.pnl,
      drawdown,
      drawdownPercent,
    });
  }

  return equityCurve;
}

/**
 * Generate volume data by market type
 */
export function generateVolumeData(trades: Trade[]): VolumeData[] {
  if (trades.length === 0) return [];

  const volumeByDate: Map<string, VolumeData> = new Map();

  for (const trade of trades) {
    const date = trade.exitTime.toISOString().split('T')[0];
    const volume = trade.entryPrice * trade.quantity;

    if (!volumeByDate.has(date)) {
      volumeByDate.set(date, { date, spot: 0, perpetual: 0, options: 0, total: 0 });
    }

    const data = volumeByDate.get(date)!;
    data[trade.marketType] += volume;
    data.total += volume;
  }

  return Array.from(volumeByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate fee breakdown
 */
export function generateFeeBreakdown(trades: Trade[]): FeeBreakdown[] {
  if (trades.length === 0) return [];

  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
  if (totalFees === 0) return [];

  // Estimate fee distribution (actual breakdown would come from detailed tx parsing)
  const breakdown: FeeBreakdown[] = [
    { type: 'Trading Fees', amount: totalFees * 0.7, percentage: 70 },
    { type: 'Network Fees', amount: totalFees * 0.2, percentage: 20 },
    { type: 'Funding Fees', amount: totalFees * 0.08, percentage: 8 },
    { type: 'Other Fees', amount: totalFees * 0.02, percentage: 2 },
  ].filter(f => f.amount > 0);

  return breakdown;
}

/**
 * Generate time-based performance metrics
 */
export function generateTimePerformance(trades: Trade[]): DailyPerformance {
  if (trades.length === 0) return { daily: [], hourly: [] };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMap: Map<string, { pnl: number; trades: number; wins: number }> = new Map();
  const hourlyMap: Map<number, { pnl: number; trades: number; wins: number }> = new Map();

  // Initialize
  days.forEach(day => dailyMap.set(day, { pnl: 0, trades: 0, wins: 0 }));
  for (let h = 0; h < 24; h++) hourlyMap.set(h, { pnl: 0, trades: 0, wins: 0 });

  // Aggregate
  for (const trade of trades) {
    const day = days[trade.exitTime.getDay()];
    const hour = trade.exitTime.getHours();

    const dailyData = dailyMap.get(day)!;
    dailyData.pnl += trade.pnl;
    dailyData.trades++;
    if (trade.pnl > 0) dailyData.wins++;

    const hourlyData = hourlyMap.get(hour)!;
    hourlyData.pnl += trade.pnl;
    hourlyData.trades++;
    if (trade.pnl > 0) hourlyData.wins++;
  }

  const daily: TimePerformance[] = days.map(day => {
    const data = dailyMap.get(day)!;
    return {
      label: day,
      pnl: data.pnl,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    };
  });

  const hourly: TimePerformance[] = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
    label: `${hour.toString().padStart(2, '0')}:00`,
    pnl: data.pnl,
    trades: data.trades,
    winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
  }));

  return { daily, hourly };
}
