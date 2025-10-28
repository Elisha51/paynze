
'use client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
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
import type { Order, Customer, PurchaseOrder, Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


export const ordersColumns: ColumnDef<Order>[] = [
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
    header: 'Customer',
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
    header: 'Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        <Badge variant={row.getValue('status') === 'Awaiting Payment' ? 'secondary' : row.getValue('status') === 'Cancelled' ? 'destructive' : 'default'}>
          {row.getValue('status')}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'total',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
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
];

export const customersColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
        const customer = row.original;
        return (
             <Link href={`/dashboard/customers/${customer.id}`} className="font-medium hover:underline">
                {customer.name}
            </Link>
        )
    }
  },
  {
    accessorKey: 'email',
    header: 'Contact',
  },
  {
    accessorKey: 'customerGroup',
    header: 'Group',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('customerGroup')}</Badge>,
  },
  {
    accessorKey: 'totalSpend',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Total Spend
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
    cell: ({ row }) => {
      const customer = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: customer.currency }).format(customer.totalSpend);
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
];

export const purchaseOrdersColumns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => {
        const po = row.original;
        return (
             <Link href={`/dashboard/purchase-orders/${po.id}`} className="font-medium hover:underline">
                {po.id}
            </Link>
        )
    }
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
     cell: ({ row }) => {
        const po = row.original;
        return (
             <Link href={`/dashboard/suppliers/${po.supplierId}`} className="font-medium hover:underline">
                {po.supplierName}
            </Link>
        )
    }
  },
  {
    accessorKey: 'orderDate',
    header: 'Order Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        <Badge variant={row.getValue('status') === 'Sent' ? 'secondary' : row.getValue('status') === 'Cancelled' ? 'destructive' : 'default'}>
          {row.getValue('status')}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'totalCost',
    header: 'Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalCost'));
      const currency = row.original.currency;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

export const transactionsColumns: ColumnDef<Transaction>[] = [
    { 
        accessorKey: 'date', 
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP')
    },
    { accessorKey: 'description', header: 'Description' },
    { 
        accessorKey: 'type', 
        header: 'Type',
        cell: ({ row }) => {
            const isIncome = row.getValue('type') === 'Income';
            return <Badge variant={isIncome ? 'default' : 'secondary'}>{row.getValue('type')}</Badge>
        }
    },
    { accessorKey: 'category', header: 'Category' },
    {
        accessorKey: 'amount',
        header: ({ column }) => (
          <div className="text-right">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('amount'));
          const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(amount);
          const amountClass = row.original.type === 'Income' ? 'text-green-600' : 'text-red-600';
          return <div className={cn('text-right font-medium', amountClass)}>{formatted}</div>;
        },
    },
];

