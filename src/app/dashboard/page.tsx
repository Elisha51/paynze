

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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { QuickLinks } from '@/components/dashboard/quick-links';
import { getOrders } from '@/services/orders';
import { getCustomers } from '@/services/customers';
import type { Order, Customer, RecentSale, Staff } from '@/lib/types';
import { StaffWidget } from '@/components/dashboard/staff-widget';
import { getStaff, updateStaff } from '@/services/staff';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [bonusStaff, setBonusStaff] = React.useState<Staff | null>(null);
  const [bonusAmount, setBonusAmount] = React.useState<number>(0);
  const [bonusReason, setBonusReason] = React.useState('');
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [orderData, customerData, staffData] = await Promise.all([
      getOrders(),
      getCustomers(),
      getStaff()
    ]);
    setOrders(orderData);
    setCustomers(customerData);
    setStaff(staffData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
  const totalRevenue = orders.reduce((sum, order) => sum + (order.paymentStatus === 'Paid' ? order.total : 0), 0);
  const totalSales = orders.length;
  const totalCustomers = customers.length;
  const currency = orders.length > 0 ? orders[0].currency : 'UGX';
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  const recentSales: RecentSale[] = orders.slice(0, 5).map(order => ({
      id: order.id,
      name: order.customerName,
      email: order.customerEmail,
      amount: `+${formatCurrency(order.total)}`,
      avatarId: `avatar-${(Math.floor(Math.random() * 5) + 1)}`
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
      toast({ title: 'Bonus Awarded!', description: `${bonusStaff.name} has been awarded a bonus of ${bonusAmount}.`});
      setBonusStaff(null);
      setBonusAmount(0);
      setBonusReason('');
      loadData();
  }


  return (
    <>
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Based on all paid orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Total customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Total orders placed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour (mock)
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
            <OverviewChart orders={orders} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Your most recent orders.
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
                      <p className="text-sm font-medium leading-none">
                        {sale.name}
                      </p>
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
              <Label htmlFor="bonusAmount">Bonus Amount ({bonusStaff?.currency})</Label>
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
