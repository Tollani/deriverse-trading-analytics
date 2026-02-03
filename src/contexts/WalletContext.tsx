import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Public RPC endpoints for Solana mainnet (no API key required).
// NOTE: Some providers return 403 (especially on mobile / wallet in-app browsers).
// We probe a few and pick the first healthy one.
const SOLANA_RPC_ENDPOINTS = [
  // Generally CORS-friendly + stable for browser clients
  'https://solana.publicnode.com',
  // Fallbacks
  'https://rpc.ankr.com/solana',
  'https://api.mainnet-beta.solana.com',
];

async function isRpcHealthy(endpoint: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Default to a browser-friendly RPC; we may swap to a healthier fallback on mount.
  const [endpoint, setEndpoint] = useState<string>(SOLANA_RPC_ENDPOINTS[0]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const candidate of SOLANA_RPC_ENDPOINTS) {
        const ok = await isRpcHealthy(candidate);
        if (cancelled) return;
        if (ok) {
          setEndpoint(candidate);
          return;
        }
      }
      // If none respond, keep the default (better than blocking render).
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
