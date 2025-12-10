
'use client';
import { Save, PlusCircle, Trash2, Check, ChevronsUpDown } from 'lucide-react';
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
import type { PurchaseOrderItem, Product, Supplier, OnboardingFormData } from '@/lib/types';
import { getProducts } from '@/services/products';
import { getSuppliers } from '@/services/procurement';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { addPurchaseOrder } from '@/services/procurement';

export default function AddPurchaseOrderPage() {
    const [supplierId, setSupplierId] = useState('');
    const [orderDate, setOrderDate] = useState<Date>(new Date());
    const [expectedDelivery, setExpectedDelivery] = useState<Date>();
    const [items, setItems] = useState<PurchaseOrderItem[]>([{ productId: '', productName: '', quantity: 1, cost: 0 }]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const router = useRouter();
    const { toast } = useToast();

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
        const selectedSupplier = suppliers.find(s => s.id === supplierId);
        if (!selectedSupplier) {
            toast({ variant: 'destructive', title: 'Please select a supplier.' });
            return;
        }

        const newPO = {
            supplierId: selectedSupplier.id,
            supplierName: selectedSupplier.name,
            status: 'Draft',
            items: items.filter(i => i.productId), // only include items with a selected product
            orderDate: format(orderDate, 'yyyy-MM-dd'),
            expectedDelivery: expectedDelivery ? format(expectedDelivery, 'yyyy-MM-dd') : '',
            totalCost: total,
            currency: currency,
        };

        await addPurchaseOrder(newPO);
        toast({ title: "Purchase Order Created", description: "The new PO has been saved as a draft." });
        router.push('/dashboard/procurement?tab=purchase-orders');
    }
    
    const cta = (
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
        </Button>
    );
    
    const selectedSupplier = suppliers.find(s => s.id === supplierId);

    return (
        <DashboardPageLayout title="Create Purchase Order" cta={cta} backHref="/dashboard/procurement?tab=purchase-orders">
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
                                                        onSelect={() => setSupplierId(s.id)}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", supplierId === s.id ? "opacity-100" : "opacity-0")} />
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
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !orderDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {orderDate ? format(orderDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={orderDate} onSelect={setOrderDate} /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Expected Delivery Date</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expectedDelivery && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {expectedDelivery ? format(expectedDelivery, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={expectedDelivery} onSelect={setExpectedDelivery} /></PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                     </Card>
                </div>
            </div>
        </DashboardPageLayout>
    )
}
