
'use client';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UpdateDeliveryStatusDialog } from '../../my-tasks/_components/update-delivery-status-dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, FileText, Landmark, ShoppingBag, PenSquare } from 'lucide-react';

type DeliveryRunsheetCardProps = {
  order: Order;
  onUpdate: () => void;
};

const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  'Awaiting Payment': 'secondary',
  'Paid': 'default',
  'Ready for Pickup': 'outline',
  'Shipped': 'outline',
  'Attempted Delivery': 'outline',
  'Delivered': 'default',
  'Picked Up': 'default',
  'Cancelled': 'destructive',
};

export function DeliveryRunsheetCard({ order, onUpdate }: DeliveryRunsheetCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
  
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Order #{order.id}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusVariantMap[order.status] || 'secondary'}>{order.status}</Badge>
            <Badge variant={order.payment.status === 'completed' ? 'default' : 'secondary'}>{order.payment.status}</Badge>
          </div>
        </div>
        <UpdateDeliveryStatusDialog order={order} onUpdate={onUpdate}>
            <Button size="sm"><PenSquare className="mr-2 h-4 w-4" /> Update</Button>
        </UpdateDeliveryStatusDialog>
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Customer</h4>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Address</h4>
          <p className="text-sm">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Summary</h4>
          <p className="text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> {totalItems} item{totalItems > 1 ? 's' : ''}
          </p>
          <p className="text-sm flex items-center gap-2">
            <Landmark className="h-4 w-4" /> {formatCurrency(order.total, order.currency)} - {order.payment.method}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
