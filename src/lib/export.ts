import { Trade, PortfolioMetrics } from './types';
import { format } from 'date-fns';

/**
 * Convert trades to CSV format
 */
export function tradesToCSV(trades: Trade[]): string {
  const headers = [
    'Date',
    'Symbol',
    'Market Type',
    'Side',
    'Order Type',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'PnL',
    'PnL %',
    'Fees',
    'Duration (min)',
    'Transaction',
  ];

  const rows = trades.map(trade => [
    format(trade.exitTime, 'yyyy-MM-dd HH:mm:ss'),
    trade.symbol,
    trade.marketType,
    trade.side,
    trade.orderType,
    trade.entryPrice.toFixed(4),
    trade.exitPrice.toFixed(4),
    trade.quantity.toFixed(4),
    trade.pnl.toFixed(2),
    trade.pnlPercent.toFixed(2),
    trade.fees.toFixed(4),
    trade.duration.toString(),
    trade.txSignature || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Generate metrics report as CSV
 */
export function metricsToCSV(metrics: PortfolioMetrics): string {
  const data = [
    ['Metric', 'Value'],
    ['Total PnL', `$${metrics.totalPnl.toFixed(2)}`],
    ['ROI', `${metrics.roi.toFixed(2)}%`],
    ['Total Trades', metrics.totalTrades.toString()],
    ['Winning Trades', metrics.winningTrades.toString()],
    ['Losing Trades', metrics.losingTrades.toString()],
    ['Win Rate', `${metrics.winRate.toFixed(2)}%`],
    ['Average Win', `$${metrics.averageWin.toFixed(2)}`],
    ['Average Loss', `$${metrics.averageLoss.toFixed(2)}`],
    ['Largest Win', `$${metrics.largestWin.toFixed(2)}`],
    ['Largest Loss', `$${metrics.largestLoss.toFixed(2)}`],
    ['Expectancy', `$${metrics.expectancy.toFixed(2)}`],
    ['Profit Factor', metrics.profitFactor.toFixed(2)],
    ['Sharpe Ratio', metrics.sharpeRatio.toFixed(2)],
    ['Max Drawdown', `${metrics.maxDrawdown.toFixed(2)}%`],
    ['Avg Trade Duration (min)', metrics.avgTradeDuration.toFixed(0)],
    ['Long Ratio', `${metrics.longRatio.toFixed(2)}%`],
    ['Short Ratio', `${metrics.shortRatio.toFixed(2)}%`],
    ['Longest Win Streak', metrics.longestWinStreak.toString()],
    ['Longest Loss Streak', metrics.longestLossStreak.toString()],
    ['Total Fees', `$${metrics.totalFees.toFixed(2)}`],
    ['Total Volume', `$${metrics.totalVolume.toFixed(2)}`],
  ];

  return data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Generate full report combining metrics and trades
 */
export function generateFullReport(trades: Trade[], metrics: PortfolioMetrics): string {
  const reportDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  
  let report = `"Deriverse Trading Analytics Report"\n`;
  report += `"Generated","${reportDate}"\n\n`;
  
  report += `"=== PERFORMANCE SUMMARY ==="\n`;
  report += metricsToCSV(metrics);
  
  report += `\n\n"=== TRADE HISTORY ==="\n`;
  report += tradesToCSV(trades);
  
  return report;
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export trades to CSV file
 */
export function exportTradesToCSV(trades: Trade[]): void {
  const csv = tradesToCSV(trades);
  const filename = `deriverse-trades-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename);
}

/**
 * Export full analytics report
 */
export function exportFullReport(trades: Trade[], metrics: PortfolioMetrics): void {
  const report = generateFullReport(trades, metrics);
  const filename = `deriverse-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(report, filename);
}

/**
 * Export metrics summary
 */
export function exportMetrics(metrics: PortfolioMetrics): void {
  const csv = metricsToCSV(metrics);
  const filename = `deriverse-metrics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename);
}
