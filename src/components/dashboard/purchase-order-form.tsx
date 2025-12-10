
'use client';
import { Save, PlusCircle, Trash2, Check, ChevronsUpDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { PurchaseOrderItem, Product, Supplier, OnboardingFormData, PurchaseOrder } from '@/lib/types';
import { getProducts } from '@/services/products';
import { getSuppliers } from '@/services/procurement';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { addPurchaseOrder, updatePurchaseOrder } from '@/services/procurement';

const emptyPO: Partial<PurchaseOrder> = {
  status: 'Draft',
  items: [{ productId: '', productName: '', quantity: 1, cost: 0 }],
  orderDate: new Date().toISOString(),
}

export function PurchaseOrderForm({ initialPurchaseOrder }: { initialPurchaseOrder?: PurchaseOrder | null }) {
    const [po, setPo] = useState<Partial<PurchaseOrder>>(initialPurchaseOrder || emptyPO);
    const [items, setItems] = useState<PurchaseOrderItem[]>(initialPurchaseOrder?.items || [{ productId: '', productName: '', quantity: 1, cost: 0 }]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const isEditing = !!initialPurchaseOrder;

    useEffect(() => {
        async function loadData() {
            const [productsData, suppliersData, settingsData] = await Promise.all([
                getProducts(), 
                getSuppliers(),
                localStorage.getItem('onboardingData')
            ]);
            setProducts(productsData);
            setSuppliers(suppliersData);
            if (settingsData) {
                setSettings(JSON.parse(settingsData));
            }
        }
        loadData();
    }, []);

    const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        if (field === 'productId') {
            const product = products.find(p => p.sku === value);
            currentItem.cost = product?.costPerItem || 0;
            currentItem.productId = value as string;
            currentItem.productName = product?.name || '';
        } else {
            (currentItem as any)[field] = value;
        }
        newItems[index] = currentItem;
        setItems(newItems);
    }
    
    const addItem = () => setItems([...items, { productId: '', productName: '', quantity: 1, cost: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const total = items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    const currency = settings?.currency || 'UGX';

    const handleSave = async () => {
        const selectedSupplier = suppliers.find(s => s.id === po.supplierId);
        if (!selectedSupplier) {
            toast({ variant: 'destructive', title: 'Please select a supplier.' });
            return;
        }

        const finalPO = {
            ...po,
            supplierName: selectedSupplier.name,
            items: items.filter(i => i.productId),
            totalCost: total,
            currency: currency,
        };

        if (isEditing && finalPO.id) {
            await updatePurchaseOrder(finalPO.id, finalPO);
            toast({ title: "Purchase Order Updated", description: "Your changes have been saved." });
        } else {
            await addPurchaseOrder(finalPO as Omit<PurchaseOrder, 'id'>);
            toast({ title: "Purchase Order Created", description: "The new PO has been saved as a draft." });
        }
        router.push('/dashboard/procurement?tab=purchase-orders');
    }
    
    const selectedSupplier = suppliers.find(s => s.id === po.supplierId);

    return (
        <>
            <div className="flex justify-end gap-2 mb-6">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save {isEditing ? 'Changes' : 'as Draft'}
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items to Order</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-end gap-2 p-2 border rounded-md">
                                    <div className="flex-1 space-y-2">
                                        <Label>Product</Label>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                                    {item.productName || "Select product..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search products..." />
                                                    <CommandEmpty>No products found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {products.map(product => (
                                                            <CommandItem
                                                                key={product.sku}
                                                                value={product.name}
                                                                onSelect={() => handleItemChange(index, 'productId', product.sku || '')}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", item.productId === product.sku ? "opacity-100" : "opacity-0")} />
                                                                {product.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2 w-24">
                                        <Label>Quantity</Label>
                                        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} placeholder="1" />
                                    </div>
                                    <div className="space-y-2 w-32">
                                        <Label>Cost/{products.find(p => p.sku === item.productId)?.unitOfMeasure || 'unit'}</Label>
                                        <Input type="number" value={item.cost} onChange={(e) => handleItemChange(index, 'cost', Number(e.target.value))} placeholder="0.00" />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                             <Button variant="outline" onClick={addItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                        </CardContent>
                        <CardFooter className="flex justify-end font-bold text-lg">
                            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Supplier</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {selectedSupplier?.name || "Select a supplier..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search suppliers..." />
                                            <CommandEmpty>No suppliers found.</CommandEmpty>
                                            <CommandGroup>
                                                {suppliers.map(s => (
                                                    <CommandItem
                                                        key={s.id}
                                                        value={s.name}
                                                        onSelect={() => setPo(prev => ({...prev, supplierId: s.id}))}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", po.supplierId === s.id ? "opacity-100" : "opacity-0")} />
                                                        {s.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Order Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !po.orderDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {po.orderDate ? format(new Date(po.orderDate), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={po.orderDate ? new Date(po.orderDate) : new Date()} onSelect={(date) => setPo(prev => ({...prev, orderDate: date?.toISOString()}))} /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Expected Delivery Date</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !po.expectedDelivery && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {po.expectedDelivery ? format(new Date(po.expectedDelivery), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={po.expectedDelivery ? new Date(po.expectedDelivery) : undefined} onSelect={(date) => setPo(prev => ({...prev, expectedDelivery: date?.toISOString()}))} /></PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                     </Card>
                </div>
            </div>
        </>
    )
}
