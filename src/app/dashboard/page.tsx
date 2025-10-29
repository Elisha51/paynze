
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Package,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { QuickLinks } from '@/components/dashboard/quick-links';
import { getOrders } from '@/services/orders';
import { getCustomers } from '@/services/customers';
import { getProducts } from '@/services/products';
import type { Order, Customer, RecentSale, Staff, Product, OnboardingFormData } from '@/lib/types';
import { StaffWidget } from '@/components/dashboard/staff-widget';
import { getStaff, updateStaff } from '@/services/staff';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';


export default function DashboardPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [bonusStaff, setBonusStaff] = React.useState<Staff | null>(null);
  const [bonusAmount, setBonusAmount] = React.useState<number>(0);
  const [bonusReason, setBonusReason] = React.useState('');
  const { toast } = useToast();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });
  const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);


  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [orderData, customerData, staffData, productData] = await Promise.all([
      getOrders(),
      getCustomers(),
      getStaff(),
      getProducts(),
    ]);
    setOrders(orderData);
    setCustomers(customerData);
    setStaff(staffData);
    setProducts(productData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    loadData();
  }, [loadData]);
  
  const { filteredOrders, filteredCustomers } = React.useMemo(() => {
    if (!date?.from) {
        return { filteredOrders: orders, filteredCustomers: customers };
    }
    const fromDate = date.from;
    const toDate = date.to || new Date();

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= fromDate && orderDate <= toDate;
    });

    const filteredCustomers = customers.filter(customer => {
        if (!customer.createdAt) return false;
        const creationDate = new Date(customer.createdAt);
        return creationDate >= fromDate && creationDate <= toDate;
    });

    return { filteredOrders, filteredCustomers };
  }, [orders, customers, date]);


  // Metrics for the selected period
  const revenueInPeriod = filteredOrders.reduce((sum, order) => sum + (order.paymentStatus === 'Paid' ? order.total : 0), 0);
  const salesInPeriod = filteredOrders.length;
  const newCustomersInPeriod = filteredCustomers.length;
  
  const primaryCurrency = settings?.currency || 'UGX';

  // Overall metrics (not affected by date filter)
  const activeProducts = products.filter(p => p.status === 'published').length;
  const pendingOrders = orders.filter(o => ['Awaiting Payment', 'Paid', 'Ready for Pickup'].includes(o.status)).length;
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  const recentSales: RecentSale[] = orders.slice(0, 5).map(order => ({
      id: order.id,
      name: order.customerName,
      email: order.customerEmail,
      amount: `+${formatCurrency(order.total, primaryCurrency)}`,
      avatarId: `avatar-${(Math.floor(Math.random() * 5) + 1)}`,
      customerId: order.customerId,
  }));

  const handleAwardBonus = async () => {
      if (!bonusStaff || bonusAmount <= 0) {
          toast({ variant: 'destructive', title: 'Invalid bonus amount' });
          return;
      }
      
      const newBonus = {
          id: `bonus-${Date.now()}`,
          date: new Date().toISOString(),
          reason: bonusReason || 'Performance Bonus',
          amount: bonusAmount,
          awardedBy: 'admin',
      };
      
      const updatedStaffMember = {
          ...bonusStaff,
          totalCommission: (bonusStaff.totalCommission || 0) + bonusAmount,
          bonuses: [...(bonusStaff.bonuses || []), newBonus],
      };
      
      await updateStaff(updatedStaffMember);
      toast({ title: 'Bonus Awarded!', description: `${bonusStaff.name} has been awarded a bonus of ${formatCurrency(bonusAmount, primaryCurrency)}.`});
      setBonusStaff(null);
      setBonusAmount(0);
      setBonusReason('');
      loadData();
  }

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


  return (
    <>
    <div className="space-y-4">
        <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }]} />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
             <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
        </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueInPeriod, primaryCurrency)}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{salesInPeriod}</div>
            <p className="text-xs text-muted-foreground">
              Orders in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomersInPeriod}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total orders awaiting fulfillment
            </p>
          </CardContent>
        </Card>
      </div>
      <QuickLinks />
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart orders={filteredOrders} currency={primaryCurrency} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Your 5 most recent orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.map((sale) => {
                return (
                  <div key={sale.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://picsum.photos/seed/${sale.avatarId}/36/36`} alt="Avatar" />
                      <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <Link href={`/dashboard/customers/${sale.customerId}`}>
                        <p className="text-sm font-medium leading-none hover:underline">
                          {sale.name}
                        </p>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {sale.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Your Team</CardTitle>
          <CardDescription>An overview of your staff members and their online status.</CardDescription>
        </CardHeader>
        <CardContent>
            <StaffWidget staff={staff} isLoading={isLoading} onAwardBonus={setBonusStaff} />
        </CardContent>
      </Card>
    </div>

     <Dialog open={!!bonusStaff} onOpenChange={(isOpen) => !isOpen && setBonusStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Bonus to {bonusStaff?.name}</DialogTitle>
            <DialogDescription>
              Grant a one-time bonus for exceptional performance or other reasons. This will be added to their next payout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="bonusAmount">Bonus Amount ({primaryCurrency})</Label>
              <Input
                id="bonusAmount"
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(Number(e.target.value))}
                placeholder="e.g., 50000"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="bonusReason">Reason (Optional)</Label>
              <Input
                id="bonusReason"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
                placeholder="e.g., Exceeded monthly sales target"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAwardBonus}>
              <DollarSign className="mr-2 h-4 w-4" />
              Award Bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
