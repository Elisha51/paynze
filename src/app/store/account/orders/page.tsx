'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrders } from '@/services/orders';
import type { Order } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  'Awaiting Payment': 'secondary',
  Paid: 'default',
  'Ready for Pickup': 'outline',
  Shipped: 'outline',
  Delivered: 'default',
  'Picked Up': 'default',
  Cancelled: 'destructive',
};

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    
    useEffect(() => {
        // In a real app, you'd fetch orders for the logged-in customer.
        // We'll filter the mock orders for demonstration.
        async function loadOrders() {
            const allOrders = await getOrders();
            const customerOrders = allOrders.filter(o => o.customerId === 'cust-02'); // Mocking for Olivia Smith
            setOrders(customerOrders);
        }
        loadOrders();
    }, []);
    
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>View your order history and check the status of your purchases.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono">{order.id}</TableCell>
                                    <TableCell>{format(new Date(order.date), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[order.status] || 'default'}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total, order.currency)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/store/account/orders/${order.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    You have not placed any orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
