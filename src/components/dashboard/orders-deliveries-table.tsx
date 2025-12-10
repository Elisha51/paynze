

'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Truck, Store, User, ArrowUpDown, PackageCheck } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order, Staff } from '@/lib/types';
import { DataTable } from './data-table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { useAuth } from '@/context/auth-context';
import { AssignOrderDialog } from './assign-order-dialog';
import { EmptyState } from '../ui/empty-state';
import { format } from 'date-fns';
import { FulfillOrderDialog } from './fulfill-order-dialog';

const deliveryStatusMap: { [key: string]: { label: string; color: string; } } = {
  'Ready for Delivery': { label: 'Ready for Delivery', color: 'bg-blue-100 text-blue-800' },
  'Shipped': { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
  'Attempted Delivery': { label: 'Attempted', color: 'bg-orange-100 text-orange-800' },
  'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
};


const getColumns = (
  onUpdate: (updatedOrder: Order) => void,
  staff: Staff[],
  canEdit: boolean
): ColumnDef<Order>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Order #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
        <Link href={`/dashboard/orders/${row.original.id}`} className="font-mono text-xs hover:underline">
            {row.getValue('id')}
        </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
  },
   {
    accessorKey: 'status',
    header: 'Fulfillment Status',
    cell: ({ row }) => {
      const statusInfo = deliveryStatusMap[row.original.status];
      if (!statusInfo) return <Badge variant="outline">{row.original.status}</Badge>;
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
        
        if (!staffId || !staffName) {
             if (canEdit && order.status === 'Ready for Delivery') {
                return (
                     <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate}>
                        <Button variant="outline" size="sm">Assign Agent</Button>
                    </AssignOrderDialog>
                );
            }
            return <Badge variant="secondary">Unassigned</Badge>
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
    id: 'deliveredOn',
    header: 'Delivered On',
    cell: ({ row }) => {
        const order = row.original;
        if (order.status !== 'Delivered') return <span className="text-muted-foreground">—</span>;
        const deliveredNote = (order.deliveryNotes || []).find(n => n.note.includes('Status updated to "Delivered"'));
        return deliveredNote?.date ? format(new Date(deliveredNote.date), 'PP p') : <span className="text-muted-foreground">N/A</span>;
    }
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
                    <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            {order.assignedStaffId ? 'Re-assign Agent' : 'Assign Agent'}
                        </DropdownMenuItem>
                    </AssignOrderDialog>
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
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
  
  const columns = React.useMemo(() => getColumns(handleUpdate, staff, !!canEdit), [staff, canEdit]);

  const deliveryWorklist = data
    .filter(o => {
        return o.fulfillmentMethod === 'Delivery' && ['Ready for Delivery', 'Shipped', 'Attempted Delivery', 'Delivered'].includes(o.status);
    })
    .sort((a,b) => {
        const statusOrder = { 'Ready for Delivery': 0, 'Shipped': 1, 'Attempted Delivery': 2, 'Delivered': 3 };
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99) || new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const staffOptions = React.useMemo(() => {
    const assignedStaff = new Set(deliveryWorklist.map(o => o.assignedStaffName).filter(Boolean));
    const hasUnassigned = deliveryWorklist.some(o => !o.assignedStaffName);

    const options = Array.from(assignedStaff).map(s => ({ value: s, label: s }));
    if(hasUnassigned) {
        options.unshift({ value: 'Unassigned', label: 'Unassigned' });
    }
    return options;
  }, [deliveryWorklist]);

    const deliveryStatusOptions = [
        { value: 'Ready for Delivery', label: 'Ready for Delivery' },
        { value: 'Shipped', label: 'In Transit' },
        { value: 'Attempted Delivery', label: 'Attempted' },
        { value: 'Delivered', label: 'Delivered' },
    ];


  return (
    <Card>
        <CardHeader>
            <CardTitle>Delivery Worklist</CardTitle>
            <CardDescription>A summary of orders currently being prepared for or in transit for delivery.</CardDescription>
        </CardHeader>
        <CardContent>
             <DataTable
                columns={columns}
                data={deliveryWorklist}
                isLoading={!orders || !staff}
                filters={[
                    {
                        columnId: 'assignedStaffName',
                        title: 'Assigned To',
                        options: staffOptions
                    },
                    {
                        columnId: 'status',
                        title: 'Status',
                        options: deliveryStatusOptions,
                    },
                ]}
                emptyState={{
                    icon: Truck,
                    title: "No Active Deliveries",
                    description: "There are no orders currently being delivered. Prepare a paid order for delivery to get started."
                }}
            />
        </CardContent>
    </Card>
  );
}
