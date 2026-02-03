import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { BarChart3, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'not-connected' | 'no-trades' | 'loading' | 'error';
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const { connected } = useWallet();

  if (type === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="mt-6 text-muted-foreground">Loading your trading data...</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-loss/10 flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-loss" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground max-w-md">
          {message || 'Failed to load trading data. Please try again.'}
        </p>
      </div>
    );
  }

  if (!connected || type === 'not-connected') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Connect your Solana wallet to view your trading analytics and performance metrics from Deriverse.
        </p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !h-11 !px-6" />
      </div>
    );
  }

  // No trades state
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">No Trading Data Yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Start trading on Deriverse to see your analytics here. Your trade history, performance metrics, and insights will appear automatically.
      </p>
      <Button asChild className="gap-2">
        <a href="https://alpha.deriverse.io" target="_blank" rel="noopener noreferrer">
          Start Trading on Deriverse
          <ArrowRight className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
}
