
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getOrderById } from '@/services/orders';
import type { Order } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { getProducts } from '@/services/products';

const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  'Awaiting Payment': 'secondary',
  Paid: 'default',
  'Ready for Pickup': 'outline',
  Shipped: 'outline',
  Delivered: 'default',
  'Picked Up': 'default',
  Cancelled: 'destructive',
};

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
        async function loadOrderAndProducts() {
            setLoading(true);
            const [fetchedOrder, fetchedProducts] = await Promise.all([
                getOrderById(id),
                getProducts()
            ]);
            setOrder(fetchedOrder || null);
            setAllProducts(fetchedProducts);
            setLoading(false);
        }
        loadOrderAndProducts();
    }
  }, [id]);

  const handleReorder = () => {
    if (!order) return;
    
    order.items.forEach(item => {
        const product = allProducts.find(p => p.sku === item.sku || p.variants.some((v: any) => v.sku === item.sku));
        if (product) {
            const variant = product.variants.find((v: any) => v.sku === item.sku || (product.variants.length === 1 && !product.hasVariants));
            if (variant) {
                addToCart(product, variant, item.quantity);
            }
        }
    });

    toast({
        title: "Items Added to Cart",
        description: "The items from this order have been added back to your cart."
    });
    router.push('/checkout');
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!order) {
    return (
        <div className="text-center">
            <h1 className="text-xl font-semibold">Order not found</h1>
            <p className="text-muted-foreground">This order could not be found in your history.</p>
            <Button variant="outline" asChild className="mt-4">
                <Link href="/store/account/orders"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Orders</Link>
            </Button>
        </div>
    )
  }
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/store/account/orders">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Orders</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold">Order Details</h1>
                <p className="text-muted-foreground">Order ID: {order.id}</p>
            </div>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                        Placed on {new Date(order.date).toLocaleDateString()}
                    </span>
                    <Badge variant={statusVariantMap[order.status] || 'default'}>{order.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div>
                    <h3 className="font-semibold mb-2">Items</h3>
                    <ul className="divide-y divide-border">
                        {order.items.map(item => (
                            <li key={item.sku} className="flex items-center gap-4 py-3">
                                <Image 
                                    src={item.imageUrl || `https://picsum.photos/seed/${item.sku}/64/64`}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md border object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price, order.currency)} x {item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatCurrency(item.price * item.quantity, order.currency)}</p>
                            </li>
                        ))}
                    </ul>
                 </div>
                 <Separator />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Payment Details</h3>
                        <div className="text-sm space-y-1">
                            <p><strong className="text-muted-foreground">Method:</strong> {order.payment.method}</p>
                            <p><strong className="text-muted-foreground">Status:</strong> <span className="capitalize">{order.payment.status}</span></p>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold">Shipping Address</h3>
                         <address className="text-sm text-muted-foreground not-italic">
                            {order.shippingAddress.street} <br/>
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode} <br/>
                            {order.shippingAddress.country}
                        </address>
                    </div>
                 </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/50 p-4">
                <div className="text-lg">
                    <span className="text-muted-foreground">Order Total: </span>
                    <strong className="font-bold">{formatCurrency(order.total, order.currency)}</strong>
                </div>
                <Button onClick={handleReorder}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Reorder Items
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
