
'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Truck, Store, User } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order, Staff } from '@/lib/types';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { updateOrder } from '@/services/orders';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { useAuth } from '@/context/auth-context';
import { AssignOrderDialog } from './orders-table';


const deliveryStatusMap: { [key in Order['status']]: { label: string; color: string; } } = {
  'Awaiting Payment': { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  'Paid': { label: 'Ready to Fulfill', color: 'bg-blue-100 text-blue-800' },
  'Ready for Pickup': { label: 'In Store', color: 'bg-blue-100 text-blue-800' },
  'Shipped': { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
  'Attempted Delivery': { label: 'Attempted', color: 'bg-orange-100 text-orange-800' },
  'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  'Picked Up': { label: 'Completed', color: 'bg-green-100 text-green-800' },
  'Cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const paymentMethods = [
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery' },
];

const fulfillmentMethods = [
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Pickup', label: 'Pickup' },
];

const deliveryStatuses = [
    { value: 'Paid', label: 'Ready to Fulfill' },
    { value: 'Ready for Pickup', label: 'In Store' },
    { value: 'Shipped', label: 'In Transit' },
    { value: 'Attempted Delivery', label: 'Attempted' },
];

type OrdersDeliveriesTableProps = {
  orders: Order[];
  staff: Staff[];
};

export function OrdersDeliveriesTable({ orders, staff }: OrdersDeliveriesTableProps) {
  const [data, setData] = React.useState<Order[]>(orders);
  const { user } = useAuth();
  const canEdit = user?.permissions.orders.edit;

  React.useEffect(() => {
    setData(orders);
  }, [orders]);

  const handleUpdate = (updatedOrder: Order) => {
    setData(currentData => currentData.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };
  
  const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order #',
    cell: ({ row }) => (
        <Link href={`/dashboard/orders/${row.original.id}`} className="font-mono text-xs hover:underline">
            {row.getValue('id')}
        </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Customer',
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const order = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'paymentMethod',
    accessorFn: row => row.payment?.method,
    header: 'Payment Method',
    cell: ({ row }) => {
      const payment = row.original.payment;
      return <span>{payment?.method || 'N/A'}</span>;
    },
    filterFn: (row, id, value) => {
      const method = row.original.payment?.method;
      if (!method) return false;
      return (value as string[]).includes(method);
    },
  },
  {
    accessorKey: 'fulfillmentMethod',
    header: 'Delivery Type',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.fulfillmentMethod === 'Delivery' ? <Truck className="h-4 w-4 text-muted-foreground"/> : <Store className="h-4 w-4 text-muted-foreground"/>}
        {row.original.fulfillmentMethod}
      </div>
    ),
     filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
  },
  {
    accessorKey: 'status',
    header: 'Fulfillment Status',
    cell: ({ row }) => {
      const statusInfo = deliveryStatusMap[row.original.status];
      return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
    },
    filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
  },
    {
    accessorKey: 'assignedStaffName',
    header: 'Assigned To',
    cell: ({ row }) => {
        const order = row.original;
        const staffName = order.fulfilledByStaffName || order.assignedStaffName;
        const staffId = order.fulfilledByStaffId || order.assignedStaffId;
        
        if (order.status === 'Cancelled') {
            return <span className="text-muted-foreground">—</span>;
        }

        if (!staffId || !staffName) {
            if (canEdit && order.fulfillmentMethod === 'Delivery' && (order.status === 'Paid' || order.status === 'Awaiting Payment')) {
                return (
                    <AssignOrderDialog order={order} staff={staff} onUpdate={handleUpdate} asChild>
                        <Button variant="outline" size="sm">
                            <User className="mr-2 h-4 w-4" />
                            Assign
                        </Button>
                    </AssignOrderDialog>
                )
            }
            return <Badge variant="destructive">Unassigned</Badge>
        }
        return (
            <Link href={`/dashboard/staff/${staffId}`} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://picsum.photos/seed/${staffId}/24/24`} />
                    <AvatarFallback>{getInitials(staffName)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-xs">{staffName}</span>
            </Link>
        )
    },
    filterFn: (row, id, value) => {
        const staffName = row.original.assignedStaffName || 'Unassigned';
        return (value as string[]).includes(staffName);
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link href={`/dashboard/orders/${order.id}`}>View Details</Link></DropdownMenuItem>
                    {canEdit && 
                    <AssignOrderDialog order={order} staff={staff} onUpdate={handleUpdate} asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Re-assign Agent</DropdownMenuItem>
                    </AssignOrderDialog>
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];


  const deliveryWorklist = data
    .filter(o => {
        const isReadyForFulfillment = ['Paid', 'Ready for Pickup', 'Shipped', 'Attempted Delivery'].includes(o.status);
        return isReadyForFulfillment;
    })
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const staffOptions = React.useMemo(() => {
    const assignedStaff = new Set(deliveryWorklist.map(o => o.assignedStaffName).filter(Boolean));
    const hasUnassigned = deliveryWorklist.some(o => !o.assignedStaffName);

    const options = Array.from(assignedStaff).map(s => ({ value: s, label: s }));
    if(hasUnassigned) {
        options.unshift({ value: 'Unassigned', label: 'Unassigned' });
    }
    return options;
  }, [deliveryWorklist]);


  return (
    <Card>
        <CardHeader>
            <CardTitle>Delivery Worklist</CardTitle>
            <CardDescription>A summary of paid orders that are ready for fulfillment or are in transit.</CardDescription>
        </CardHeader>
        <CardContent>
             <DataTable
                columns={columns}
                data={deliveryWorklist}
                isLoading={!orders || !staff}
                filters={[
                    {
                        columnId: 'fulfillmentMethod',
                        title: 'Delivery Type',
                        options: fulfillmentMethods
                    },
                    {
                        columnId: 'assignedStaffName',
                        title: 'Assigned To',
                        options: staffOptions
                    },
                    {
                        columnId: 'paymentMethod',
                        title: 'Payment',
                        options: paymentMethods,
                    },
                    {
                        columnId: 'status',
                        title: 'Status',
                        options: deliveryStatuses,
                    },
                ]}
            />
        </CardContent>
    </Card>
  );
}

    
