

'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Info, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Customer } from '@/lib/types';
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

export const getCustomerColumns = (onDelete: (customerId: string) => void, canEdit: boolean, canDelete: boolean): ColumnDef<Customer>[] => {

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
      accessorKey: 'createdAt',
      header: 'Date Added',
      cell: ({row}) => row.original.createdAt ? formatDistanceToNow(new Date(row.original.createdAt)) : 'N/A'
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('source')}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdByName',
      header: 'Added By',
       filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'totalSpend',
      header: ({ column }) => {
        return (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Total Spend <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const customer = row.original;
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: customer.currency }).format(customer.totalSpend);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="text-right">
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
                      <Link href={`/dashboard/customers/${customer.id}`}>
                        <Info className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    {canEdit && (
                       <DropdownMenuItem asChild>
                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                           <Edit className="mr-2 h-4 w-4" /> Edit Customer
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer "{customer.name}" and all their associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(customer.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];
};
