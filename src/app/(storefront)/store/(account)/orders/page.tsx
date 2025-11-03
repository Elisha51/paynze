
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

const mockOrders = [
  { id: '#3210', date: 'July 20, 2024', status: 'Delivered', total: 'UGX 50,000' },
  { id: '#3205', date: 'July 15, 2024', status: 'Shipped', total: 'UGX 125,000' },
  { id: '#3180', date: 'July 5, 2024', status: 'Delivered', total: 'UGX 75,000' },
];

export default function MyOrdersPage() {
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
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/store/account/orders/${order.id.replace('#','')}`} className="font-medium hover:underline">
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
