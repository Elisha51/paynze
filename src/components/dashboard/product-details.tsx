'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductDetailsOverview } from './product-details-overview';
import { ProductDetailsInventory } from './product-details-inventory';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';

export function ProductDetails({ product }: { product: Product }) {
  const inventoryIsTracked = product.inventoryTracking !== "Don't Track";
  const [activeTab, setActiveTab] = useState('overview');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'today':
        setDate({ from: now, to: now });
        break;
      case 'last-7':
        setDate({ from: addDays(now, -6), to: now });
        break;
      case 'last-30':
        setDate({ from: addDays(now, -29), to: now });
        break;
      case 'ytd':
        setDate({ from: new Date(now.getFullYear(), 0, 1), to: now });
        break;
      default:
        setDate(undefined);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div tabIndex={inventoryIsTracked ? 0 : -1}>
                      <TabsTrigger value="inventory" disabled={!inventoryIsTracked} className="disabled:cursor-not-allowed">
                        Inventory
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  {!inventoryIsTracked && (
                    <TooltipContent>
                      <p>Enable inventory tracking to view details.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TabsList>
          </Tabs>

          {inventoryIsTracked && (
            <div className="flex w-full sm:w-auto items-center gap-2">
                <Select onValueChange={handlePresetChange} defaultValue="last-30">
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last-7">Last 7 days</SelectItem>
                        <SelectItem value="last-30">Last 30 days</SelectItem>
                        <SelectItem value="ytd">Year to date</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full sm:w-[260px] h-9 justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
          )}
        </div>
        <TabsContent value="overview">
          <ProductDetailsOverview product={product} />
        </TabsContent>
        <TabsContent value="inventory">
          <ProductDetailsInventory product={product} dateRange={date} />
        </TabsContent>
    </TooltipProvider>
  );
}
