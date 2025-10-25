
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
import type { Transaction } from '@/lib/types';
import { getTransactions, addTransaction } from '@/services/finances';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
          const amountClass = amount >= 0 ? 'text-green-600' : 'text-red-600';
          return <div className={`text-right font-medium ${amountClass}`}>{formatted}</div>;
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
    },
];

const emptyTransaction: Omit<Transaction, 'id' | 'date'> = {
  description: '',
  amount: 0,
  currency: 'UGX',
  type: 'Expense',
  category: 'Other',
  status: 'Pending',
};

export default function FinancesPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newTransaction, setNewTransaction] = React.useState(emptyTransaction);
  const { toast } = useToast();

  const loadTransactions = React.useCallback(async () => {
    setIsLoading(true);
    const fetched = await getTransactions();
    setTransactions(fetched);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewTransaction(prev => ({...prev, [id]: value}));
  };
  
  const handleSelectChange = (field: keyof typeof emptyTransaction, value: string) => {
    setNewTransaction(prev => ({...prev, [field]: value}));
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.description || newTransaction.amount === 0) {
        toast({ variant: 'destructive', title: 'Missing required fields' });
        return;
    }
    const finalAmount = newTransaction.type === 'Expense' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount);
    const transactionToAdd = { 
        ...newTransaction, 
        amount: finalAmount, 
        date: format(new Date(), 'yyyy-MM-dd')
    };

    await addTransaction(transactionToAdd);
    toast({ title: 'Transaction Added' });
    setIsDialogOpen(false);
    setNewTransaction(emptyTransaction);
    loadTransactions();
  }

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>Record a new income or expense entry.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select onValueChange={(v) => handleSelectChange('type', v)} defaultValue={newTransaction.type}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Income">Income</SelectItem>
                                <SelectItem value="Expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={newTransaction.description} onChange={handleInputChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" value={newTransaction.amount} onChange={e => setNewTransaction(p => ({...p, amount: Number(e.target.value)}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select onValueChange={(v) => handleSelectChange('currency', v)} defaultValue={newTransaction.currency}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UGX">UGX</SelectItem>
                                    <SelectItem value="KES">KES</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={(v) => handleSelectChange('category', v)} defaultValue={newTransaction.category}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Inventory">Inventory</SelectItem>
                                <SelectItem value="Utilities">Utilities</SelectItem>
                                <SelectItem value="Salaries">Salaries</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={(v) => handleSelectChange('status', v)} defaultValue={newTransaction.status}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Cleared">Cleared</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAddTransaction}>Save Transaction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
