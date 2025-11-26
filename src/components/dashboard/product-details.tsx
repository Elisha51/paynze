'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductDetailsOverview } from './product-details-overview';
import { ProductDetailsInventory } from './product-details-inventory';
import { addDays } from 'date-fns';
import { DateRangePicker } from '../ui/date-range-picker';
import type { DateRange } from 'react-day-picker';

export function ProductDetails({ product }: { product: Product }) {
  const inventoryIsTracked = product.inventoryTracking !== "Don't Track";
  const [activeTab, setActiveTab] = useState('overview');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
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

          {activeTab === 'inventory' && inventoryIsTracked && (
            <DateRangePicker date={date} setDate={setDate} />
          )}
        </div>
        <TabsContent value="overview">
          <ProductDetailsOverview product={product} />
        </TabsContent>
        <TabsContent value="inventory">
          <ProductDetailsInventory product={product} dateRange={date} />
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
