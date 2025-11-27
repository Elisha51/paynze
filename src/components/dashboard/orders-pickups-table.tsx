
'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, User, Truck, Store, PackageCheck } from 'lucide-react';
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
import type { Order, OnboardingFormData } from '@/lib/types';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ConfirmPickupDialog } from './confirm-pickup-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { updateOrder } from '@/services/orders';
import { format } from 'date-fns';

const getPickupColumns = (
  onUpdate: (updatedOrder: Order) => void,
  currency: string
): ColumnDef<Order>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
  },
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
    accessorKey: 'date',
    header: 'Ready On',
    cell: ({ row }) => format(new Date(row.original.date), 'PP p')
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const order = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(order.total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
   {
    id: 'pickedUpOn',
    header: 'Picked-up On',
    cell: ({ row }) => {
        const order = row.original;
        if (order.status !== 'Picked Up' || !order.pickupDetails?.date) {
            return <span className="text-muted-foreground">—</span>;
        }
        return format(new Date(order.pickupDetails.date), 'PP p');
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    {order.status === 'Ready for Pickup' && (
                        <ConfirmPickupDialog order={order} onUpdate={onUpdate}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Confirm Pickup
                            </DropdownMenuItem>
                        </ConfirmPickupDialog>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

type OrdersPickupsTableProps = {
  orders: Order[];
  isLoading: boolean;
};

export function OrdersPickupsTable({ orders, isLoading }: OrdersPickupsTableProps) {
  const [data, setData] = React.useState<Order[]>([]);
  const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

  React.useEffect(() => {
    setData(orders);
    const storedSettings = localStorage.getItem('onboardingData');
    if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
    }
  }, [orders]);

  const handleUpdate = (updatedOrder: Order) => {
    setData(currentData => currentData.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };
  
  const columns = React.useMemo(() => getPickupColumns(handleUpdate, settings?.currency || 'UGX'), [settings?.currency]);
  
  const pickupWorklist = data
    .filter(o => o.fulfillmentMethod === 'Pickup' && ['Ready for Pickup', 'Picked Up'].includes(o.status))
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
        <CardHeader>
            <CardTitle>Pickup Worklist</CardTitle>
            <CardDescription>A list of orders that are ready for or have been collected by customers.</CardDescription>
        </CardHeader>
        <CardContent>
             <DataTable
                columns={columns}
                data={pickupWorklist}
                isLoading={isLoading}
                emptyState={{
                    icon: Store,
                    title: "No Orders Ready for Pickup",
                    description: "When you mark an order as 'Ready for Pickup', it will appear here.",
                }}
            />
        </CardContent>
    </Card>
  );
}
