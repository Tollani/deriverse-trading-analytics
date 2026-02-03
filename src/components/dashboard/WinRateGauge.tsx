import { cn } from "@/lib/utils";

interface WinRateGaugeProps {
  winRate: number;
  wins: number;
  losses: number;
  scratches?: number;
}

export function WinRateGauge({ winRate, wins, losses, scratches = 0 }: WinRateGaugeProps) {
  const total = wins + losses + scratches;
  const winPercent = total > 0 ? (wins / total) * 100 : 0;
  const lossPercent = total > 0 ? (losses / total) * 100 : 0;
  const scratchPercent = total > 0 ? (scratches / total) * 100 : 0;
  
  const circumference = 2 * Math.PI * 45;
  const winDash = (winPercent / 100) * circumference;
  const lossDash = (lossPercent / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          
          {/* Loss arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--loss))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${lossDash} ${circumference}`}
            strokeDashoffset={0}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Win arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--profit))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${winDash} ${circumference}`}
            strokeDashoffset={-lossDash}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono">{winRate.toFixed(1)}%</span>
          <span className="text-xs text-muted-foreground">Win Rate</span>
        </div>
      </div>
      
      {/* Stats below */}
      <div className="flex gap-6 mt-4">
        <div className="text-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-profit" />
            <span className="text-sm font-mono font-medium text-profit">{wins}</span>
          </div>
          <span className="text-xs text-muted-foreground">Wins</span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-loss" />
            <span className="text-sm font-mono font-medium text-loss">{losses}</span>
          </div>
          <span className="text-xs text-muted-foreground">Losses</span>
        </div>
        
        {scratches > 0 && (
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-sm font-mono font-medium">{scratches}</span>
            </div>
            <span className="text-xs text-muted-foreground">Scratch</span>
          </div>
        )}
      </div>
    </div>
  );
}
