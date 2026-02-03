import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  variant?: 'default' | 'profit' | 'loss' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  variant = 'default',
  icon,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-profit';
    if (change < 0) return 'text-loss';
    return 'text-muted-foreground';
  };

  return (
    <div
      className={cn(
        "metric-card group",
        variant === 'profit' && "metric-card-profit",
        variant === 'loss' && "metric-card-loss",
        className
      )}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={cn(
          "absolute inset-0 rounded-lg blur-xl",
          variant === 'profit' && "bg-profit/5",
          variant === 'loss' && "bg-loss/5",
          variant === 'default' && "bg-primary/5",
        )} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl font-bold font-mono tracking-tight",
            variant === 'profit' && "text-profit",
            variant === 'loss' && "text-loss",
          )}>
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>
        
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 mt-2 text-sm", getChangeColor())}>
            {getTrendIcon()}
            <span className="font-medium font-mono">
              {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground text-xs">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
