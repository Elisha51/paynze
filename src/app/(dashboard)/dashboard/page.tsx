
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, DollarSign, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { Order, RecentSale, OnboardingFormData, Staff } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { getCustomers } from '@/services/customers';
import { getStaff, addTransaction } from '@/services/finances';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { QuickLinks } from '@/components/dashboard/quick-links';
import { StaffWidget } from '@/components/dashboard/staff-widget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

function RecentSales({ sales }: { sales: RecentSale[] }) {
    const formatAmount = (amountStr: string) => {
        const parts = amountStr.split(' ');
        if (parts.length < 2) return amountStr;
        const amount = parseFloat(parts[1].replace(/,/g, ''));
        const currency = parts[0].replace(/[+-]/g, '');
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          You made {sales.length} sales this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://picsum.photos/seed/${sale.avatarId}/36/36`} alt="Avatar" />
                        <AvatarFallback>{getInitials(sale.name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{sale.name}</p>
                        <p className="text-sm text-muted-foreground">{sale.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatAmount(sale.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
    const [bonusDetails, setBonusDetails] = useState({ staffId: '', amount: 0, reason: '' });
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [ordersData, customersData, staffData] = await Promise.all([
                getOrders(),
                getCustomers(),
                getStaff(),
            ]);
            
            const storedSettings = localStorage.getItem('onboardingData');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }

            setOrders(ordersData);
            setCustomers(customersData);
            setStaff(staffData.filter(s => s.role !== 'Affiliate'));
            setIsLoading(false);
        }
        loadData();
    }, []);

    const { totalRevenue, salesCount, newCustomers, recentSales, currency } = useMemo(() => {
        const currencyCode = settings?.currency || 'UGX';
        const revenue = orders
            .filter(o => o.status === 'Delivered' || o.status === 'Picked Up' || o.status === 'Paid')
            .reduce((sum, order) => sum + order.total, 0);

        const sales = orders.length;

        // Simplistic new customer calculation for the last 30 days
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        const newCusts = customers.filter(c => c.createdAt && new Date(c.createdAt) > oneMonthAgo).length;
        
        const recent: RecentSale[] = orders.slice(0, 5).map(o => ({
            id: o.id,
            name: o.customerName,
            email: o.customerEmail,
            amount: `+${currencyCode} ${o.total.toLocaleString()}`,
            avatarId: o.customerId,
            customerId: o.customerId,
        }));
        
        return {
            totalRevenue: revenue,
            salesCount: sales,
            newCustomers: newCusts,
            recentSales: recent,
            currency: currencyCode,
        }
    }, [orders, customers, settings]);
    
    const handleOpenBonusDialog = (member: Staff) => {
        setBonusDetails({ staffId: member.id, amount: 0, reason: ''});
        setIsBonusDialogOpen(true);
    }
    
    const handleAwardBonus = async () => {
      if (!bonusDetails.staffId || bonusDetails.amount <= 0 || !bonusDetails.reason) {
          toast({ variant: 'destructive', title: 'Please fill all bonus details.' });
          return;
      }
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
  }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-4 w-40" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="pl-2">
                           <Skeleton className="h-[350px] w-full" />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                         <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <QuickLinks />
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                        Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                        Based on delivered & paid orders
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesCount}</div>
                        <p className="text-xs text-muted-foreground">
                        Total orders in the last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{newCustomers}</div>
                        <p className="text-xs text-muted-foreground">
                        In the last 30 days
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">View Storefront</CardTitle>
                         <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Button size="sm" className="w-full" asChild>
                            <Link href="/" target="_blank">
                                View Live Store
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 h-[350px]">
                    <OverviewChart orders={orders} currency={currency} />
                </CardContent>
                </Card>
                <RecentSales sales={recentSales} />
            </div>

            <StaffWidget staff={staff} isLoading={isLoading} onAwardBonus={handleOpenBonusDialog} />

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
                            <Input id="amount" type="number" value={bonusDetails.amount} onChange={(e) => setBonusDetails({...bonusDetails, amount: Number(e.target.value)})} />
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
        </div>
    )
}

    