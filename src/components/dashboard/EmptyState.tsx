import { useWallet } from '@solana/wallet-adapter-react';
import { BarChart3, Wallet, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  type: 'not-connected' | 'no-trades' | 'loading' | 'error';
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const { connected } = useWallet();

  if (type === 'loading') {
    return (
      <div className="grid gap-6">
        {/* Skeleton metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-3 w-16 bg-muted rounded mb-2" />
                <div className="h-6 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Skeleton chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-32 bg-muted rounded mb-4" />
              <div className="h-64 bg-muted/50 rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-32 bg-muted rounded mb-4" />
              <div className="h-48 bg-muted/50 rounded" />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Loading your trading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <Card className="border-loss/30 bg-loss/5">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-loss/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-loss" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            {message || 'Failed to load trading data. Please try again.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!connected || type === 'not-connected') {
    // Show empty dashboard state - no prompt, just placeholder data
    return null;
  }

  // No trades state
  return (
    <Card className="border-muted">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">No Trading Data Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6 text-sm">
          Start trading on Deriverse to see your analytics here. Your trade history, performance metrics, and insights will appear automatically.
        </p>
        <Button asChild className="gap-2">
          <a href="https://alpha.deriverse.io" target="_blank" rel="noopener noreferrer">
            Start Trading on Deriverse
            <ArrowRight className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
