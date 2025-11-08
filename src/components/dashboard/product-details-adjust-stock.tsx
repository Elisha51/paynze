
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
import { Move, MinusCircle, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

type AdjustmentAction = 'add' | 'remove';
const addReasons = ['Supplier Shipment', 'Stock Take Correction', 'Return Processing', 'Other'];
const removeReasons = ['Damaged Goods', 'Stock Take Correction', 'Promotion/Giveaway', 'Loss/Theft', 'Other'];

const mockLocations = ['Main Warehouse', 'Downtown Store']; 

export function ProductDetailsAdjustStock({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.hasVariants ? null : product.variants[0]?.id);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [action, setAction] = useState<AdjustmentAction>('add');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const { toast } = useToast();

  const handleAdjustStock = () => {
    if (!selectedVariantId || !selectedLocation || quantity <= 0 || !reason) {
      toast({
        variant: 'destructive',
        title: 'Please fill all required fields.',
        description: 'You must select a variant, location, quantity, and reason.',
      });
      return;
    }

    const finalQuantity = action === 'add' ? quantity : -quantity;
    const finalReason = reason === 'Other' ? otherReason : reason;

    console.log({
        variantId: selectedVariantId,
        location: selectedLocation,
        action,
        quantity: finalQuantity,
        reason: finalReason,
    });
    
    toast({
        title: 'Stock Adjusted',
        description: `Successfully adjusted stock by ${finalQuantity} for the selected variant at ${selectedLocation}.`,
    });
    
    setIsOpen(false);
    // Reset form state upon closing
    setTimeout(() => {
        setSelectedVariantId(product.hasVariants ? null : product.variants[0]?.id);
        setSelectedLocation(null);
        setAction('add');
        setQuantity(0);
        setReason('');
        setOtherReason('');
    }, 300);
  };

  const getVariantName = (variant: ProductVariant) => {
    if (!product.hasVariants) return product.name;
    return Object.values(variant.optionValues).join(' / ');
  }
  
  const reasonsForAction = action === 'add' ? addReasons : removeReasons;

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
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.hasVariants && (
                <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <Select onValueChange={setSelectedVariantId} value={selectedVariantId || undefined}>
                    <SelectTrigger id="variant">
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
             <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select onValueChange={setSelectedLocation} value={selectedLocation || undefined}>
                    <SelectTrigger id="location">
                        <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockLocations.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-3">
              <Label>Action</Label>
              <RadioGroup value={action} onValueChange={(v) => setAction(v as AdjustmentAction)} className="grid grid-cols-2 gap-4">
                <div>
                    <RadioGroupItem value="add" id="action-add" className="peer sr-only" />
                    <Label htmlFor="action-add" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500">
                        <PlusCircle className="mb-2 h-6 w-6 text-green-600" />
                        Add to Stock
                    </Label>
                </div>
                 <div>
                    <RadioGroupItem value="remove" id="action-remove" className="peer sr-only" />
                    <Label htmlFor="action-remove" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500">
                         <MinusCircle className="mb-2 h-6 w-6 text-red-600" />
                        Remove from Stock
                    </Label>
                </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder='e.g., 10'
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select onValueChange={setReason} value={reason}>
                    <SelectTrigger id="reason">
                        <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                        {reasonsForAction.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          {reason === 'Other' && (
             <div className="space-y-2">
                <Label htmlFor="otherReason">Additional Details</Label>
                <Textarea 
                    id="otherReason" 
                    value={otherReason} 
                    onChange={(e) => setOtherReason(e.target.value)} 
                    placeholder="Provide more context for this adjustment..."
                />
            </div>
          )}
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
