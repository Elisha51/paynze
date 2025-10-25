
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, ChevronLeft, Truck } from 'lucide-react';
import Link from 'next/link';
import { getPurchaseOrderById } from '@/services/procurement';
import type { PurchaseOrder } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"

export default function ViewPurchaseOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        async function loadOrder() {
            setLoading(true);
            const fetchedOrder = await getPurchaseOrderById(id);
            setOrder(fetchedOrder || null);
            setLoading(false);
        }
        loadOrder();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }


  if (!order) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Purchase Order not found</h1>
            <p className="text-muted-foreground">The PO you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/procurement">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Procurement
                </Link>
            </Button>
        </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const statusVariant = {
      Draft: 'secondary',
      Sent: 'default',
      Received: 'outline',
      Partial: 'outline',
      Cancelled: 'destructive',
  }[order.status] as "secondary" | "default" | "outline" | "destructive" | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/procurement">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-2xl font-bold tracking-tight">
            PO #{order.id}
        </h1>
        <Badge variant={statusVariant} className="hidden sm:inline-flex">
            {order.status}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
                Mark as Received
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit PO</DropdownMenuItem>
                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Cancel PO</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Cost per Item</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.cost, order.currency)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.cost * item.quantity, order.currency)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-semibold text-lg">Grand Total</TableCell>
                                <TableCell className="text-right font-bold text-lg">{formatCurrency(order.totalCost, order.currency)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/dashboard/suppliers/${order.supplierId}`} className="font-medium text-primary hover:underline">
                        {order.supplierName}
                    </Link>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date</span>
                        <span>{order.orderDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Delivery</span>
                        <span>{order.expectedDelivery}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariant}>{order.status}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
