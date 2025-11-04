

'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, PlusCircle, FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Transaction, OnboardingFormData } from '@/lib/types';
import { DataTable } from './data-table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';


const getColumns = (currency: string): ColumnDef<Transaction>[] => [
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
        accessorKey: 'date', 
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP p')
    },
    { 
        accessorKey: 'description', 
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Description
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )
    },
    { 
        accessorKey: 'type', 
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isIncome = row.getValue('type') === 'Income';
            return <Badge variant={isIncome ? 'default' : 'secondary'}>{row.getValue('type')}</Badge>
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    { 
        accessorKey: 'paymentMethod', 
        header: 'Payment Method',
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    { 
        accessorKey: 'category', 
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    { 
        accessorKey: 'status', 
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.getValue('status') === 'Cleared' ? 'secondary' : 'outline'}>{row.getValue('status')}</Badge>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
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
          const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
          const amountClass = row.original.type === 'Income' ? 'text-green-600' : 'text-red-600';
          return <div className={cn('text-right font-medium', amountClass)}>{formatted}</div>;
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
          <div className="relative bg-background text-right sticky right-0">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Mark as Cleared</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
    },
];

type TransactionsTableProps = {
  transactions: Transaction[];
  isLoading: boolean;
};

const transactionTypes = [
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' },
];

const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Card', label: 'Card' },
    { value: 'Other', label: 'Other' },
];

const transactionStatuses = [
    { value: 'Cleared', label: 'Cleared' },
    { value: 'Pending', label: 'Pending' },
];


export function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
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
      data={transactions}
      isLoading={isLoading}
      filters={[
        {
          columnId: 'status',
          title: 'Status',
          options: transactionStatuses,
        },
        {
          columnId: 'type',
          title: 'Type',
          options: transactionTypes,
        },
        {
          columnId: 'paymentMethod',
          title: 'Payment Method',
          options: paymentMethods,
        }
      ]}
      emptyState={{
        icon: FileText,
        title: 'No Transactions Yet',
        description: "When you make sales or record expenses, they'll appear here.",
        cta: (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Transaction
            </Button>
        )
      }}
    />
  );
}
