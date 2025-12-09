
'use client';
import { useState, useEffect } from 'react';
import type { Transaction, Role, Staff } from '@/lib/types';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Bot, HelpCircle } from 'lucide-react';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { getTransactions, addTransaction } from '@/services/finances';
import { getStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { DailySummary } from '@/components/dashboard/daily-summary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { reconcileTransactions, ReconciliationInput, ReconciliationOutput } from '@/ai/flows/reconcile-transactions';
import { ReconciliationReport } from '@/components/dashboard/reconciliation-report';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { FinanceAnalyticsReport } from '@/components/dashboard/analytics/finance-analytics-report';
import { PayoutsReport } from '@/components/dashboard/payouts-report';
import { FileUploader } from '@/components/ui/file-uploader';
import { ReconciliationGuide } from '@/components/dashboard/reconciliation-guide';


type ActiveTab = 'transactions' | 'commissions' | 'summary' | 'reconciliation' | 'analytics';

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');
  const [isTxnDialogOpen, setIsTxnDialogOpen] = useState(false);
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
  const [isReconDialogOpen, setIsReconDialogOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [newTxn, setNewTxn] = useState<Omit<Transaction, 'id' | 'currency'>>({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'Expense',
      category: 'Other',
      status: 'Cleared',
      paymentMethod: 'Cash',
  });
  const [bonusDetails, setBonusDetails] = useState({ staffId: '', amount: 0, reason: '' });
  const { toast } = useToast();
  
  const [statementFile, setStatementFile] = useState<File[]>([]);
  const [reconResult, setReconResult] = useState<ReconciliationOutput | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);


  const loadData = async () => {
    setIsLoading(true);
    const [transactionsData, staffData, rolesData] = await Promise.all([
      getTransactions(),
      getStaff(),
      getRoles(),
    ]);
    setTransactions(transactionsData);
    setStaff(staffData);
    setRoles(rolesData);
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadData();
  }, []);

  const handleAddTransaction = async () => {
      if (!newTxn.description || newTxn.amount === 0) {
          toast({ variant: 'destructive', title: 'Please fill all required fields.' });
          return;
      }
      const amount = newTxn.type === 'Expense' ? -Math.abs(newTxn.amount) : Math.abs(newTxn.amount);
      await addTransaction({ ...newTxn, amount });
      toast({ title: 'Transaction Added' });
      setIsTxnDialogOpen(false);
      loadData();
  }

  const handleAwardBonus = async () => {
      if (!bonusDetails.staffId || bonusDetails.amount <= 0 || !bonusDetails.reason) {
          toast({ variant: 'destructive', title: 'Please fill all bonus details.' });
          return;
      }
      // This is a simulation. A real app would have a dedicated bonus service.
      // For now, we'll create an expense transaction.
      const staffMember = staff.find(s => s.id === bonusDetails.staffId);
      if (!staffMember) return;

      await addTransaction({
          date: new Date().toISOString(),
          description: `Bonus for ${staffMember.name}: ${bonusDetails.reason}`,
          amount: -bonusDetails.amount,
          type: 'Expense',
          category: 'Salaries',
          status: 'Pending',
          paymentMethod: 'Other',
      });
      toast({ title: 'Bonus Awarded', description: `An expense has been logged for ${staffMember.name}.` });
      setIsBonusDialogOpen(false);
      loadData();
  }
  
  const handleRunReconciliation = async () => {
    if (statementFile.length === 0) {
      toast({ variant: 'destructive', title: 'Please upload a statement file.' });
      return;
    }
    setIsReconciling(true);
    setReconResult(null);

    const file = statementFile[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
        const fileContent = event.target?.result as string;

        const input: ReconciliationInput = {
            statement: fileContent,
            recordedTransactions: transactions,
        };

        try {
            const result = await reconcileTransactions(input);
            setReconResult(result);
            setStatementFile([]);
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Reconciliation Failed',
                description: 'The AI model might be offline or there was an issue with your data.',
            });
        } finally {
            setIsReconciling(false);
            setIsReconDialogOpen(false);
        }
    };
    
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'Failed to read file.' });
      setIsReconciling(false);
    };

    reader.readAsText(file);
  };
  
  const tabs: { value: ActiveTab, label: string }[] = [
    { value: 'transactions', label: 'All Transactions' },
    { value: 'summary', label: 'Daily Summary' },
    { value: 'commissions', label: 'Commissions & Payouts' },
    { value: 'analytics', label: 'Analytics' }
  ];
  if (transactions.length > 0) {
    tabs.push({ value: 'reconciliation', label: 'Reconciliation' });
  }

  const ctaContent = activeTab === 'analytics'
    ? <DateRangePicker date={dateRange} setDate={setDateRange} />
    : (
      <div className="flex gap-2">
        <Button onClick={() => setIsReconDialogOpen(true)} variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            AI Reconciliation
        </Button>
        <Button onClick={() => setIsTxnDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
        </Button>
       </div>
    );

  return (
    <>
      <DashboardPageLayout
        title="Finances"
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as ActiveTab)}
        tabs={tabs}
        cta={ctaContent}
      >
        <DashboardPageLayout.TabContent value="transactions">
            <DashboardPageLayout.Content>
                <TransactionsTable transactions={transactions} isLoading={isLoading} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="summary">
            <DashboardPageLayout.Content>
                <DailySummary transactions={transactions} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="commissions">
            <DashboardPageLayout.Content>
                 <PayoutsReport 
                    staff={staff} 
                    roles={roles}
                    onAwardBonus={() => setIsBonusDialogOpen(true)}
                 />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="reconciliation">
            <DashboardPageLayout.Content>
              {isReconciling ? (
                <div className="text-center py-12">
                  <Bot className="mx-auto h-12 w-12 animate-pulse text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">Reconciling...</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The AI is analyzing your statement and transactions. This may take a moment.
                  </p>
                </div>
              ) : reconResult ? (
                <ReconciliationReport result={reconResult} />
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Ready to Reconcile</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                    Click the "AI Reconciliation" button, upload your bank or mobile money statement, and let the AI do the heavy lifting.
                  </p>
                   <Button variant="link" onClick={() => setIsGuideOpen(true)}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        How to prepare your file
                    </Button>
                </div>
              )}
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="analytics">
          <DashboardPageLayout.Content>
            <FinanceAnalyticsReport transactions={transactions} dateRange={dateRange} />
          </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
      </DashboardPageLayout>

      <Dialog open={isTxnDialogOpen} onOpenChange={setIsTxnDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Input id="desc" value={newTxn.description} onChange={(e) => setNewTxn({...newTxn, description: e.target.value})} placeholder="e.g., Purchase of office supplies" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                         <Select value={newTxn.type} onValueChange={(v) => setNewTxn({...newTxn, type: v as 'Income' | 'Expense'})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Income">Income</SelectItem>
                                <SelectItem value="Expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={newTxn.amount} onChange={(e) => setNewTxn({...newTxn, amount: Number(e.target.value)})} placeholder="0.00" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                         <Select value={newTxn.category} onValueChange={(v) => setNewTxn({...newTxn, category: v as any})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {['Sales', 'Inventory', 'Utilities', 'Salaries', 'Marketing', 'Other'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                         <Select value={newTxn.paymentMethod} onValueChange={(v) => setNewTxn({...newTxn, paymentMethod: v as any})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {['Cash', 'Mobile Money', 'Bank Transfer', 'Card', 'Other'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAddTransaction}>Add Transaction</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Award Bonus / Adjustment</DialogTitle>
                <DialogDescription>Log a bonus or other payment adjustment for a staff member. This will create an expense transaction.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="staffId">Staff Member</Label>
                    <Select value={bonusDetails.staffId} onValueChange={(v) => setBonusDetails({...bonusDetails, staffId: v})}>
                        <SelectTrigger><SelectValue placeholder="Select staff..." /></SelectTrigger>
                        <SelectContent>
                            {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" value={bonusDetails.amount} onChange={(e) => setBonusDetails({...bonusDetails, amount: Number(e.target.value)})} placeholder="0.00" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input id="reason" value={bonusDetails.reason} onChange={(e) => setBonusDetails({...bonusDetails, reason: e.target.value})} placeholder="e.g. Q2 Performance Bonus"/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAwardBonus}>Award Bonus</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReconDialogOpen} onOpenChange={setIsReconDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>AI Bank Reconciliation</DialogTitle>
                <DialogDescription>Upload a CSV file of your bank or mobile money statement. The AI will compare it against your recorded transactions.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <FileUploader
                    files={statementFile}
                    onFilesChange={setStatementFile}
                    maxFiles={1}
                    accept={{ 'text/csv': ['.csv'] }}
                />
                 <Button variant="link" onClick={() => setIsGuideOpen(true)} className="p-0 h-auto">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    How to prepare your file
                </Button>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleRunReconciliation} disabled={isReconciling || statementFile.length === 0}>
                    <Bot className="mr-2 h-4 w-4" />
                    {isReconciling ? 'Reconciling...' : 'Run Reconciliation'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <DialogContent className="max-w-2xl">
             <DialogHeader>
                <DialogTitle>Preparing Your Statement File</DialogTitle>
                <DialogDescription>Follow these steps to ensure your file is processed correctly by the AI.</DialogDescription>
            </DialogHeader>
             <ReconciliationGuide />
             <DialogFooter>
                 <DialogClose asChild><Button>Got it</Button></DialogClose>
             </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
