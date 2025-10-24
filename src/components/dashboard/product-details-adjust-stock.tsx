
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductVariant } from '@/lib/types';
import { Move } from 'lucide-react';

type AdjustmentType = 'Manual Adjustment' | 'Initial Stock' | 'Damage' | 'Return';

const mockLocations = ['Main Warehouse', 'Downtown Store']; // In a real app, this would come from a service/API

export function ProductDetailsAdjustStock({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.hasVariants ? null : product.variants[0]?.id);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('Manual Adjustment');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const handleAdjustStock = () => {
    if (!selectedVariantId) {
        toast({
            variant: 'destructive',
            title: 'No variant selected',
            description: 'Please select a variant to adjust stock for.',
        });
        return;
    }
    if (!selectedLocation) {
        toast({
            variant: 'destructive',
            title: 'No location selected',
            description: 'Please select a location.',
        });
        return;
    }
    if (quantity === 0) {
        toast({
            variant: 'destructive',
            title: 'No quantity entered',
            description: 'Please enter a quantity to adjust.',
        });
        return;
    }
    
    // Logic to update the product state would go here.
    // This is a simulation, in a real app you'd dispatch an action or call an API.
    console.log({
        variantId: selectedVariantId,
        location: selectedLocation,
        type: adjustmentType,
        quantity,
        reason,
    });
    
    toast({
        title: 'Stock Adjusted',
        description: `Successfully adjusted stock for the selected variant at ${selectedLocation}.`,
    });
    
    // Reset form and close dialog
    setIsOpen(false);
    setSelectedVariantId(product.hasVariants ? null : product.variants[0]?.id);
    setSelectedLocation(null);
    setAdjustmentType('Manual Adjustment');
    setQuantity(0);
    setReason('');
  };

  const getVariantName = (variant: ProductVariant) => {
    if (!product.hasVariants) return product.name;
    return Object.values(variant.optionValues).join(' / ');
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Move className="mr-2 h-4 w-4" /> Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Manually change stock levels for a specific location.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {product.hasVariants && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variant" className="text-right">
                Variant
              </Label>
              <Select onValueChange={setSelectedVariantId} value={selectedVariantId || undefined}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a variant" />
                </SelectTrigger>
                <SelectContent>
                    {product.variants.map(v => (
                        <SelectItem key={v.id} value={v.id}>{getVariantName(v)}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
                Location
            </Label>
            <Select onValueChange={setSelectedLocation} value={selectedLocation || undefined}>
                <SelectTrigger id="location" className="col-span-3">
                    <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                    {mockLocations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="adjustmentType" className="text-right">
              Type
            </Label>
            <Select onValueChange={(v) => setAdjustmentType(v as AdjustmentType)} defaultValue="Manual Adjustment">
                <SelectTrigger id="adjustmentType" className="col-span-3">
                    <SelectValue placeholder="Select adjustment type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Manual Adjustment">Manual Adjustment</SelectItem>
                    <SelectItem value="Initial Stock">Initial Stock</SelectItem>
                    <SelectItem value="Damage">Count as Damaged</SelectItem>
                    <SelectItem value="Return">Process Return</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="col-span-3"
              placeholder='e.g. 10 or -5'
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="(Optional)"
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleAdjustStock}>Save Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
