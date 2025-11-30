
'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Order } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
      if (loggedInCustomerId) {
          const allOrders = await getOrders();
          const customerOrders = allOrders.filter(o => o.customerId === loggedInCustomerId);
          setOrders(customerOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      setIsLoading(false);
    }
    loadOrders();
  }, []);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
      case 'Picked Up':
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

  const columns: ColumnDef<Order>[] = [
    {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => (
            <Link href={`/store/account/orders/${row.original.id}`} className="font-medium hover:underline">
                #{row.getValue('id')}
            </Link>
        )
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP')
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant={getStatusVariant(row.getValue('status'))}>{row.getValue('status')}</Badge>
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.total, row.original.currency)
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>
          A list of your recent orders from our store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable 
            columns={columns} 
            data={orders} 
            isLoading={isLoading}
            emptyState={{
                icon: ShoppingCart,
                title: "You haven't placed any orders yet.",
                description: "Your orders will appear here once you've made a purchase.",
                cta: <Button asChild><Link href="/store">Continue Shopping</Link></Button>
            }}
        />
      </CardContent>
    </Card>
  );
}
