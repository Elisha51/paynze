
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
import type { Product, ProductVariant, StockAdjustment } from '@/lib/types';
import { Move, ShieldAlert, BookLock, ArrowRightLeft, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { updateProduct } from '@/services/products';
import { ScrollArea } from '../ui/scroll-area';

type AdjustmentAction = StockAdjustment['type'] | 'Transfer';
const addReasons = ['Supplier Shipment', 'Stock Take Correction', 'Return Processing', 'Other'];
const damageReasons = ['Warehouse Damage', 'Expired Goods', 'Customer Return (Damaged)', 'Other'];
const reserveReasons = ['Manual Order Hold', 'Quality Inspection', 'Photoshoot Sample', 'Other'];
const transferReasons = ['Restock retail store', 'Fulfilling large order', 'Other'];

const mockLocations = ['Main Warehouse', 'Downtown Store']; 

export function ProductDetailsAdjustStock({ product, onStockUpdate }: { product: Product, onStockUpdate: (updatedProduct: Product) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(product.hasVariants ? null : product.variants[0]?.id);
  const [fromLocation, setFromLocation] = useState<string | null>(null);
  const [toLocation, setToLocation] = useState<string | null>(null);
  const [action, setAction] = useState<AdjustmentAction>('Initial Stock');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const { toast } = useToast();

  const handleAdjustStock = async () => {
    if (!selectedVariantId || quantity <= 0) {
      toast({ variant: 'destructive', title: 'Please select a variant and enter a quantity.' });
      return;
    }
    
    if(action === 'Transfer') {
      if (!fromLocation || !toLocation || fromLocation === toLocation) {
        toast({ variant: 'destructive', title: 'Please select two different locations for a transfer.' });
        return;
      }
    } else {
      if (!fromLocation) {
        toast({ variant: 'destructive', title: 'Please select a location.' });
        return;
      }
    }

    const finalReason = reason === 'Other' ? otherReason : reason;

    const updatedProduct = { ...product };
    const variantIndex = updatedProduct.variants.findIndex(v => v.id === selectedVariantId);
    if (variantIndex === -1) return;

    const variant = { ...updatedProduct.variants[variantIndex] };
    
    // Logic for Transfer
    if (action === 'Transfer') {
        const fromLocIndex = variant.stockByLocation.findIndex(l => l.locationName === fromLocation);
        const toLocIndex = variant.stockByLocation.findIndex(l => l.locationName === toLocation);
        
        if (fromLocIndex === -1) {
            toast({ variant: 'destructive', title: `No stock recorded at ${fromLocation}.`});
            return;
        }
        
        const fromStock = { ...variant.stockByLocation[fromLocIndex].stock };
        if(fromStock.available < quantity) {
            toast({ variant: 'destructive', title: 'Not enough available stock to transfer.' });
            return;
        }
        
        fromStock.onHand -= quantity;
        fromStock.available -= quantity;
        variant.stockByLocation[fromLocIndex] = { ...variant.stockByLocation[fromLocIndex], stock: fromStock };

        if (toLocIndex === -1) {
            variant.stockByLocation.push({ locationName: toLocation!, stock: { ...fromStock, onHand: quantity, available: quantity, reserved: 0, damaged: 0, sold: 0 } });
        } else {
            const toStock = { ...variant.stockByLocation[toLocIndex].stock };
            toStock.onHand += quantity;
            toStock.available += quantity;
            variant.stockByLocation[toLocIndex] = { ...variant.stockByLocation[toLocIndex], stock: toStock };
        }
    } else {
      // Logic for other actions
      const locIndex = variant.stockByLocation.findIndex(l => l.locationName === fromLocation);
      if (locIndex === -1) {
        variant.stockByLocation.push({ locationName: fromLocation!, stock: { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 } });
      }
      const stock = variant.stockByLocation.find(l => l.locationName === fromLocation)!.stock;
      
      switch(action) {
          case 'Initial Stock':
              stock.onHand += quantity;
              stock.available += quantity;
              break;
          case 'Damage':
              if (stock.available < quantity) {
                  toast({ variant: 'destructive', title: 'Not enough available stock to mark as damaged.' });
                  return;
              }
              stock.available -= quantity;
              stock.damaged += quantity;
              break;
          case 'Reserve':
              if (stock.available < quantity) {
                  toast({ variant: 'destructive', title: 'Not enough available stock to reserve.' });
                  return;
              }
              stock.available -= quantity;
              stock.reserved += quantity;
              break;
          case 'Un-reserve':
              if (stock.reserved < quantity) {
                  toast({ variant: 'destructive', title: 'Not enough reserved stock to un-reserve.' });
                  return;
              }
              stock.reserved -= quantity;
              stock.available += quantity;
              break;
          default: break;
      }
    }

    if (!variant.stockAdjustments) variant.stockAdjustments = [];
    variant.stockAdjustments.push({
        id: `adj-${Date.now()}`,
        date: new Date().toISOString(),
        type: action,
        quantity: action === 'Initial Stock' || action === 'Un-reserve' ? quantity : -quantity,
        reason: finalReason,
        channel: 'Manual',
        details: action === 'Transfer' ? `From ${fromLocation} to ${toLocation}` : `At ${fromLocation}`
    });
    
    updatedProduct.variants[variantIndex] = variant;

    await updateProduct(updatedProduct);
    onStockUpdate(updatedProduct);
    
    toast({
        title: 'Stock Adjusted',
        description: `Successfully performed action: ${action}.`,
    });
    
    setIsOpen(false);
    // Reset form state upon closing
    setTimeout(() => {
        setSelectedVariantId(product.hasVariants ? null : product.variants[0]?.id);
        setFromLocation(null);
        setToLocation(null);
        setAction('Initial Stock');
        setQuantity(0);
        setReason('');
        setOtherReason('');
    }, 300);
  };

  const getVariantName = (variant: ProductVariant) => {
    if (!product.hasVariants) return product.name;
    return Object.values(variant.optionValues).join(' / ');
  }
  
  const getReasonsForAction = () => {
      switch(action) {
          case 'Initial Stock': return addReasons;
          case 'Damage': return damageReasons;
          case 'Reserve':
          case 'Un-reserve':
              return reserveReasons;
          case 'Transfer': return transferReasons;
          default: return [];
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Move className="mr-2 h-4 w-4" /> Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Manually change stock levels, statuses, or transfer between locations.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-6 py-4 px-6">
            <div className="space-y-3">
                <Label>Action</Label>
                <RadioGroup value={action} onValueChange={(v) => { setAction(v as AdjustmentAction); setReason(''); }} className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                   <Label htmlFor="action-add" className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer", action === 'Initial Stock' && "border-primary")}>
                      <RadioGroupItem value="Initial Stock" id="action-add" className="sr-only" />
                      <PlusCircle className="mb-2 h-5 w-5 text-green-600" />
                      <span className="text-xs text-center">Add Stock</span>
                  </Label>
                   <Label htmlFor="action-transfer" className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer", action === 'Transfer' && "border-primary")}>
                      <RadioGroupItem value="Transfer" id="action-transfer" className="sr-only" />
                      <ArrowRightLeft className="mb-2 h-5 w-5 text-indigo-600" />
                      <span className="text-xs text-center">Transfer</span>
                  </Label>
                  <Label htmlFor="action-reserve" className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer", action === 'Reserve' && "border-primary")}>
                      <RadioGroupItem value="Reserve" id="action-reserve" className="sr-only" />
                      <BookLock className="mb-2 h-5 w-5 text-orange-600" />
                      <span className="text-xs text-center">Reserve</span>
                  </Label>
                   <Label htmlFor="action-unreserve" className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer", action === 'Un-reserve' && "border-primary")}>
                      <RadioGroupItem value="Un-reserve" id="action-unreserve" className="sr-only" />
                      <BookLock className="mb-2 h-5 w-5 text-blue-600" />
                      <span className="text-xs text-center">Un-reserve</span>
                  </Label>
                  <Label htmlFor="action-damage" className={cn("flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer", action === 'Damage' && "border-primary")}>
                      <RadioGroupItem value="Damage" id="action-damage" className="sr-only" />
                      <ShieldAlert className="mb-2 h-5 w-5 text-red-600" />
                      <span className="text-xs text-center">Mark Damaged</span>
                  </Label>
              </RadioGroup>
            </div>
            
             <div className="space-y-2">
                  <Label htmlFor="variant">Product / Variant</Label>
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

            {action === 'Transfer' ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="fromLocation">From Location</Label>
                      <Select onValueChange={setFromLocation} value={fromLocation || undefined}>
                          <SelectTrigger id="fromLocation"><SelectValue placeholder="Select location" /></SelectTrigger>
                          <SelectContent>{mockLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="toLocation">To Location</Label>
                      <Select onValueChange={setToLocation} value={toLocation || undefined}>
                          <SelectTrigger id="toLocation"><SelectValue placeholder="Select location" /></SelectTrigger>
                          <SelectContent>{mockLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                      </Select>
                  </div>
               </div>
            ) : (
              <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select onValueChange={setFromLocation} value={fromLocation || undefined}>
                      <SelectTrigger id="location"><SelectValue placeholder="Select a location" /></SelectTrigger>
                      <SelectContent>{mockLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
                  </Select>
              </div>
            )}


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" value={quantity || ''} onChange={(e) => setQuantity(Number(e.target.value))} placeholder='e.g., 10' />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select onValueChange={setReason} value={reason}>
                      <SelectTrigger id="reason"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                      <SelectContent>{getReasonsForAction().map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
              </div>
            </div>

            {reason === 'Other' && (
               <div className="space-y-2">
                  <Label htmlFor="otherReason">Additional Details</Label>
                  <Textarea id="otherReason" value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder="Provide more context for this adjustment..." />
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 pb-6 pt-0">
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleAdjustStock}>Save Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
