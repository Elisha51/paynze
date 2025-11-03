
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Truck } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/store/account/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h2 className="text-xl font-semibold">Order #{params.id}</h2>
            <p className="text-sm text-muted-foreground">Order placed on July 20, 2024</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>1 item</CardDescription>
            </div>
            <Badge variant="default">Delivered</Badge>
        </CardHeader>
        <CardContent>
            <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                        src={`https://picsum.photos/seed/SHOE-002-42/80/80`}
                        alt="Product image"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1">
                    <p className="font-semibold">Handmade Leather Shoes</p>
                    <p className="text-sm text-muted-foreground">Size: 42</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">UGX 50,000</p>
                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                </div>
            </div>
        </CardContent>
        <Separator />
        <CardContent className="space-y-2 pt-4">
             <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p>UGX 50,000</p>
            </div>
            <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Shipping</p>
                <p>UGX 5,000</p>
            </div>
            <div className="flex justify-between font-semibold text-base">
                <p>Total</p>
                <p>UGX 55,000</p>
            </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p>John Doe</p>
                <p>1234 Makerere Hill Rd</p>
                <p>Kampala, Uganda</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Paid upon receipt</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
