import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon, Download, RefreshCw, ExternalLink, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Trade, PortfolioMetrics } from "@/lib/types";
import { exportTradesToCSV, exportFullReport, exportMetrics } from "@/lib/export";
import { toast } from "sonner";

interface DashboardToolbarProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  trades?: Trade[];
  metrics?: PortfolioMetrics;
}

const presets = [
  { label: "Last 7 days", value: "7d", getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", value: "30d", getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This month", value: "mtd", getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", value: "lm", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "Last 3 months", value: "3m", getRange: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "All time", value: "all", getRange: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
];

export function DashboardToolbar({ 
  dateRange, 
  onDateRangeChange, 
  onRefresh, 
  isLoading,
  trades = [],
  metrics
}: DashboardToolbarProps) {
  const [preset, setPreset] = useState("30d");
  
  const handlePresetChange = (value: string) => {
    setPreset(value);
    const selectedPreset = presets.find(p => p.value === value);
    if (selectedPreset) {
      onDateRangeChange(selectedPreset.getRange());
    }
  };

  const handleExportTrades = () => {
    if (trades.length === 0) {
      toast.error('No trades to export');
      return;
    }
    exportTradesToCSV(trades);
    toast.success('Trade history exported successfully');
  };

  const handleExportReport = () => {
    if (!metrics || trades.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportFullReport(trades, metrics);
    toast.success('Full report exported successfully');
  };

  const handleExportMetrics = () => {
    if (!metrics) {
      toast.error('No metrics to export');
      return;
    }
    exportMetrics(metrics);
    toast.success('Metrics exported successfully');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-card border border-border">
      {/* Left - Date controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {presets.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from ? (
                <>
                  {format(dateRange.from, "MMM dd")}
                  {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                </>
              ) : (
                "Pick dates"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>
      
      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportReport} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Full Report (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportTrades} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" />
              Trade History (CSV)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportMetrics} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" />
              Metrics Only (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 gap-2"
          asChild
        >
          <a href="https://alpha.deriverse.io" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Trade
          </a>
        </Button>
      </div>
    </div>
  );
}
