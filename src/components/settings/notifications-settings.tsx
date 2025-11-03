
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '../ui/separator';

export function NotificationsSettings() {
  const [storeNotifications, setStoreNotifications] = useState({
    newOrders: true,
    lowStock: true,
  });

  const [customerNotifications, setCustomerNotifications] = useState({
    orderConfirmation: true,
    shippingUpdate: true,
  });

  const handleStoreChange = (id: keyof typeof storeNotifications) => {
    setStoreNotifications(prev => ({...prev, [id]: !prev[id]}));
  };

  const handleCustomerChange = (id: keyof typeof customerNotifications) => {
    setCustomerNotifications(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Store Notifications</CardTitle>
                <CardDescription>Notifications sent to you and your staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="newOrders" className="flex flex-col space-y-1">
                      <span>New Orders</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Receive a notification for every new order placed.</span>
                    </Label>
                    <Switch id="newOrders" checked={storeNotifications.newOrders} onCheckedChange={() => handleStoreChange('newOrders')} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="lowStock" className="flex flex-col space-y-1">
                      <span>Low Stock Alerts</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Get notified when product inventory runs low.</span>
                    </Label>
                    <Switch id="lowStock" checked={storeNotifications.lowStock} onCheckedChange={() => handleStoreChange('lowStock')} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Customer Notifications</CardTitle>
                <CardDescription>Automated email and SMS notifications sent to your customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="orderConfirmation" className="flex flex-col space-y-1">
                      <span>Order Confirmation</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Sent when a customer completes a purchase.</span>
                    </Label>
                    <Switch id="orderConfirmation" checked={customerNotifications.orderConfirmation} onCheckedChange={() => handleCustomerChange('orderConfirmation')} />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="shippingUpdate" className="flex flex-col space-y-1">
                      <span>Shipping Updates</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Notify customers when their order is shipped or out for delivery.</span>
                    </Label>
                    <Switch id="shippingUpdate" checked={customerNotifications.shippingUpdate} onCheckedChange={() => handleCustomerChange('shippingUpdate')} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
