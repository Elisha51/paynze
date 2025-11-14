
'use client';
import { useMemo } from 'react';
import type { Order, OnboardingFormData } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { ChartTooltipContent, ChartConfig, ChartContainer } from '@/components/ui/chart';
import { DataTable } from '@/components/dashboard/data-table';
import { ordersColumns } from './report-columns';
import React from 'react';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
  Online: {
    label: 'Online',
    color: 'hsl(var(--chart-1))',
  },
  Manual: {
    label: 'Manual',
    color: 'hsl(var(--chart-2))',
  },
  POS: {
    label: 'POS',
    color: 'hsl(var(--chart-3))'
  }
} satisfies ChartConfig;

export function OrderAnalyticsReport({ orders, dateRange }: { orders: Order[], dateRange?: DateRange }) {
    const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);

    React.useEffect(() => {
        const storedSettings = localStorage.getItem('onboardingData');
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, []);

  const reportData = useMemo(() => {
    return orders.filter(order => {
        if (!dateRange?.from) return true;
        const orderDate = new Date(order.date);
        return orderDate >= dateRange.from && orderDate <= (dateRange.to || new Date());
    });
  }, [orders, dateRange]);

  const { summaryMetrics, chartData, channelData } = useMemo(() => {
    const currency = settings?.currency || 'UGX';
    
    if (reportData.length === 0) {
      return { 
        summaryMetrics: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, newCustomers: 0, currency },
        chartData: [],
        channelData: []
      };
    }
    const totalRevenue = reportData.reduce((sum, row) => sum + (row.payment?.status === 'completed' ? row.total : 0), 0);
    const totalOrders = reportData.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Simplistic new customer calculation
    const uniqueCustomers = new Set(reportData.map(o => o.customerId));
    const newCustomers = uniqueCustomers.size;
    
    const salesByDate: {[key: string]: number} = {};
    reportData.forEach(order => {
        if (order.payment?.status === 'completed') {
            const date = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            salesByDate[date] = (salesByDate[date] || 0) + order.total;
        }
    });

    const formattedChartData = Object.keys(salesByDate).map(date => ({
        date,
        sales: salesByDate[date]
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const salesByChannel: {[key: string]: { name: string, value: number, fill: string }} = {};
    reportData.forEach(order => {
        const channel = order.channel || 'Unknown';
        if (!salesByChannel[channel]) {
            salesByChannel[channel] = { 
                name: channel, 
                value: 0,
                fill: `var(--color-${channel})`
            };
        }
        if (order.payment?.status === 'completed') {
            salesByChannel[channel].value += order.total;
        }
    });

    return {
      summaryMetrics: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        newCustomers,
        currency,
      },
      chartData: formattedChartData,
      channelData: Object.values(salesByChannel),
    };
  }, [reportData, settings]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: summaryMetrics.currency }).format(amount);
  };

  const formatCurrencyForChart = (value: number) => {
    if (value >= 1000000) return `${formatCurrency(value / 1000000)}M`;
    if (value >= 1000) return `${formatCurrency(value / 1000)}k`;
    return formatCurrency(value);
  }
  
  const showChannelBreakdown = channelData.length > 1;

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className={showChannelBreakdown ? "lg:col-span-3" : "lg:col-span-5"}>
            <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-video">
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
                </ChartContainer>
            </CardContent>
        </Card>
        {showChannelBreakdown && (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Sales by Channel</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square">
                        <PieChart>
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent
                                    hideLabel
                                    formatter={(value) => formatCurrency(value as number)}
                                />}
                            />
                            <Pie
                                data={channelData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {channelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        )}
      </div>
      
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
