
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, ChevronLeft, Truck, Edit } from 'lucide-react';
import Link from 'next/link';
import { getOrderById, updateOrder } from '@/services/orders';
import { getStaff } from '@/services/staff';
import type { Order, OnboardingFormData, Staff } from '@/lib/types';
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
  DropdownMenuLabel,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { AssignOrderDialog } from '@/components/dashboard/assign-order-dialog';


export default function ViewOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const { user } = useAuth();
  
  const canEdit = user?.permissions.orders.edit;

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    if (id) {
        async function loadData() {
            setLoading(true);
            const [fetchedOrder, fetchedStaff] = await Promise.all([
              getOrderById(id),
              getStaff()
            ]);
            setOrder(fetchedOrder || null);
            setStaff(fetchedStaff);
            setLoading(false);
        }
        loadData();
    }
  }, [id]);

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrder(updatedOrder);
  };

  if (loading || !settings) {
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

  const statusVariant = {
      'Awaiting Payment': 'secondary',
      Paid: 'default',
      'Ready for Pickup': 'outline',
      Shipped: 'outline',
      'Attempted Delivery': 'outline',
      Delivered: 'default',
      'Picked Up': 'default',
      Cancelled: 'destructive',
  }[order.status] as "secondary" | "default" | "outline" | "destructive" | null;
  
  const paymentStatusVariant = order.payment ? {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
      refunded: 'outline',
  }[order.payment.status] as "secondary" | "default" | "outline" | "destructive" | null : 'secondary';
  
  const currency = order.currency || settings.currency;
  
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxes = order.taxes || 0;
  const shipping = order.shippingCost || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-2xl font-bold tracking-tight">
            Order #{order.id}
        </h1>
        <Badge variant={statusVariant} className="hidden sm:inline-flex">
            {order.status}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
            {canEdit && order.channel === 'Manual' && (
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/orders/${order.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                    </Link>
                </Button>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                     {canEdit && order.status === 'Paid' && order.fulfillmentMethod === 'Delivery' && (
                        <AssignOrderDialog order={order} staff={staff} onUpdate={handleOrderUpdate}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Assign for Delivery</DropdownMenuItem>
                        </AssignOrderDialog>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Order Items ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => (
                                <TableRow key={item.sku}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.price, currency)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.price * item.quantity, currency)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right">Subtotal</TableCell>
                                <TableCell className="text-right">{formatCurrency(subtotal, currency)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={3} className="text-right">Shipping</TableCell>
                                <TableCell className="text-right">{formatCurrency(shipping, currency)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={3} className="text-right">Taxes</TableCell>
                                <TableCell className="text-right">{formatCurrency(taxes, currency)}</TableCell>
                            </TableRow>
                             <TableRow className="font-bold text-lg">
                                <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                                <TableCell className="text-right">{formatCurrency(order.total, currency)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/dashboard/customers/${order.customerId}`} className="font-medium text-primary hover:underline">
                        {order.customerName}
                    </Link>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Channel</span>
                        <span><Badge variant="outline">{order.channel}</Badge></span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fulfillment</span>
                         <Badge variant={order.fulfillmentMethod === 'Delivery' ? 'secondary' : 'outline'}>{order.fulfillmentMethod}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Payment</span>
                        <Badge variant={paymentStatusVariant}>{order.payment?.status || 'pending'}</Badge>
                    </div>
                </CardContent>
            </Card>
             {(order.assignedStaffName || order.fulfilledByStaffName) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Truck className="h-5 w-5 text-muted-foreground"/>
                           Fulfillment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={`https://picsum.photos/seed/${order.assignedStaffId || order.fulfilledByStaffId}/40/40`} />
                                <AvatarFallback>{getInitials(order.assignedStaffName || order.fulfilledByStaffName || '')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{order.assignedStaffName || order.fulfilledByStaffName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {order.fulfilledByStaffName ? 'Fulfilled by' : 'Assigned to'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
