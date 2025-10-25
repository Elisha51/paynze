
'use client';

import { PlusCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/dashboard/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    type: 'Income' | 'Expense';
    category: string;
    status: 'Cleared' | 'Pending';
};

const transactions: Transaction[] = [
    { id: 'TRN-001', date: '2024-07-15', description: 'Sale from Order #ORD-001', amount: 75000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Cleared' },
    { id: 'TRN-002', date: '2024-07-14', description: 'Purchase Order #PO-002', amount: -1300000, currency: 'UGX', type: 'Expense', category: 'Inventory', status: 'Pending' },
    { id: 'TRN-003', date: '2024-07-14', description: 'Sale from Order #ORD-002', amount: 35000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Cleared' },
];

const columns: ColumnDef<Transaction>[] = [
    { accessorKey: 'date', header: 'Date' },
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
          return <div className={`text-right font-medium ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatted}</div>;
        },
    },
    {
        id: 'actions',
        cell: () => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
    },
];

export default function FinancesPage() {

  const mainTabs = [
    { value: 'transactions', label: 'Transactions' },
    { value: 'reconciliation', label: 'Reconciliation' },
    { value: 'reports', label: 'Reports' },
  ];

  const cta = (
    <div className="flex gap-2">
        <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
        </Button>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
        </Button>
    </div>
  );

  return (
    <DashboardPageLayout title="Finances" tabs={mainTabs} cta={cta}>
      <DashboardPageLayout.TabContent value="transactions">
        <Card>
          <CardContent className="pt-6">
            <DataTable columns={columns} data={transactions} />
          </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="reconciliation">
        <Card>
            <CardHeader>
                <CardTitle>Reconciliation</CardTitle>
                <CardDescription>Match your recorded transactions against your bank or mobile money statements.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-12">Reconciliation feature coming soon.</p>
            </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>Analyze your income, expenses, and overall financial health.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-center text-muted-foreground py-12">Detailed financial reports coming soon.</p>
          </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
