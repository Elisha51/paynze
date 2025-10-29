
'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, MessageCircle, Phone, Info, ArrowUpDown, PlusCircle } from 'lucide-react';
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
import { DataTable } from './data-table';
import Link from 'next/link';
import { Users } from 'lucide-react';


const customerGroups = [
    { value: 'default', label: 'Default' },
    { value: 'Wholesaler', label: 'Wholesaler' },
    { value: 'Retailer', label: 'Retailer' },
];


const getColumns = (currency: string): ColumnDef<Customer>[] => [
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
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
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
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(customer.totalSpend);
      return <div className="text-right font-medium">{formatted}</div>
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
  customers: Customer[];
  isLoading: boolean;
};

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
    const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

    React.useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const columns = React.useMemo(() => getColumns(settings?.currency || 'UGX'), [settings?.currency]);
  return (
    <DataTable
      columns={columns}
      data={customers}
      filters={[{
        columnId: 'customerGroup',
        title: 'Group',
        options: customerGroups
      }]}
      emptyState={{
        icon: Users,
        title: "No Customers Yet",
        description: "You haven't added any customers. Add your first customer to get started.",
        cta: (
            <Button asChild>
                <Link href="/dashboard/customers/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Link>
            </Button>
        )
      }}
    />
  );
}
