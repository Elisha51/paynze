
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
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-7" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-6 w-20 rounded-full sm:inline-flex" />
                 </div>
                 <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
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
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/dashboard/procurement">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    PO #{order.id}
                </h1>
                <Badge variant={statusVariant} className="hidden sm:inline-flex">
                    {order.status}
                </Badge>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <Button variant="outline" size="sm">
                        Mark as Received
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-3.5 w-3.5" />
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-4">
                    <div className="grid gap-0.5">
                        <CardTitle className="group flex items-center gap-2 text-lg">
                            Supplier: <Link href={`/dashboard/suppliers/${order.supplierId}`} className="hover:underline">{order.supplierName}</Link>
                        </CardTitle>
                    </div>
                    <div className="grid gap-0.5 text-right text-sm">
                        <p><strong>Order Date:</strong> {order.orderDate}</p>
                        <p><strong>Expected Delivery:</strong> {order.expectedDelivery}</p>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
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
                                <TableCell colSpan={3} className="text-right font-semibold">Grand Total</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(order.totalCost, order.currency)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
