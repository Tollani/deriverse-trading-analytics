import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { EquityPoint } from "@/lib/mockData";
import { format } from "date-fns";

interface EquityChartProps {
  data: EquityPoint[];
  showDrawdown?: boolean;
  showBenchmark?: boolean;
}

export function EquityChart({ data, showDrawdown = true, showBenchmark = false }: EquityChartProps) {
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      dateFormatted: format(point.date, "MMM dd"),
      dateTime: format(point.date, "MMM dd, HH:mm"),
      index,
    }));
  }, [data]);

  const startingEquity = 10000;
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const point = payload[0].payload;
    const isProfit = point.equity >= startingEquity;
    
    return (
      <div className="glass rounded-lg border border-border p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{point.dateTime}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Equity</span>
            <span className={`text-sm font-mono font-semibold ${isProfit ? 'text-profit' : 'text-loss'}`}>
              ${point.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">PnL</span>
            <span className={`text-sm font-mono ${point.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {point.pnl >= 0 ? '+' : ''}${point.pnl.toFixed(2)}
            </span>
          </div>
          {showDrawdown && point.drawdown > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Drawdown</span>
              <span className="text-sm font-mono text-loss">-{point.drawdown.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No trading data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        
        <XAxis
          dataKey="dateFormatted"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickMargin={10}
        />
        
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          domain={['dataMin - 500', 'dataMax + 500']}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <ReferenceLine
          y={startingEquity}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="5 5"
          opacity={0.5}
        />
        
        {showDrawdown && (
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="none"
            fill="url(#drawdownGradient)"
            yAxisId={1}
          />
        )}
        
        <Area
          type="monotone"
          dataKey="equity"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#equityGradient)"
          dot={false}
          activeDot={{
            r: 4,
            stroke: 'hsl(var(--primary))',
            strokeWidth: 2,
            fill: 'hsl(var(--background))',
          }}
        />
        
        {showBenchmark && (
          <Area
            type="monotone"
            dataKey="benchmark"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />
        )}
        
        <YAxis yAxisId={1} hide domain={[0, 100]} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
