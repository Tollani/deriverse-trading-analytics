import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface LongShortRatioProps {
  longRatio: number;
  shortRatio: number;
  longPnl?: number;
  shortPnl?: number;
}

export function LongShortRatio({ longRatio, shortRatio, longPnl = 0, shortPnl = 0 }: LongShortRatioProps) {
  const isLongBias = longRatio > 55;
  const isShortBias = shortRatio > 55;
  
  return (
    <div className="space-y-4">
      {/* Ratio bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4 text-profit" />
            <span className="font-medium">Long</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Short</span>
            <ArrowDownRight className="h-4 w-4 text-loss" />
          </div>
        </div>
        
        <div className="relative h-4 rounded-full overflow-hidden bg-muted">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-profit to-profit/70 transition-all duration-500"
            style={{ width: `${longRatio}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-loss to-loss/70 transition-all duration-500"
            style={{ width: `${shortRatio}%` }}
          />
          
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-background/50" />
        </div>
        
        <div className="flex items-center justify-between text-sm font-mono">
          <span className={cn(isLongBias && "text-profit font-semibold")}>{longRatio.toFixed(1)}%</span>
          <span className={cn(isShortBias && "text-loss font-semibold")}>{shortRatio.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* PnL by direction */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Long PnL</p>
          <p className={cn(
            "text-lg font-mono font-semibold",
            longPnl >= 0 ? "text-profit" : "text-loss"
          )}>
            {longPnl >= 0 ? '+' : ''}${longPnl.toFixed(2)}
          </p>
        </div>
        
        <div className="space-y-1 text-right">
          <p className="text-xs text-muted-foreground">Short PnL</p>
          <p className={cn(
            "text-lg font-mono font-semibold",
            shortPnl >= 0 ? "text-profit" : "text-loss"
          )}>
            {shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Bias warning */}
      {(isLongBias || isShortBias) && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
          isLongBias && "bg-profit-muted text-profit",
          isShortBias && "bg-loss-muted text-loss",
        )}>
          <span className="font-medium">
            {isLongBias ? '📈 Strong long bias detected' : '📉 Strong short bias detected'}
          </span>
        </div>
      )}
    </div>
  );
}
