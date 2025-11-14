
'use client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, ImageIcon, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order, Customer, PurchaseOrder, Transaction, OnboardingFormData, Campaign } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import React from 'react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


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
        const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

        React.useEffect(() => {
            const storedSettings = localStorage.getItem('onboardingData');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        }, []);
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
        const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

        React.useEffect(() => {
            const storedSettings = localStorage.getItem('onboardingData');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        }, []);
      const order = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.currency || 'UGX' }).format(order.total);
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
        const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

        React.useEffect(() => {
            const storedSettings = localStorage.getItem('onboardingData');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        }, []);

      const customer = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.currency || 'UGX' }).format(customer.totalSpend);
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
             <Link href={`/dashboard/procurement/purchase-orders/${po.id}`} className="font-medium hover:underline">
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
             <Link href={`/dashboard/procurement/suppliers/${po.supplierId}`} className="font-medium hover:underline">
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
      const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

        React.useEffect(() => {
            const storedSettings = localStorage.getItem('onboardingData');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        }, []);
      const amount = parseFloat(row.getValue('totalCost'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.currency || 'UGX' }).format(amount);
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
            const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

            React.useEffect(() => {
                const storedSettings = localStorage.getItem('onboardingData');
                if (storedSettings) {
                    setSettings(JSON.parse(storedSettings));
                }
            }, []);
          const amount = parseFloat(row.getValue('amount'));
          const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: settings?.currency || 'UGX' }).format(amount);
          const amountClass = row.original.type === 'Income' ? 'text-green-600' : 'text-red-600';
          return <div className={cn('text-right font-medium', amountClass)}>{formatted}</div>;
        },
    },
];

export const campaignColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: 'name',
    header: 'Campaign',
    cell: ({ row }) => {
        const campaign = row.original;
        return (
             <Link href={`/dashboard/marketing/campaigns/${campaign.id}/edit`} className="font-medium hover:underline">
                {campaign.name}
            </Link>
        )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('status')}</Badge>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'banner',
    header: 'Banner',
    cell: ({ row }) => {
        const campaign = row.original;
        return campaign.banner?.enabled ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : null;
    }
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'sent',
    header: 'Sent'
  },
  {
    accessorKey: 'ctr',
    header: 'CTR',
    cell: ({ row }) => `${row.getValue('ctr')}%`
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const campaign = row.original
 
      return (
        <AlertDialog>
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
                <Link href={`/dashboard/marketing/campaigns/${campaign.id}/edit`}><Edit className="mr-2 h-4 w-4"/> Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the campaign "{campaign.name}".
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => console.log('delete')} className="bg-destructive hover:bg-destructive/90">
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    },
  },
];
