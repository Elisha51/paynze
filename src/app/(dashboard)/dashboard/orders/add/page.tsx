
'use client'
// A simplified form for creating a manual order.
// In a real application, this would be a multi-step process with product selection,
// customer lookup, shipping calculation, etc.
import { ArrowLeft, Save, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Order, Product, Customer } from '@/lib/types';
import { getProducts } from '@/services/products';
import { getCustomers } from '@/services/customers';

type OrderItemForm = {
    productId: string;
    quantity: number;
    price: number;
}

export default function AddOrderPage() {
    const [customer, setCustomer] = useState('');
    const [items, setItems] = useState<OrderItemForm[]>([{ productId: '', quantity: 1, price: 0 }]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            const [productsData, customersData] = await Promise.all([getProducts(), getCustomers()]);
            setProducts(productsData);
            setCustomers(customersData);
        }
        loadData();
    }, []);

    const handleItemChange = (index: number, field: keyof OrderItemForm, value: string | number) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        if (field === 'productId') {
            const product = products.find(p => p.sku === value);
            currentItem.price = product?.retailPrice || 0;
            currentItem.productId = value as string;
        } else {
            (currentItem as any)[field] = value;
        }
        newItems[index] = currentItem;
        setItems(newItems);
    }
    
    const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSave = () => {
        toast({ title: "Order Created", description: "The new manual order has been saved." });
        router.push('/dashboard/orders');
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Manual Order</h1>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Order
                    </Button>
                </div>
            </div>

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
                                         <Select onValueChange={(v) => handleItemChange(index, 'productId', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select product..."/></SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => <SelectItem key={p.sku} value={p.sku}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 w-24">
                                        <Label>Quantity</Label>
                                        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-2 w-32">
                                        <Label>Price</Label>
                                        <Input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))} />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                             <Button variant="outline" onClick={addItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                        </CardContent>
                        <CardFooter className="flex justify-end font-bold text-lg">
                            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(total)}
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
                        <CardContent>
                             <Select onValueChange={setCustomer}>
                                <SelectTrigger><SelectValue placeholder="Select an existing customer..."/></SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button variant="link" className="p-0 h-auto mt-2">Or create new customer</Button>
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    )
}
