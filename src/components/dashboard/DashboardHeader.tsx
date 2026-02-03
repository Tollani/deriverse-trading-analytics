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
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon, Download, RefreshCw, Bell, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { WalletButton } from "./WalletButton";
import deriverselogo from "@/assets/deriverse-logo.png";

interface DashboardHeaderProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const presets = [
  { label: "Last 7 days", value: "7d", getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", value: "30d", getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This month", value: "mtd", getRange: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", value: "lm", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "Last 3 months", value: "3m", getRange: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "All time", value: "all", getRange: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
];

export function DashboardHeader({ dateRange, onDateRangeChange, onRefresh, isLoading }: DashboardHeaderProps) {
  const [preset, setPreset] = useState("30d");
  
  const handlePresetChange = (value: string) => {
    setPreset(value);
    const selectedPreset = presets.find(p => p.value === value);
    if (selectedPreset) {
      onDateRangeChange(selectedPreset.getRange());
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={deriverselogo} 
              alt="Deriverse" 
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Deriverse</h1>
              <p className="text-xs text-muted-foreground">Trading Analytics</p>
            </div>
          </div>
          
          {/* Center - Date controls */}
          <div className="hidden md:flex items-center gap-2">
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-[140px] h-9">
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
              <PopoverContent className="w-auto p-0" align="center">
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
            <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex">
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 hidden sm:flex"
              asChild
            >
              <a href="https://alpha.deriverse.io" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Trade
              </a>
            </Button>
            
            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
