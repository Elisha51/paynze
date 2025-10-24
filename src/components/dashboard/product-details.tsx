

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductDetailsOverview } from './product-details-overview';
import { ProductDetailsInventory } from './product-details-inventory';

export function ProductDetails({ product }: { product: Product }) {
  const inventoryIsTracked = product.inventoryTracking !== "Don't Track";

  return (
    <TooltipProvider>
      <Tabs defaultValue="overview">
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
                <p>Enable inventory tracking for this product to view its inventory details.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TabsList>
        <TabsContent value="overview">
          <ProductDetailsOverview product={product} />
        </TabsContent>
        <TabsContent value="inventory">
          <ProductDetailsInventory product={product} />
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
