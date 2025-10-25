
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
    accessorKey: 'lastOrder',
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
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('totalSpend')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
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
            <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Send via WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Send via SMS
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Info className="mr-2 h-4 w-4" />
                View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];

type CustomersTableProps = {
  filter?: {
    column: string;
    value: string;
  };
  cardTitle: string;
  cardDescription: string;
};

export function CustomersTable({ filter, cardTitle, cardDescription }: CustomersTableProps) {
  const [data, setData] = React.useState<Customer[]>([]);

  React.useEffect(() => {
    async function loadCustomers() {
      const fetchedCustomers = await getCustomers();
      setData(fetchedCustomers);
    }
    loadCustomers();
  }, []);

  return (
    <DataTable
      columns={columns}
      data={data}
      filter={filter}
    />
  );
}
