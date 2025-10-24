import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OrdersTable } from '@/components/dashboard/orders-table';

export default function OrdersPage() {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Orders</h2>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable />
        </CardContent>
      </Card>
    </>
  );
}
