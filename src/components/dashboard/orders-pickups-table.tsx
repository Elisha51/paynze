
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
    cell: ({ row }) => format(new Date(row.original.date), 'PPP p')
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
                    <ConfirmPickupDialog order={order} onUpdate={onUpdate}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <PackageCheck className="mr-2 h-4 w-4" />
                            Confirm Pickup
                        </DropdownMenuItem>
                    </ConfirmPickupDialog>
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
    setData(currentData => currentData.filter(o => o.id !== updatedOrder.id));
  };
  
  const columns = React.useMemo(() => getPickupColumns(handleUpdate, settings?.currency || 'UGX'), [settings?.currency]);
  
  const pickupWorklist = data
    .filter(o => o.status === 'Ready for Pickup')
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
        <CardHeader>
            <CardTitle>Pickup Worklist</CardTitle>
            <CardDescription>A list of orders that are ready for customer pickup.</CardDescription>
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
