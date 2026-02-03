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
import { CalendarIcon, RefreshCw } from "lucide-react";
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

export function DashboardHeader({ 
  dateRange, 
  onDateRangeChange, 
  onRefresh, 
  isLoading,
}: DashboardHeaderProps) {
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
          <div className="flex items-center gap-3 flex-shrink-0">
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
          
          {/* Right - Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

// Export presets for use in toolbar
export { presets };
