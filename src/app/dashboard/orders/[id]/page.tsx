
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, ChevronLeft, Truck, Copy, Store, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { getOrderById } from '@/services/orders';
import type { Order } from '@/lib/types';
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
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ViewOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        async function loadOrder() {
            setLoading(true);
            const fetchedOrder = await getOrderById(id);
            setOrder(fetchedOrder || null);
            setLoading(false);
        }
        loadOrder();
    }
  }, [id]);
  
  if (loading) {
    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
                 <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-7" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-6 w-20 rounded-full sm:inline-flex" />
                 </div>
                 <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                         <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                        <Skeleton className="h-64 w-full" />
                    </div>
                 </div>
            </div>
        </div>
    )
  }


  if (!order) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Order not found</h1>
            <p className="text-muted-foreground">The order you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                </Link>
            </Button>
        </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.shippingCost || 0;
  const taxes = order.taxes || 0;
  const total = subtotal + shipping + taxes;

  const statusVariant = {
      Pending: 'secondary',
      Paid: 'default',
      'Ready for Pickup': 'outline',
      Shipped: 'outline',
      Delivered: 'default',
      'Picked Up': 'default',
      Cancelled: 'destructive',
  }[order.status] as "secondary" | "default" | "outline" | "destructive" | null;

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                <Link href="/dashboard/orders">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Order {order.id}
            </h1>
            <Badge variant={statusVariant} className="hidden sm:inline-flex">
                {order.status}
            </Badge>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
                {order.fulfillmentMethod === 'Delivery' && <Button variant="outline" size="sm">Mark as Delivered</Button>}
                {order.fulfillmentMethod === 'Pickup' && <Button variant="outline" size="sm">Mark as Picked Up</Button>}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Order</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                <CardHeader className="flex flex-row items-start bg-muted/50">
                    <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">
                        Order Details
                    </CardTitle>
                    <CardDescription>
                        Date: {order.date}
                    </CardDescription>
                    </div>
                     <div className="ml-auto flex items-center gap-1">
                        {order.fulfillmentMethod === 'Delivery' ? (
                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                <Truck className="h-3.5 w-3.5" />
                                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">Track Order</span>
                            </Button>
                        ) : (
                             <Button size="sm" variant="outline" className="h-8 gap-1">
                                <Store className="h-3.5 w-3.5" />
                                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">Pickup Order</span>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6 text-sm">
                    <div className="grid gap-3">
                        <div className="font-semibold">Items</div>
                        <ul className="grid gap-3">
                            {order.items.map(item => (
                                <li key={item.sku} className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                         <Image
                                            alt={item.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="48"
                                            src={item.imageUrl || `https://picsum.photos/seed/${item.sku}/48/48`}
                                            width="48"
                                            />
                                        <div>
                                            <span className="block text-foreground">{item.name}</span>
                                            <span className="block text-xs">SKU: {item.sku}</span>
                                        </div>
                                    </span>
                                    <span>{formatCurrency(item.price, order.currency)} x {item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                        <Separator className="my-4" />
                        <ul className="grid gap-3">
                            <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(subtotal, order.currency)}</span>
                            </li>
                            <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>{formatCurrency(shipping, order.currency)}</span>
                            </li>
                            <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>{formatCurrency(taxes, order.currency)}</span>
                            </li>
                            <li className="flex items-center justify-between font-semibold">
                            <span className="text-muted-foreground">Total</span>
                            <span>{formatCurrency(total, order.currency)}</span>
                            </li>
                        </ul>
                    </div>
                     <Separator className="my-4" />
                     <div className="grid gap-3">
                        <div className="font-semibold">Fulfillment</div>
                        {order.fulfilledByStaffName ? (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4" />
                                    {order.status === 'Picked Up' ? 'Picked up by Customer, handled by' : 'Delivered by'}
                                </span>
                                <Link href={`/dashboard/staff/${order.fulfilledByStaffId}`} className="font-semibold hover:underline">
                                    {order.fulfilledByStaffName}
                                </Link>
                            </div>
                        ) : order.assignedStaffName ? (
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Truck className="h-4 w-4" />
                                    Assigned for delivery to
                                </span>
                                <Link href={`/dashboard/staff/${order.assignedStaffId}`} className="font-semibold hover:underline">
                                    {order.assignedStaffName}
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">This order is pending fulfillment.</p>
                        )}
                     </div>
                </CardContent>
                </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-medium">
                                    <Link href={`/dashboard/customers/${order.customerId}`} className="hover:underline">{order.customerName}</Link>
                                </p>
                                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>
                         <Separator />
                        <div>
                            <p className="font-medium mb-1">Shipping Address</p>
                            <address className="text-sm text-muted-foreground not-italic">
                                {order.shippingAddress.street} <br/>
                                {order.shippingAddress.city}, {order.shippingAddress.postalCode} <br/>
                                {order.shippingAddress.country}
                            </address>
                        </div>
                         <Separator />
                         <div>
                            <p className="font-medium mb-1">Payment</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{order.paymentMethod}</Badge>
                                <span>-</span>
                                <Badge variant={order.paymentStatus === 'Paid' ? 'secondary' : 'destructive'}>{order.paymentStatus}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </div>
        </div>
    </div>
  );
}
