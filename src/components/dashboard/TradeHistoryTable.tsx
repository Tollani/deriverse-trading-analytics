import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Trade } from "@/lib/types";

interface TradeHistoryTableProps {
  trades: Trade[];
}

type SortField = 'exitTime' | 'pnl' | 'pnlPercent' | 'symbol' | 'duration';
type SortDirection = 'asc' | 'desc';

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [search, setSearch] = useState("");
  const [symbolFilter, setSymbolFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [sideFilter, setSideFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('exitTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  const itemsPerPage = 10;
  
  // Get unique symbols
  const symbols = useMemo(() => 
    Array.from(new Set(trades.map(t => t.symbol))).sort(),
    [trades]
  );
  
  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    let result = trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(search.toLowerCase()) ||
        trade.notes?.toLowerCase().includes(search.toLowerCase());
      const matchesSymbol = symbolFilter === 'all' || trade.symbol === symbolFilter;
      const matchesMarket = marketFilter === 'all' || trade.marketType === marketFilter;
      const matchesSide = sideFilter === 'all' || trade.side === sideFilter;
      
      return matchesSearch && matchesSymbol && matchesMarket && matchesSide;
    });
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'exitTime':
          comparison = new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime();
          break;
        case 'pnl':
          comparison = a.pnl - b.pnl;
          break;
        case 'pnlPercent':
          comparison = a.pnlPercent - b.pnlPercent;
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [trades, search, symbolFilter, marketFilter, sideFilter, sortField, sortDirection]);
  
  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleSaveNotes = (tradeId: string, note: string) => {
    setNotes(prev => ({ ...prev, [tradeId]: note }));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
    return `${(minutes / 1440).toFixed(1)}d`;
  };

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No trades to display</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start trading on Deriverse to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={symbolFilter} onValueChange={setSymbolFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Symbols</SelectItem>
            {symbols.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
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
        <Select value={sideFilter} onValueChange={setSideFilter}>
          <SelectTrigger className="w-[120px]">
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
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('exitTime')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  Symbol
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">Exit</TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => handleSort('pnl')}
              >
                <div className="flex items-center justify-end gap-1">
                  PnL
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center justify-end gap-1">
                  Duration
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.map((trade) => (
              <TableRow key={trade.id} className="trade-row">
                <TableCell className="font-mono text-sm">
                  {format(trade.exitTime, "MMM dd, HH:mm")}
                </TableCell>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-xs">
                    {trade.marketType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "capitalize text-xs",
                      trade.side === 'long' 
                        ? "border-profit/30 text-profit" 
                        : "border-loss/30 text-loss"
                    )}
                  >
                    {trade.side}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  ${trade.entryPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  ${trade.exitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className={cn(
                    "font-mono font-medium",
                    trade.pnl > 0 ? "text-profit" : trade.pnl < 0 ? "text-loss" : "text-muted-foreground"
                  )}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    <span className="text-xs ml-1 opacity-70">
                      ({trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatDuration(trade.duration)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                        >
                          <MessageSquare className={cn(
                            "h-3.5 w-3.5",
                            (trade.notes || notes[trade.id]) ? "text-primary" : "text-muted-foreground"
                          )} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Trade Notes - {trade.symbol}</DialogTitle>
                          <DialogDescription>
                            Add notes about your trade reasoning, market conditions, or lessons learned.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea
                            placeholder="Write your notes here..."
                            defaultValue={notes[trade.id] || trade.notes || ''}
                            rows={4}
                            onChange={(e) => setNotes(prev => ({ ...prev, [trade.id]: e.target.value }))}
                          />
                          <div className="flex justify-end">
                            <Button onClick={() => handleSaveNotes(trade.id, notes[trade.id] || '')}>
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {trade.txSignature && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        asChild
                      >
                        <a 
                          href={`https://solscan.io/tx/${trade.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
