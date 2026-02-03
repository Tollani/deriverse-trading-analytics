import { useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Trade, 
  PortfolioMetrics, 
  EquityPoint, 
  VolumeData, 
  FeeBreakdown,
  DailyPerformance,
  emptyMetrics 
} from '@/lib/types';
import {
  fetchDeriverseTransactions,
  convertToTrades,
  calculateMetrics,
  generateEquityCurve,
  generateVolumeData,
  generateFeeBreakdown,
  generateTimePerformance,
  DERIVERSE_PROGRAM_ID,
} from '@/lib/deriverse';

interface TradingDataState {
  trades: Trade[];
  metrics: PortfolioMetrics;
  equityCurve: EquityPoint[];
  volumeData: VolumeData[];
  feeBreakdown: FeeBreakdown[];
  timePerformance: DailyPerformance;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: TradingDataState = {
  trades: [],
  metrics: emptyMetrics,
  equityCurve: [],
  volumeData: [],
  feeBreakdown: [],
  timePerformance: { daily: [], hourly: [] },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Cache for trading data to prevent excessive RPC calls
const dataCache = new Map<string, { data: TradingDataState; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

export function useTradingData() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [state, setState] = useState<TradingDataState>(initialState);

  const fetchTradingData = useCallback(async (forceRefresh = false) => {
    if (!connected || !publicKey) {
      setState(initialState);
      return;
    }

    const walletAddress = publicKey.toBase58();
    
    // Check cache
    if (!forceRefresh) {
      const cached = dataCache.get(walletAddress);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setState(cached.data);
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`Fetching Deriverse transactions for wallet: ${walletAddress}`);
      console.log(`Using Program ID: ${DERIVERSE_PROGRAM_ID.toBase58()}`);

      // Fetch transactions from Solana blockchain
      const transactions = await fetchDeriverseTransactions(
        connection,
        publicKey,
        200 // Fetch last 200 transactions
      );

      console.log(`Found ${transactions.length} Deriverse transactions`);

      // Convert to trades
      const trades = convertToTrades(transactions);
      console.log(`Converted to ${trades.length} completed trades`);

      // Calculate all derived data
      const metrics = calculateMetrics(trades);
      const equityCurve = generateEquityCurve(trades);
      const volumeData = generateVolumeData(trades);
      const feeBreakdown = generateFeeBreakdown(trades);
      const timePerformance = generateTimePerformance(trades);

      const newState: TradingDataState = {
        trades,
        metrics,
        equityCurve,
        volumeData,
        feeBreakdown,
        timePerformance,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      };

      // Update cache
      dataCache.set(walletAddress, { data: newState, timestamp: Date.now() });
      
      setState(newState);
    } catch (error) {
      console.error('Error fetching trading data:', error);
      
      let errorMessage = 'Failed to fetch trading data';
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('429') || msg.includes('rate')) {
          errorMessage = 'Rate limited by RPC. Please try again in a few seconds.';
        } else if (msg.includes('timeout')) {
          errorMessage = 'Connection timeout. Please check your network and try again.';
        } else if (msg.includes('403') || msg.includes('forbidden')) {
          errorMessage = 'RPC access denied. The endpoint may be rate-limited. Retrying with fallback...';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [connection, publicKey, connected]);

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchTradingData();
    } else {
      setState(initialState);
    }
  }, [connected, publicKey]); // Don't include fetchTradingData to avoid loop

  const refresh = useCallback(() => {
    fetchTradingData(true); // Force refresh, bypass cache
  }, [fetchTradingData]);

  return {
    ...state,
    connected,
    walletAddress: publicKey?.toBase58(),
    refresh,
  };
}
