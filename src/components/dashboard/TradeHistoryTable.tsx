import { useState, useMemo } from "react";
import { Trade } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface TradeHistoryTableProps {
  trades: Trade[];
}

type SortKey = 'exitTime' | 'symbol' | 'pnl' | 'pnlPercent' | 'volume';
type SortOrder = 'asc' | 'desc';

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [symbolFilter, setSymbolFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [sideFilter, setSideFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>('exitTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const symbols = useMemo(() => {
    const uniqueSymbols = [...new Set(trades.map(t => t.symbol))];
    return uniqueSymbols.sort();
  }, [trades]);
  
  const filteredTrades = useMemo(() => {
    return trades
      .filter(trade => {
        if (search && !trade.symbol.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (symbolFilter !== "all" && trade.symbol !== symbolFilter) {
          return false;
        }
        if (marketFilter !== "all" && trade.marketType !== marketFilter) {
          return false;
        }
        if (sideFilter !== "all" && trade.side !== sideFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
          case 'exitTime':
            comparison = a.exitTime.getTime() - b.exitTime.getTime();
            break;
          case 'symbol':
            comparison = a.symbol.localeCompare(b.symbol);
            break;
          case 'pnl':
            comparison = a.pnl - b.pnl;
            break;
          case 'pnlPercent':
            comparison = a.pnlPercent - b.pnlPercent;
            break;
          case 'volume':
            comparison = (a.entryPrice * a.quantity) - (b.entryPrice * b.quantity);
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [trades, search, symbolFilter, marketFilter, sideFilter, sortKey, sortOrder]);
  
  const totalPages = Math.ceil(filteredTrades.length / pageSize);
  const paginatedTrades = filteredTrades.slice((page - 1) * pageSize, page * pageSize);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };
  
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbol..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        
        <Select value={symbolFilter} onValueChange={(v) => { setSymbolFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Symbols</SelectItem>
            {symbols.map(symbol => (
              <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={marketFilter} onValueChange={(v) => { setMarketFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="spot">Spot</SelectItem>
            <SelectItem value="perpetual">Perpetual</SelectItem>
            <SelectItem value="options">Options</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sideFilter} onValueChange={(v) => { setSideFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sides</SelectItem>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('exitTime')}
              >
                <div className="flex items-center">
                  Date/Time
                  <SortIcon columnKey="exitTime" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center">
                  Symbol
                  <SortIcon columnKey="symbol" />
                </div>
              </TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Market</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead 
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort('pnl')}
              >
                <div className="flex items-center justify-end">
                  PnL
                  <SortIcon columnKey="pnl" />
                </div>
              </TableHead>
              <TableHead className="text-right">Fees</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No trades found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrades.map((trade) => {
                const duration = (trade.exitTime.getTime() - trade.entryTime.getTime()) / (1000 * 60);
                const totalFees = trade.fees.maker + trade.fees.taker + (trade.fees.funding || 0) + (trade.fees.premium || 0);
                
                return (
                  <TableRow key={trade.id} className="trade-row">
                    <TableCell className="font-mono text-sm">
                      {format(trade.exitTime, "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        trade.side === 'long' ? "bg-profit-muted text-profit" : "bg-loss-muted text-loss"
                      )}>
                        {trade.side.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground text-sm">
                      {trade.marketType}
                      {trade.leverage && <span className="ml-1 text-xs">({trade.leverage}x)</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ${trade.entryPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ${trade.exitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn("font-mono text-sm font-medium", trade.pnl >= 0 ? "text-profit" : "text-loss")}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                      <div className={cn("font-mono text-xs", trade.pnl >= 0 ? "text-profit/70" : "text-loss/70")}>
                        {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      -${totalFees.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {duration < 60 ? `${duration.toFixed(0)}m` : `${(duration / 60).toFixed(1)}h`}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`https://solscan.io/tx/${trade.txHash}`, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredTrades.length)} of {filteredTrades.length} trades
        </p>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="px-3 text-sm">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
