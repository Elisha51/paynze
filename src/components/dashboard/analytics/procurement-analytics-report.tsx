
'use client';
import { useMemo } from 'react';
import type { PurchaseOrder } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, ShoppingCart, Truck, TrendingUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { DataTable } from '@/components/dashboard/data-table';
import { purchaseOrdersColumns } from './report-columns';

export function ProcurementAnalyticsReport({ purchaseOrders, dateRange }: { purchaseOrders: PurchaseOrder[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return purchaseOrders.filter(po => {
        if (!dateRange?.from) return true;
        const orderDate = new Date(po.orderDate);
        return orderDate >= dateRange.from && orderDate <= (dateRange.to || new Date());
    });
  }, [purchaseOrders, dateRange]);

  const { summaryMetrics, chartData } = useMemo(() => {
    const currency = reportData.length > 0 ? reportData[0].currency : 'UGX';

    if (reportData.length === 0) {
      return { 
        summaryMetrics: { totalSpend: 0, totalPOs: 0, avgPOValue: 0, topSupplier: 'N/A', currency },
        chartData: []
      };
    }
    const totalSpend = reportData.reduce((sum, row) => sum + row.totalCost, 0);
    const totalPOs = reportData.length;
    const avgPOValue = totalPOs > 0 ? totalSpend / totalPOs : 0;
    
    const spendBySupplier: {[key: string]: number} = {};
    reportData.forEach(po => {
        spendBySupplier[po.supplierName] = (spendBySupplier[po.supplierName] || 0) + po.totalCost;
    });
    const topSupplier = Object.keys(spendBySupplier).reduce((a, b) => spendBySupplier[a] > spendBySupplier[b] ? a : b, 'N/A');

    const spendByDate: {[key: string]: number} = {};
    reportData.forEach(po => {
        const date = new Date(po.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        spendByDate[date] = (spendByDate[date] || 0) + po.totalCost;
    });

    const formattedChartData = Object.keys(spendByDate).map(date => ({
        date,
        spend: spendByDate[date]
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      summaryMetrics: {
        totalSpend,
        totalPOs,
        avgPOValue,
        topSupplier,
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
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalSpend)}</div>
            <p className="text-xs text-muted-foreground">Total cost of all POs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalPOs}</div>
            <p className="text-xs text-muted-foreground">Number of purchase orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. PO Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.avgPOValue)}</div>
            <p className="text-xs text-muted-foreground">Average amount per PO</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Supplier</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{summaryMetrics.topSupplier}</div>
            <p className="text-xs text-muted-foreground">By total spend in period</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Procurement Spend</CardTitle>
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
                    <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Purchase Order History</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={purchaseOrdersColumns}
                data={reportData}
            />
        </CardContent>
      </Card>
    </div>
  );
}
