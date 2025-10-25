
'use client';
import { useMemo } from 'react';
import type { Order } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartConfig, ChartContainer } from '@/components/ui/chart';
import { DataTable } from '@/components/dashboard/data-table';
import { ordersColumns } from './report-columns';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function OrderAnalyticsReport({ orders, dateRange }: { orders: Order[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return orders.filter(order => {
        if (!dateRange?.from) return true;
        const orderDate = new Date(order.date);
        return orderDate >= dateRange.from && orderDate <= (dateRange.to || new Date());
    });
  }, [orders, dateRange]);

  const { summaryMetrics, chartData } = useMemo(() => {
    const currency = reportData.length > 0 ? reportData[0].currency : 'UGX';
    
    if (reportData.length === 0) {
      return { 
        summaryMetrics: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, newCustomers: 0, currency },
        chartData: []
      };
    }
    const totalRevenue = reportData.reduce((sum, row) => sum + row.total, 0);
    const totalOrders = reportData.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Simplistic new customer calculation
    const uniqueCustomers = new Set(reportData.map(o => o.customerId));
    const newCustomers = uniqueCustomers.size;
    
    const salesByDate: {[key: string]: number} = {};
    reportData.forEach(order => {
        const date = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        salesByDate[date] = (salesByDate[date] || 0) + order.total;
    });

    const formattedChartData = Object.keys(salesByDate).map(date => ({
        date,
        sales: salesByDate[date]
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      summaryMetrics: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        newCustomers,
        currency,
      },
      chartData: formattedChartData
    };
  }, [reportData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: summaryMetrics.currency }).format(amount);
  };

  const formatCurrencyForChart = (value: number) => {
    if (value >= 1000000) return `${formatCurrency(value / 1000000)}M`;
    if (value >= 1000) return `${formatCurrency(value / 1000)}k`;
    return formatCurrency(value);
  }

  return (
    <div className="space-y-6">
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
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatCurrencyForChart(value)}
                    />
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent
                            formatter={(value) => formatCurrency(value as number)}
                            indicator="dot"
                        />}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={ordersColumns}
                data={reportData}
            />
        </CardContent>
      </Card>
    </div>
  );
}
