
'use client';

import { PlusCircle, Download, Calendar as CalendarIcon, Upload, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import type { Transaction, Staff, Role, Order, OnboardingFormData, Bonus } from '@/lib/types';
import { getTransactions, addTransaction } from '@/services/finances';
import { getStaff, updateStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { getOrders } from '@/services/orders';
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
import { format, addDays } from 'date-fns';
import { DailySummary } from '@/components/dashboard/daily-summary';
import { FileUploader } from '@/components/ui/file-uploader';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { FinanceAnalyticsReport } from '@/components/dashboard/analytics/finance-analytics-report';
import { reconcileTransactions, type ReconciliationOutput } from '@/ai/flows/reconcile-transactions';
import { ReconciliationReport } from '@/components/dashboard/reconciliation-report';
import { CommissionReport } from '@/components/dashboard/commission-report';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const emptyTransaction: Omit<Transaction, 'id' | 'date' | 'currency'> = {
  description: '',
  amount: 0,
  type: 'Expense',
  category: 'Other',
  status: 'Pending',
  paymentMethod: 'Cash',
};

export default function FinancesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const activeTab = searchParams.get('tab') || 'transactions';

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [staffAndAffiliates, setStaffAndAffiliates] = React.useState<Staff[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = React.useState(false);
  const [isAwardBonusOpen, setIsAwardBonusOpen] = React.useState(false);
  const [newTransaction, setNewTransaction] = React.useState(emptyTransaction);
  const [statementFile, setStatementFile] = React.useState<File[]>([]);
  const [isReconciling, setIsReconciling] = React.useState(false);
  const [reconciliationResult, setReconciliationResult] = React.useState<ReconciliationOutput | null>(null);
  const { toast } = useToast();
   const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });
  const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);
  
  // Manual bonus state
  const [bonusStaffId, setBonusStaffId] = React.useState<string | null>(null);
  const [bonusAmount, setBonusAmount] = React.useState<number>(0);
  const [bonusReason, setBonusReason] = React.useState('');

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [fetchedTransactions, fetchedStaff, fetchedRoles, fetchedOrders] = await Promise.all([
      getTransactions(),
      getStaff(), 
      getRoles(), 
      getOrders()
    ]);
    setTransactions(fetchedTransactions);
    setStaffAndAffiliates(fetchedStaff);
    setRoles(fetchedRoles);
    setOrders(fetchedOrders);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    const storedSettings = localStorage.getItem('onboardingData');
    if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
    }
    loadData();
  }, [loadData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewTransaction(prev => ({...prev, [id]: value}));
  };
  
  const handleSelectChange = (field: keyof typeof emptyTransaction, value: string) => {
    setNewTransaction(prev => ({...prev, [field]: value as any}));
  }
  
  const handleTabChange = (tab: string) => {
    router.push(`${pathname}?tab=${tab}`);
  };
  
  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'today':
        setDate({ from: now, to: now });
        break;
      case 'last-7':
        setDate({ from: addDays(now, -6), to: now });
        break;
      case 'last-30':
        setDate({ from: addDays(now, -29), to: now });
        break;
      case 'ytd':
        setDate({ from: new Date(now.getFullYear(), 0, 1), to: now });
        break;
      default:
        setDate(undefined);
    }
  };


  const handleAddTransaction = async () => {
    if (!newTransaction.description || newTransaction.amount === 0 || !settings?.currency) {
        toast({ variant: 'destructive', title: 'Missing required fields' });
        return;
    }
    const finalAmount = newTransaction.type === 'Expense' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount);
    const transactionToAdd = { 
        ...newTransaction, 
        amount: finalAmount, 
        currency: settings.currency,
        date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    await addTransaction(transactionToAdd);
    toast({ title: 'Transaction Added' });
    setIsAddTransactionOpen(false);
    setNewTransaction(emptyTransaction);
    loadData();
  }
  
  const handleStartReconciliation = async () => {
    if (statementFile.length === 0) {
      toast({ variant: 'destructive', title: 'No file uploaded' });
      return;
    }

    setIsReconciling(true);
    setReconciliationResult(null);

    const file = statementFile[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
        try {
            const statementText = event.target?.result as string;
            
            const transactionsForPeriod = transactions.filter(t => {
                if (!date?.from) return true;
                const transactionDate = new Date(t.date);
                return transactionDate >= date.from && transactionDate <= (date.to || new Date());
            });

            const result = await reconcileTransactions({
                statement: statementText,
                recordedTransactions: transactionsForPeriod,
            });
            setReconciliationResult(result);
            toast({ title: "Reconciliation Complete", description: "AI analysis finished successfully." });
        } catch (error) {
            console.error("AI flow 'reconcileTransactions' is offline:", error);
            toast({ variant: 'destructive', title: 'Reconciliation Failed', description: 'The AI analysis could not be completed.' });
        } finally {
            setIsReconciling(false);
        }
    };
    
    reader.onerror = () => {
      toast({ variant: 'destructive', title: 'Error Reading File', description: 'Could not read the uploaded statement file.'});
      setIsReconciling(false);
    }
    
    reader.readAsText(file);
  };
  
  const handleAwardBonus = async () => {
    if (!bonusStaffId || !bonusAmount) {
        toast({ variant: 'destructive', title: 'Please select a staff member and enter an amount.' });
        return;
    }

    const staffMember = staffAndAffiliates.find(s => s.id === bonusStaffId);
    if (!staffMember) {
        toast({ variant: 'destructive', title: 'Staff member not found.' });
        return;
    }

    const newBonus: Bonus = {
        id: `bonus-${Date.now()}`,
        date: new Date().toISOString(),
        reason: bonusReason || 'Manual Award',
        amount: bonusAmount,
        awardedBy: user?.name || 'Admin',
    };
    
    const updatedStaff: Staff = {
        ...staffMember,
        bonuses: [...(staffMember.bonuses || []), newBonus],
        totalCommission: (staffMember.totalCommission || 0) + bonusAmount,
    };

    await updateStaff(updatedStaff);
    toast({
        title: 'Award Successful',
        description: `${staffMember.name} has been awarded ${bonusAmount} ${settings?.currency}.`,
    });
    
    // Reset and close
    setIsAwardBonusOpen(false);
    setBonusStaffId(null);
    setBonusAmount(0);
    setBonusReason('');
    loadData(); // Reload all data to reflect changes
  };

  const staffMembers = staffAndAffiliates.filter(s => s.role !== 'Affiliate');
  const affiliates = staffAndAffiliates.filter(s => s.role === 'Affiliate');
  
  const canCreateTransactions = user?.permissions.finances.create;


  const mainTabs = [
    { value: 'transactions', label: 'Transactions' },
    { value: 'summary', label: 'Summary' },
    { value: 'reconciliation', label: 'Reconciliation' },
    { value: 'payouts', label: 'Payouts' },
    { value: 'analytics', label: 'Analytics' },
  ];

  const cta = (
    canCreateTransactions && (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 px-2.5 sm:px-4" asChild>
                <a href="/transactions_sample.csv" download>
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline-flex">Export</span>
                </a>
            </Button>
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
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
                                <Input id="currency" value={settings?.currency || ''} disabled/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select onValueChange={(v) => handleSelectChange('paymentMethod', v)} defaultValue={newTransaction.paymentMethod}>
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
    )
  );

  return (
    <>
    <DashboardPageLayout 
        title="Finances" 
        tabs={mainTabs} 
        cta={cta}
        activeTab={activeTab}
        onTabChange={handleTabChange}
    >
      <DashboardPageLayout.TabContent value="transactions">
        <TransactionsTable
            transactions={transactions}
            isLoading={isLoading}
        />
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="summary">
        <DailySummary transactions={transactions} />
      </DashboardPageLayout.TabContent>
      
      <DashboardPageLayout.TabContent value="reconciliation">
        <div className="space-y-6">
          <Card>
              <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                  <div>
                    <CardTitle>Reconciliation</CardTitle>
                    <CardDescription>Upload your bank or mobile money statements to match against your recorded transactions.</CardDescription>
                  </div>
                   <div className="flex items-center gap-2 w-full lg:w-auto">
                        <Select onValueChange={handlePresetChange} defaultValue="last-30">
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Select a preset" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="last-7">Last 7 days</SelectItem>
                                <SelectItem value="last-30">Last 30 days</SelectItem>
                                <SelectItem value="ytd">Year to date</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full lg:w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
              </CardHeader>
              <CardContent className="space-y-6">
                  <FileUploader
                      files={statementFile}
                      onFilesChange={setStatementFile}
                      maxFiles={1}
                      accept={{ 'text/csv': ['.csv'], 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] }}
                  />
                  <Button onClick={handleStartReconciliation} disabled={statementFile.length === 0 || isReconciling}>
                      <Upload className="mr-2 h-4 w-4"/>
                      {isReconciling ? 'Analyzing...' : 'Start Reconciliation'}
                  </Button>
              </CardContent>
          </Card>
          {isReconciling && (
              <Card>
                  <CardContent className="p-6 text-center">
                    <p>Analyzing statement... Please wait.</p>
                  </CardContent>
              </Card>
          )}
          {reconciliationResult && (
            <ReconciliationReport result={reconciliationResult} />
          )}
        </div>
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="payouts">
        <div className="space-y-6">
            <CommissionReport 
                type="staff"
                title="Staff Commissions &amp; Bonuses"
                description="View unpaid earnings and process payouts for your internal team members."
                staff={staffMembers} 
                roles={roles} 
                orders={orders} 
                onPayout={loadData}
                onAwardBonus={() => setIsAwardBonusOpen(true)}
            />
             <CommissionReport 
                type="affiliate"
                title="Affiliate Payouts"
                description="View unpaid earnings and process payouts for your marketing affiliates."
                staff={affiliates} 
                roles={roles} 
                orders={orders} 
                onPayout={loadData}
                onAwardBonus={() => setIsAwardBonusOpen(true)}
                cta={
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/marketing?tab=affiliates">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Affiliates
                        </Link>
                    </Button>
                }
            />
        </div>
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="analytics">
            <Card>
                <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                    <div>
                        <CardTitle>Financial Analytics</CardTitle>
                        <CardDescription>
                            Analyze income, expenses, and profitability over time.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2 w-full lg:w-auto">
                        <Select onValueChange={handlePresetChange} defaultValue="last-30">
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Select a preset" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="last-7">Last 7 days</SelectItem>
                                <SelectItem value="last-30">Last 30 days</SelectItem>
                                <SelectItem value="ytd">Year to date</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full lg:w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FinanceAnalyticsReport transactions={transactions} dateRange={date} />
                </CardContent>
            </Card>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>

    <Dialog open={isAwardBonusOpen} onOpenChange={setIsAwardBonusOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Award Bonus or Manual Payout</DialogTitle>
                <DialogDescription>
                    Manually add a bonus or commission adjustment for a staff member. This will be added to their unpaid balance.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="bonus-staff">Staff Member</Label>
                    <Select value={bonusStaffId || undefined} onValueChange={setBonusStaffId}>
                        <SelectTrigger id="bonus-staff">
                            <SelectValue placeholder="Select a staff member" />
                        </SelectTrigger>
                        <SelectContent>
                            {staffAndAffiliates.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="bonus-amount">Amount ({settings?.currency || ''})</Label>
                    <Input id="bonus-amount" type="number" value={bonusAmount} onChange={e => setBonusAmount(Number(e.target.value))} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="bonus-reason">Reason</Label>
                    <Textarea id="bonus-reason" value={bonusReason} onChange={e => setBonusReason(e.target.value)} placeholder="e.g., End of year bonus, Commission for offline sale" />
                 </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAwardBonus}>
                    <Award className="mr-2 h-4 w-4" />
                    Award
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
