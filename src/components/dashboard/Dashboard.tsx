import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Clock,
  BarChart3,
  Flame,
  AlertTriangle,
  Trophy,
  Skull,
  Zap,
  PieChart,
} from "lucide-react";

import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { EquityChart } from "./EquityChart";
import { VolumeChart } from "./VolumeChart";
import { FeeChart } from "./FeeChart";
import { WinRateGauge } from "./WinRateGauge";
import { LongShortRatio } from "./LongShortRatio";
import { TimeHeatmap } from "./TimeHeatmap";
import { TradeHistoryTable } from "./TradeHistoryTable";
import { EmptyState } from "./EmptyState";

import { useTradingData } from "@/hooks/useTradingData";
import { Trade } from "@/lib/types";

export function Dashboard() {
  const { connected } = useWallet();
  const { 
    trades, 
    metrics, 
    equityCurve: equityData, 
    volumeData, 
    feeBreakdown: feeData, 
    timePerformance,
    isLoading, 
    error,
    refresh 
  } = useTradingData();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch data when wallet connects
  useEffect(() => {
    if (connected) {
      refresh();
    }
  }, [connected, refresh]);

  const filteredTrades = useMemo(() => {
    if (!dateRange?.from) return trades;
    return trades.filter((trade: Trade) => {
      const tradeDate = trade.exitTime;
      const from = dateRange.from!;
      const to = dateRange.to || new Date();
      return tradeDate >= from && tradeDate <= to;
    });
  }, [trades, dateRange]);

  // Calculate long/short PnL
  const longPnl = useMemo(() => 
    filteredTrades.filter((t: Trade) => t.side === 'long').reduce((sum: number, t: Trade) => sum + t.pnl, 0),
    [filteredTrades]
  );
  const shortPnl = useMemo(() =>
    filteredTrades.filter((t: Trade) => t.side === 'short').reduce((sum: number, t: Trade) => sum + t.pnl, 0),
    [filteredTrades]
  );

  const handleRefresh = () => {
    refresh();
  };

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Show loading state
  if (isLoading && connected) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <main className="container mx-auto px-4 py-6">
          <EmptyState type="loading" />
        </main>
      </div>
    );
  }

  // Show error state
  if (error && connected) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <main className="container mx-auto px-4 py-6">
          <EmptyState type="error" message={error} />
        </main>
      </div>
    );
  }

  // Show no trades state (only when connected)
  if (trades.length === 0 && connected) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <main className="container mx-auto px-4 py-6">
          <EmptyState type="no-trades" />
        </main>
      </div>
    );
  }

  // Show full dashboard (connected with data OR not connected with placeholder)
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        trades={filteredTrades}
        metrics={metrics}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Total PnL"
            value={formatCurrency(metrics.totalPnl)}
            change={metrics.totalPnlPercent}
            variant={metrics.totalPnl >= 0 ? 'profit' : 'loss'}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricCard
            title="ROI"
            value={`${metrics.roi.toFixed(2)}%`}
            subtitle="All time"
            variant={metrics.roi >= 0 ? 'profit' : 'loss'}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Total Trades"
            value={metrics.totalTrades.toString()}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            variant={metrics.winRate >= 50 ? 'profit' : 'loss'}
            icon={<Target className="h-4 w-4" />}
          />
          <MetricCard
            title="Sharpe Ratio"
            value={metrics.sharpeRatio.toFixed(2)}
            variant={metrics.sharpeRatio >= 1 ? 'profit' : metrics.sharpeRatio >= 0 ? 'neutral' : 'loss'}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <MetricCard
            title="Max Drawdown"
            value={`-${metrics.maxDrawdown.toFixed(2)}%`}
            variant="loss"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Equity Chart - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Equity Curve</CardTitle>
                  <CardDescription>Portfolio performance over time</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono text-foreground">
                    ${(10000 + metrics.totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm font-mono ${metrics.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {metrics.totalPnl >= 0 ? '+' : ''}{formatCurrency(metrics.totalPnl)} ({metrics.roi.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EquityChart data={equityData} showDrawdown />
            </CardContent>
          </Card>
          
          {/* Win Rate Gauge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Win Rate Analysis</CardTitle>
              <CardDescription>Trade outcome distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-2">
              <WinRateGauge
                winRate={metrics.winRate}
                wins={metrics.winningTrades}
                losses={metrics.losingTrades}
                scratches={metrics.scratchTrades}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Avg Trade Duration"
                value={metrics.avgTradeDuration < 60 
                  ? `${metrics.avgTradeDuration.toFixed(0)}m` 
                  : `${(metrics.avgTradeDuration / 60).toFixed(1)}h`
                }
                icon={<Clock className="h-4 w-4" />}
              />
              <MetricCard
                title="Average Win"
                value={formatCurrency(metrics.averageWin)}
                variant="profit"
                icon={<Trophy className="h-4 w-4" />}
              />
              <MetricCard
                title="Average Loss"
                value={formatCurrency(metrics.averageLoss)}
                variant="loss"
                icon={<Skull className="h-4 w-4" />}
              />
              <MetricCard
                title="Expectancy"
                value={formatCurrency(metrics.expectancy)}
                variant={metrics.expectancy >= 0 ? 'profit' : 'loss'}
                icon={<Zap className="h-4 w-4" />}
              />
              <MetricCard
                title="Current Streak"
                value={`${metrics.currentStreak} ${metrics.currentStreakType === 'win' ? 'W' : metrics.currentStreakType === 'loss' ? 'L' : '-'}`}
                variant={metrics.currentStreakType === 'win' ? 'profit' : metrics.currentStreakType === 'loss' ? 'loss' : 'neutral'}
                icon={<Flame className="h-4 w-4" />}
              />
              <MetricCard
                title="Total Fees"
                value={formatCurrency(metrics.totalFees)}
                variant="loss"
                icon={<PieChart className="h-4 w-4" />}
              />
            </div>
            
            {/* Charts Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Volume Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Trading Volume</CardTitle>
                  <CardDescription>Volume by market type</CardDescription>
                </CardHeader>
                <CardContent>
                  <VolumeChart data={volumeData} />
                </CardContent>
              </Card>
              
              {/* Long/Short Ratio */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Long/Short Ratio</CardTitle>
                  <CardDescription>Directional bias analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <LongShortRatio
                    longRatio={metrics.longRatio}
                    shortRatio={metrics.shortRatio}
                    longPnl={longPnl}
                    shortPnl={shortPnl}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Fee Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Fee Breakdown</CardTitle>
                  <CardDescription>Total: {formatCurrency(metrics.totalFees)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FeeChart data={feeData} />
                </CardContent>
              </Card>
              
              {/* Daily Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Performance by Day</CardTitle>
                  <CardDescription>Weekday PnL distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeHeatmap data={timePerformance.daily} type="daily" />
                </CardContent>
              </Card>
              
              {/* Hourly Heatmap */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Hourly Performance</CardTitle>
                  <CardDescription>Time-of-day analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeHeatmap data={timePerformance.hourly} type="hourly" />
                </CardContent>
              </Card>
            </div>

            {/* Largest Win/Loss */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="metric-card-profit">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-profit" />
                    Largest Win
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-profit">
                      +{formatCurrency(metrics.largestWin)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Best performing trade in the selected period
                  </p>
                </CardContent>
              </Card>
              
              <Card className="metric-card-loss">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Skull className="h-5 w-5 text-loss" />
                    Largest Loss
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-loss">
                      {formatCurrency(metrics.largestLoss)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Worst performing trade in the selected period
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>
                  Complete record of all your trades with annotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradeHistoryTable trades={filteredTrades} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Streak Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Streak Analysis</CardTitle>
                  <CardDescription>Win and loss streak history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Longest Win Streak</p>
                      <p className="text-2xl font-bold font-mono text-profit">{metrics.longestWinStreak}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Longest Loss Streak</p>
                      <p className="text-2xl font-bold font-mono text-loss">{metrics.longestLossStreak}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Win/Loss Ratio</p>
                      <p className="text-2xl font-bold font-mono">
                        {(metrics.averageWin / (metrics.averageLoss || 1)).toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Profit Factor</p>
                      <p className="text-2xl font-bold font-mono">
                        {metrics.profitFactor.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Metrics</CardTitle>
                  <CardDescription>Key risk indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                      <p className="text-2xl font-bold font-mono text-loss">-{metrics.maxDrawdown.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                      <p className="text-2xl font-bold font-mono">{metrics.sharpeRatio.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Risk/Reward</p>
                      <p className="text-2xl font-bold font-mono">
                        1:{(metrics.averageWin / (metrics.averageLoss || 1)).toFixed(1)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Expectancy</p>
                      <p className={`text-2xl font-bold font-mono ${metrics.expectancy >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(metrics.expectancy)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance by Market Type</CardTitle>
                <CardDescription>Compare your results across different markets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {(['spot', 'perpetual', 'options'] as const).map((marketType) => {
                    const marketTrades = filteredTrades.filter((t: Trade) => t.marketType === marketType);
                    const marketPnl = marketTrades.reduce((sum: number, t: Trade) => sum + t.pnl, 0);
                    const marketWins = marketTrades.filter((t: Trade) => t.pnl > 0).length;
                    const marketWinRate = marketTrades.length > 0 
                      ? (marketWins / marketTrades.length) * 100 
                      : 0;
                    
                    return (
                      <div key={marketType} className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="text-sm font-medium text-muted-foreground capitalize mb-3">
                          {marketType}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">PnL</span>
                            <span className={`font-mono font-medium ${marketPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                              {formatCurrency(marketPnl)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Trades</span>
                            <span className="font-mono">{marketTrades.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Win Rate</span>
                            <span className={`font-mono ${marketWinRate >= 50 ? 'text-profit' : 'text-loss'}`}>
                              {marketWinRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
