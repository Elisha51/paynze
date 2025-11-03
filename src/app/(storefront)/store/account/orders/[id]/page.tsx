
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Truck } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { getOrderById } from '@/services/orders';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      const fetchedOrder = await getOrderById(`ORD-${id}`);
      setOrder(fetchedOrder || null);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <Skeleton className="w-full h-64" />
             <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-32" />
             </div>
        </div>
    )
  }

  if (!order) {
    return (
      <div>
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Button asChild variant="link">
          <Link href="/store/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const statusVariant = {
      'Awaiting Payment': 'secondary',
      Paid: 'default',
      'Ready for Pickup': 'outline',
      Shipped: 'outline',
      Delivered: 'default',
      'Picked Up': 'default',
      Cancelled: 'destructive',
  }[order.status] as "secondary" | "default" | "outline" | "destructive" | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/store/account/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
            <p className="text-sm text-muted-foreground">Order placed on {new Date(order.date).toLocaleDateString()}</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>{order.items.length} item(s)</CardDescription>
            </div>
            <Badge variant={statusVariant}>{order.status}</Badge>
        </CardHeader>
        <CardContent>
            {order.items.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                            src={item.imageUrl || `https://picsum.photos/seed/${item.sku}/80/80`}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity, order.currency)}</p>
                    </div>
                </div>
            ))}
        </CardContent>
        <Separator />
        <CardContent className="space-y-2 pt-4">
             <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p>{formatCurrency(order.total - (order.shippingCost || 0), order.currency)}</p>
            </div>
            <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Shipping</p>
                <p>{formatCurrency(order.shippingCost || 0, order.currency)}</p>
            </div>
            <div className="flex justify-between font-semibold text-base">
                <p>Total</p>
                <p>{formatCurrency(order.total, order.currency)}</p>
            </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{order.customerName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">{order.payment.method}</p>
                <p className="text-sm text-muted-foreground capitalize">Status: {order.payment.status}</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
