
'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
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
import type { Order } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { DataTable } from './data-table';


const columns: ColumnDef<Order>[] = [
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
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => (
        <Link href={`/dashboard/orders/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue('id')}
        </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => {
        const order = row.original;
        return (
             <Link href={`/dashboard/customers/${order.customerId}`} className="font-medium hover:underline">
                {order.customerName}
            </Link>
        )
    }
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'Pending' ? 'secondary' : row.getValue('status') === 'Cancelled' ? 'destructive' : 'default'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
    {
    accessorKey: 'paymentMethod',
    header: 'Payment',
  },
  {
    accessorKey: 'total',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
    cell: ({ row }) => {
      const order = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="relative bg-background text-right sticky right-0">
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
                <Link href={`/dashboard/orders/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
            <DropdownMenuItem>Assign</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];

type OrdersTableProps = {
  orders: Order[];
  isLoading: boolean;
  filter?: {
    column: string;
    value: string;
  };
};

export function OrdersTable({ orders, isLoading, filter }: OrdersTableProps) {
  const [data, setData] = React.useState<Order[]>([]);

  React.useEffect(() => {
    if (filter) {
      setData(orders.filter(item => (item as any)[filter.column] === filter.value));
    } else {
      setData(orders);
    }
  }, [orders, filter]);

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
