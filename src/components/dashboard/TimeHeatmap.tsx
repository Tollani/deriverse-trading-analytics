import { cn } from "@/lib/utils";
import { TimePerformance } from "@/lib/mockData";

interface TimeHeatmapProps {
  data: TimePerformance[];
  type: 'daily' | 'hourly';
}

export function TimeHeatmap({ data, type }: TimeHeatmapProps) {
  const maxPnl = Math.max(...data.map(d => Math.abs(d.pnl)));
  
  const getIntensity = (pnl: number) => {
    const normalized = Math.abs(pnl) / maxPnl;
    return Math.min(normalized * 100, 100);
  };
  
  const getColor = (pnl: number, intensity: number) => {
    if (pnl > 0) {
      return `hsl(160 84% ${Math.max(20, 50 - intensity / 2)}% / ${0.3 + intensity / 100 * 0.7})`;
    } else if (pnl < 0) {
      return `hsl(0 72% ${Math.max(20, 50 - intensity / 2)}% / ${0.3 + intensity / 100 * 0.7})`;
    }
    return 'hsl(var(--muted))';
  };

  if (type === 'hourly') {
    // Grid layout for hourly data
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-8 gap-1">
          {data.map((item) => {
            const intensity = getIntensity(item.pnl);
            return (
              <div
                key={item.period}
                className="group relative aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: getColor(item.pnl, intensity) }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono opacity-70">
                  {item.period.split(':')[0]}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="glass rounded-lg border border-border p-2 shadow-lg whitespace-nowrap">
                    <p className="text-xs font-medium">{item.period}</p>
                    <p className={cn(
                      "text-xs font-mono",
                      item.pnl >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.trades} trades</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-loss/50" />
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-profit/50" />
            <span>Profit</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Bar layout for daily data
  return (
    <div className="space-y-2">
      {data.map((item) => {
        const intensity = getIntensity(item.pnl);
        const barWidth = (Math.abs(item.pnl) / maxPnl) * 100;
        
        return (
          <div key={item.period} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-12 shrink-0">
              {item.period.slice(0, 3)}
            </span>
            
            <div className="flex-1 relative h-6 flex items-center">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
              
              {/* Bar */}
              <div
                className={cn(
                  "absolute h-4 rounded-sm transition-all duration-300",
                  item.pnl >= 0 ? "left-1/2" : "right-1/2",
                )}
                style={{
                  width: `${barWidth / 2}%`,
                  backgroundColor: getColor(item.pnl, intensity),
                }}
              />
            </div>
            
            <span className={cn(
              "text-xs font-mono w-16 text-right",
              item.pnl >= 0 ? "text-profit" : "text-loss"
            )}>
              {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
