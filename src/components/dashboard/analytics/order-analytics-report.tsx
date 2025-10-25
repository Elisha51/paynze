
'use client';
import { useMemo } from 'react';
import type { Order } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';


export function OrderAnalyticsReport({ orders, dateRange }: { orders: Order[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return orders.filter(order => {
        if (!dateRange?.from) return true;
        const orderDate = new Date(order.date);
        return orderDate >= dateRange.from && orderDate <= (dateRange.to || new Date());
    });
  }, [orders, dateRange]);

  const summaryMetrics = useMemo(() => {
    if (reportData.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, newCustomers: 0, currency: 'UGX' };
    }
    const totalRevenue = reportData.reduce((sum, row) => sum + row.total, 0);
    const totalOrders = reportData.length;
    const avgOrderValue = totalRevenue / totalOrders;
    
    // Simplistic new customer calculation
    const uniqueCustomers = new Set(reportData.map(o => o.customerId));
    const newCustomers = uniqueCustomers.size;


    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      newCustomers,
      currency: reportData[0].currency,
    };
  }, [reportData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: summaryMetrics.currency || 'UGX' }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From all sales in the period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Number of orders placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Average amount per order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summaryMetrics.newCustomers}</div>
            <p className="text-xs text-muted-foreground">Customers with their first order</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>A detailed time-series chart showing sales trends will be available here.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Chart Placeholder
        </CardContent>
      </Card>
    </div>
  );
}
