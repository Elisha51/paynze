
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
import type { Transaction } from '@/lib/types';
import { DataTable } from './data-table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


const getColumns = (): ColumnDef<Transaction>[] => [
    { 
        accessorKey: 'date', 
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP p')
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
    { accessorKey: 'paymentMethod', header: 'Payment Method' },
    { accessorKey: 'category', header: 'Category' },
    { 
        accessorKey: 'status', 
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.getValue('status') === 'Cleared' ? 'secondary' : 'outline'}>{row.getValue('status')}</Badge>
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
          const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(amount);
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
  filter?: {
    column: string;
    value: string;
  };
};

export function TransactionsTable({ transactions, isLoading, filter }: TransactionsTableProps) {
  const [data, setData] = React.useState<Transaction[]>([]);

  React.useEffect(() => {
    if (filter) {
      setData(transactions.filter(item => (item as any)[filter.column] === filter.value));
    } else {
      setData(transactions);
    }
  }, [transactions, filter]);
  
  const columns = React.useMemo(() => getColumns(), []);

  return (
    <DataTable
      columns={columns}
      data={data}
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
