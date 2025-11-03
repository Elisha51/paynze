
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bell, ShoppingCart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockNotifications = [
    { id: 1, icon: ShoppingCart, title: 'Order Confirmed', description: 'Your order #3210 has been confirmed and is being processed.', time: '2 hours ago', read: false, link: '/store/account/orders/3210' },
    { id: 2, icon: Truck, title: 'Order Shipped', description: 'Your order #3205 has been shipped and is on its way to you.', time: '1 day ago', read: false, link: '/store/account/orders/3205' },
    { id: 3, icon: Truck, title: 'Out for Delivery', description: 'Your order #3205 is out for delivery and will arrive today.', time: '8 hours ago', read: false, link: '/store/account/orders/3205' },
    { id: 4, icon: ShoppingCart, title: 'Order Delivered', description: 'Your order #3180 has been successfully delivered.', time: '3 days ago', read: true, link: '/store/account/orders/3180' },
];

export default function NotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Stay up to date with your orders and account activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {mockNotifications.map(notification => (
                <div key={notification.id} className={cn("flex items-start gap-4 rounded-lg border p-4", !notification.read && "bg-muted/50")}>
                    <notification.icon className="h-6 w-6 text-muted-foreground mt-1" />
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                        {notification.link && (
                            <Button asChild variant="link" className="p-0 h-auto text-sm">
                                <Link href={notification.link}>View Order</Link>
                            </Button>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
