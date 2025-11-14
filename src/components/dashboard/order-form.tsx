
'use client';
import { Save, PlusCircle, Trash2, ArrowLeft, PackageSearch } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Order, Product, Customer, OnboardingFormData, ProductVariant } from '@/lib/types';
import { getProducts } from '@/services/products';
import { getCustomers } from '@/services/customers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';

type OrderItemForm = {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku: string;
    variantId?: string;
    variantName?: string;
};

const emptyOrder: Partial<Order> = {
    channel: 'Manual',
    status: 'Awaiting Payment',
    fulfillmentMethod: 'Delivery',
    payment: {
        method: 'Cash on Delivery',
        status: 'pending'
    }
}

const ProductSelectionDialog = ({ products, onSelect }: { products: Product[], onSelect: (product: Product, variant?: ProductVariant) => void }) => {
    
    type ProductRow = Product & { variant?: ProductVariant };

    const productRows = useMemo(() => {
        return products.flatMap(p => {
            if (p.hasVariants && p.variants.length > 1) {
                return p.variants.map(v => ({ ...p, variant: v }));
            }
            return [{ ...p }];
        });
    }, [products]);

    const columns: ColumnDef<ProductRow>[] = [
        {
            accessorKey: 'name',
            header: 'Product',
            cell: ({ row }) => {
                const product = row.original;
                const variantName = product.variant ? Object.values(product.variant.optionValues).join(' / ') : '';
                return (
                    <div>
                        <p className="font-medium">{product.name}</p>
                        {variantName && <p className="text-xs text-muted-foreground">{variantName}</p>}
                    </div>
                )
            }
        },
        {
            accessorKey: 'retailPrice',
            header: 'Price',
            cell: ({ row }) => {
                const price = row.original.variant?.price || row.original.retailPrice;
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(price);
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button size="sm" onClick={() => onSelect(row.original, row.original.variant)}>Select</Button>
            ),
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Select a Product</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <DataTable 
                        columns={columns}
                        data={productRows}
                        isLoading={products.length === 0}
                        emptyState={{
                            icon: PackageSearch,
                            title: "No Products Found",
                            description: "There are no products available to add."
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}


export function OrderForm({ initialOrder }: { initialOrder?: Order | null }) {
    const [order, setOrder] = useState<Partial<Order>>(initialOrder || emptyOrder);
    const [items, setItems] = useState<OrderItemForm[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const isEditing = !!initialOrder;

    useEffect(() => {
        async function loadData() {
            const [productsData, customersData, settingsData] = await Promise.all([
              getProducts(),
              getCustomers(),
              localStorage.getItem('onboardingData')
            ]);
            setProducts(productsData.filter(p => p.status === 'published'));
            setCustomers(customersData);
            if (settingsData) {
                setSettings(JSON.parse(settingsData));
            }
        }
        loadData();
        
        if (initialOrder) {
            setOrder(initialOrder);
            setItems(initialOrder.items.map(item => ({
                productId: item.sku, // This might need adjustment if SKU is not the primary ID
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                sku: item.sku
            })));
        } else {
            setItems([]);
        }
    }, [initialOrder]);
    
    const currency = order.currency || settings?.currency || 'UGX';
    
    const handleItemChange = (index: number, field: 'quantity' | 'price', value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    }

    const handleProductSelect = (product: Product, variant?: ProductVariant) => {
        const newItem: OrderItemForm = {
            productId: product.sku || '',
            name: product.name,
            quantity: 1,
            price: variant?.price || product.retailPrice,
            sku: variant?.sku || product.sku || '',
            variantId: variant?.id,
            variantName: variant ? Object.values(variant.optionValues).join(' / ') : undefined,
        };
        setItems(prev => [...prev, newItem]);
    };
    
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const total = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);

    const handleSave = () => {
        // In a real app, this would be a service call to addOrder or updateOrder
        console.log("Saving order", { ...order, items, total });
        toast({ title: `Order ${isEditing ? 'Updated' : 'Created'}`, description: "The order has been saved." });
        router.push(isEditing ? `/dashboard/orders/${order.id}` : '/dashboard/orders');
    }
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-end gap-2 p-2 border rounded-md">
                                    <div className="flex-1 space-y-2">
                                        <Label>Product</Label>
                                        <div className="p-2 bg-muted rounded-md text-sm">
                                            <p className="font-medium">{item.name}</p>
                                            {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2 w-24">
                                        <Label>Quantity</Label>
                                        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} placeholder="1" />
                                    </div>
                                    <div className="space-y-2 w-32">
                                        <Label>Price</Label>
                                        <Input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))} placeholder="0.00" />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                             <ProductSelectionDialog products={products} onSelect={handleProductSelect} />
                        </CardContent>
                        <CardFooter className="flex justify-end font-bold text-lg">
                            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
                        <CardContent>
                             <Select value={order.customerId} onValueChange={(v) => setOrder(p => ({...p, customerId: v}))}>
                                <SelectTrigger><SelectValue placeholder="Select an existing customer..."/></SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button variant="link" className="p-0 h-auto mt-2">Or create new customer</Button>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                         <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fulfillment Method</Label>
                                <Select value={order.fulfillmentMethod} onValueChange={(v) => setOrder(p => ({...p, fulfillmentMethod: v as Order['fulfillmentMethod']}))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Delivery">Delivery</SelectItem>
                                        <SelectItem value="Pickup">Pickup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={order.payment?.method} onValueChange={(v) => setOrder(p => ({...p, payment: { ...p.payment!, method: v as Order['payment']['method']} }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                     </Card>
                </div>
            </div>
             <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Order
                </Button>
            </div>
        </div>
    )
}
