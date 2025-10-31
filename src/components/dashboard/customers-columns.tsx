'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, MessageCircle, Phone, Info, ArrowUpDown, Send } from 'lucide-react';
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
import type { Customer, OnboardingFormData } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export const getCustomerColumns = (): ColumnDef<Customer>[] => {
  const { user } = useAuth();
  const canEdit = user?.permissions.customers.edit;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/dashboard/customers/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.email}</span>
          <span className="text-muted-foreground">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: 'customerGroup',
      header: 'Group',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('customerGroup')}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'lastOrderDate',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Last Order <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'totalSpend',
      header: ({ column }) => (
        <div className="text-right">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Total Spend <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const customer = row.original;
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: customer.currency }).format(customer.totalSpend);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      header: () => <div className="text-right sticky right-0">Actions</div>,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="bg-background text-right sticky right-0">
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
                  <Link href={`/dashboard/customers/${customer.id}`}>
                    <Info className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuItem onSelect={() => console.log('This should trigger the message dialog')}>
                      <MessageCircle className="mr-2 h-4 w-4" /> Send via WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log('This should trigger the message dialog')}>
                      <Phone className="mr-2 h-4 w-4" /> Send via SMS
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
