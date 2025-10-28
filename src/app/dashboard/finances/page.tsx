

'use client';

import { PlusCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
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
import { DailySummary } from '@/components/dashboard/daily-summary';
import { FileUploader } from '@/components/ui/file-uploader';
import { Upload } from 'lucide-react';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const emptyTransaction: Omit<Transaction, 'id' | 'date'> = {
  description: '',
  amount: 0,
  currency: 'UGX',
  type: 'Expense',
  category: 'Other',
  status: 'Pending',
  paymentMethod: 'Cash',
};

export default function FinancesPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('transactions');
  const [newTransaction, setNewTransaction] = React.useState(emptyTransaction);
  const [statementFile, setStatementFile] = React.useState<File[]>([]);
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const fetchedTransactions = await getTransactions();
    setTransactions(fetchedTransactions);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
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
        date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    await addTransaction(transactionToAdd);
    toast({ title: 'Transaction Added' });
    setIsDialogOpen(false);
    setNewTransaction(emptyTransaction);
    loadData();
  }

  const mainTabs = [
    { value: 'transactions', label: 'All Transactions' },
    { value: 'summary', label: 'Daily Summary' },
    { value: 'reconciliation', label: 'Reconciliation' },
  ];
  
   const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'cleared', label: 'Cleared' },
    { value: 'pending', label: 'Pending' },
  ];


  const cta = (
    <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-9 px-2.5 sm:px-4">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline-flex">Export</span>
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-9 px-2.5 sm:px-4">
                    <PlusCircle className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline-flex">Add Transaction</span>
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
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select onValueChange={(v) => handleSelectChange('paymentMethod', v as Transaction['paymentMethod'])} defaultValue={newTransaction.paymentMethod}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
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
    <DashboardPageLayout 
        title="Finances" 
        tabs={mainTabs} 
        cta={cta}
        activeTab={activeTab}
        onTabChange={setActiveTab}
    >
      <DashboardPageLayout.TabContent value="transactions">
          <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue="all">
            <DashboardPageLayout.TabContent value="all">
                <TransactionsTable
                  transactions={transactions}
                  isLoading={isLoading}
                />
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="cleared">
                <TransactionsTable
                  transactions={transactions}
                  isLoading={isLoading}
                  filter={{ column: 'status', value: 'Cleared' }}
                />
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="pending">
                <TransactionsTable
                  transactions={transactions}
                  isLoading={isLoading}
                  filter={{ column: 'status', value: 'Pending' }}
                />
            </DashboardPageLayout.TabContent>
          </DashboardPageLayout.FilterTabs>
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="summary">
        <DailySummary transactions={transactions} />
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="reconciliation">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reconciliation</CardTitle>
                    <CardDescription>Upload your bank or mobile money statements to match against your recorded transactions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FileUploader
                        files={statementFile}
                        onFilesChange={setStatementFile}
                        maxFiles={1}
                        accept={{ 'text/csv': ['.csv'], 'application/pdf': ['.pdf'] }}
                    />
                    <Button disabled={statementFile.length === 0}>
                        <Upload className="mr-2 h-4 w-4"/>
                        Start Reconciliation
                    </Button>
                </CardContent>
            </Card>
        </div>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
