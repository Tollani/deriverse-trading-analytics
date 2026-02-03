import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { VolumeData } from "@/lib/types";

interface VolumeChartProps {
  data: VolumeData[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
    
    return (
      <div className="glass rounded-lg border border-border p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.fill }}
                />
                <span className="text-sm capitalize">{p.dataKey}</span>
              </div>
              <span className="text-sm font-mono">
                ${(p.value / 1000).toFixed(1)}k
              </span>
            </div>
          ))}
          <div className="pt-1 mt-1 border-t border-border flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-mono font-medium">
              ${(total / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No volume data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Legend
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span className="text-sm capitalize text-muted-foreground">{value}</span>
          )}
        />
        
        <Bar
          dataKey="spot"
          stackId="volume"
          fill="hsl(var(--chart-1))"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="perpetual"
          stackId="volume"
          fill="hsl(var(--chart-2))"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="options"
          stackId="volume"
          fill="hsl(var(--chart-3))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
