
'use client';
import { ArrowLeft, PlusCircle, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import type { Customer, Product } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AddOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

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
            <Button>
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
                        <TableRow>
                            <TableCell>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => <SelectItem key={p.sku} value={p.sku || ''}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Input type="number" defaultValue="1" className="w-20" />
                            </TableCell>
                             <TableCell>KES 35,000</TableCell>
                            <TableCell>KES 35,000</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Button variant="outline" className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add Item
                </Button>
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
                        <Select>
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
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select defaultValue="cod">
                            <SelectTrigger id="paymentMethod">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cod">Cash on Delivery</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="orderStatus">Order Status</Label>
                        <Select defaultValue="pending">
                            <SelectTrigger id="orderStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
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
