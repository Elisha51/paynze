
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
import { getSuppliers } from '@/services/procurement';
import { getProducts } from '@/services/products';
import type { Supplier, Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function AddPurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderDate, setOrderDate] = useState<Date>();
  const [deliveryDate, setDeliveryDate] = useState<Date>();

  useEffect(() => {
    async function fetchData() {
        const [supplierData, productData] = await Promise.all([
            getSuppliers(),
            getProducts()
        ]);
        setSuppliers(supplierData);
        setProducts(productData);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/procurement">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Purchase Order</h1>
          <p className="text-muted-foreground text-sm">Draft a new order to send to a supplier.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save PO
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="supplier" className="text-base">Select a supplier to begin</Label>
                        <Select>
                            <SelectTrigger id="supplier">
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
          <Card>
            <CardHeader>
              <CardTitle>Items to Order</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Cost Per Item</TableHead>
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
                                <Input type="number" defaultValue="10" className="w-20" />
                            </TableCell>
                             <TableCell>
                                <Input type="number" defaultValue="25000" className="w-28" />
                            </TableCell>
                            <TableCell>KES 250,000</TableCell>
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
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="poStatus">PO Status</Label>
                        <Select defaultValue="draft">
                            <SelectTrigger id="poStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className='space-y-2'>
                        <Label>Order Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !orderDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={orderDate} onSelect={setOrderDate} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className='space-y-2'>
                        <Label>Expected Delivery Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !deliveryDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
