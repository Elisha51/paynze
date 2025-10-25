
'use client';
import { ArrowLeft, PlusCircle, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCustomers } from '@/services/customers';
import { getProducts } from '@/services/products';
import { addOrder } from '@/services/orders';
import type { Customer, Product, OrderItem, Order } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

type NewOrderItem = Partial<OrderItem> & { id: number };

export default function AddOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<NewOrderItem[]>([{ id: Date.now(), quantity: 1 }]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Cash on Delivery');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<Order['fulfillmentMethod']>('Delivery');
  const [orderStatus, setOrderStatus] = useState<Order['status']>('Awaiting Payment');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    async function fetchData() {
        const [customerData, productData] = await Promise.all([
            getCustomers(),
            getProducts()
        ]);
        setCustomers(customerData);
        setProducts(productData);
    }
    fetchData();
  }, []);
  
  const handleItemChange = (itemId: number, field: keyof OrderItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
        if (item.id === itemId) {
            const updatedItem = { ...item, [field]: value };
            if (field === 'sku') {
                const product = products.find(p => p.sku === value);
                if (product) {
                    updatedItem.name = product.name;
                    updatedItem.price = product.retailPrice;
                }
            }
            return updatedItem;
        }
        return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), quantity: 1 }]);
  };

  const removeItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const tax = subtotal * 0.18; // Example tax rate
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    const currency = products.find(p => p.sku === items[0]?.sku)?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const handleSaveOrder = async () => {
    if (!selectedCustomerId) {
        toast({ variant: 'destructive', title: 'Please select a customer.' });
        return;
    }
    if (items.some(item => !item.sku || !item.quantity || !item.price)) {
        toast({ variant: 'destructive', title: 'All order items must be complete.' });
        return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      toast({ variant: 'destructive', title: 'Customer not found.' });
      return;
    }

    setIsLoading(true);

    const newOrder: Omit<Order, 'id'> = {
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      date: format(new Date(), 'yyyy-MM-dd'),
      status: orderStatus,
      fulfillmentMethod: fulfillmentMethod,
      channel: 'Manual',
      items: items as OrderItem[],
      total,
      currency: products.find(p => p.sku === items[0]?.sku)?.currency || 'UGX',
      shippingAddress: { // Mock address, can be improved
          street: '123 Customer Lane',
          city: 'Kampala',
          postalCode: '12345',
          country: 'Uganda',
      },
      paymentMethod,
      paymentStatus: orderStatus === 'Paid' ? 'Paid' : 'Unpaid',
      shippingCost: 0, // Mock data
      taxes: tax,
    };
    
    try {
        await addOrder(newOrder);
        toast({ title: 'Order Created', description: 'The new order has been saved successfully.' });
        router.push('/dashboard/orders');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the new order.' });
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
          <p className="text-muted-foreground text-sm">Manually create an order for a customer.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSaveOrder} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Order'}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Select onValueChange={(v) => handleItemChange(item.id, 'sku', v)} value={item.sku}>
                                        <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => <SelectItem key={p.sku} value={p.sku || ''}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input 
                                      type="number" 
                                      value={item.quantity} 
                                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} 
                                      className="w-20" 
                                      min="1"
                                    />
                                </TableCell>
                                <TableCell>{item.price ? formatCurrency(item.price) : '-'}</TableCell>
                                <TableCell>{item.price && item.quantity ? formatCurrency(item.price * item.quantity) : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button variant="outline" className="mt-4" onClick={addItem}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Item
                </Button>
                <Separator className="my-4" />
                <div className="w-full sm:w-1/2 ml-auto space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes (18%)</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="customer">Select Customer</Label>
                        <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                            <SelectTrigger id="customer">
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className='space-y-2'>
                        <Label htmlFor="fulfillmentMethod">Fulfillment Method</Label>
                        <Select value={fulfillmentMethod} onValueChange={(v: Order['fulfillmentMethod']) => setFulfillmentMethod(v)}>
                            <SelectTrigger id="fulfillmentMethod">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Delivery">Delivery</SelectItem>
                                <SelectItem value="Pickup">Pickup</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={(v: Order['paymentMethod']) => setPaymentMethod(v)}>
                            <SelectTrigger id="paymentMethod">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="orderStatus">Order Status</Label>
                        <Select value={orderStatus} onValueChange={(v: Order['status']) => setOrderStatus(v)}>
                            <SelectTrigger id="orderStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="Awaiting Payment">Awaiting Payment</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Picked Up">Picked Up</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
