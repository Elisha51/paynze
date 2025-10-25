
'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, MessageCircle, Phone, Info, ArrowUpDown } from 'lucide-react';
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
import type { Customer } from '@/lib/types';
import { getCustomers } from '@/services/customers';
import { DataTable } from './data-table';
import Link from 'next/link';


const columns: ColumnDef<Customer>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
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
    cell: ({ row }) => {
        const customer = row.original;
        return (
            <div className="flex flex-col">
                <span>{customer.email}</span>
                <span className="text-muted-foreground">{customer.phone}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'customerGroup',
    header: 'Group',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('customerGroup')}</Badge>,
  },
  {
    accessorKey: 'lastOrderDate',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    accessorKey: 'totalSpend',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
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
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
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
                <Link href={`/dashboard/customers/${customer.id}`}>
                    <Info className="mr-2 h-4 w-4" />
                    View Details
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Send via WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Send via SMS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];

type CustomersTableProps = {
  cardTitle: string;
  cardDescription: string;
  filter?: {
    column: string;
    value: string;
  };
};

export function CustomersTable({ cardTitle, cardDescription, filter }: CustomersTableProps) {
  const [data, setData] = React.useState<Customer[]>([]);
  const [allData, setAllData] = React.useState<Customer[]>([]);

  React.useEffect(() => {
    async function loadCustomers() {
      const fetchedCustomers = await getCustomers();
      setAllData(fetchedCustomers);
    }
    loadCustomers();
  }, []);

  React.useEffect(() => {
    if (filter) {
      setData(allData.filter(item => (item as any)[filter.column] === filter.value));
    } else {
      setData(allData);
    }
  }, [allData, filter]);

  return (
    <DataTable
      columns={columns}
      data={data}
      cardTitle={cardTitle}
      cardDescription={cardDescription}
    />
  );
}
