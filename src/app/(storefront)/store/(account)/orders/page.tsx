
'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      // In a real app, you would fetch orders for the logged-in customer.
      // We are fetching all orders and filtering for simulation purposes.
      const allOrders = await getOrders();
      setOrders(allOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsLoading(false);
    }
    loadOrders();
  }, []);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
      case 'Paid':
        return 'default';
      case 'Shipped':
      case 'Ready for Pickup':
        return 'outline';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
   const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>
          A list of your recent orders from our store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/store/account/orders/${order.id}`} className="font-medium hover:underline">
                    #{order.id}
                  </Link>
                </TableCell>
                <TableCell>{format(new Date(order.date), 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(order.total, order.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
