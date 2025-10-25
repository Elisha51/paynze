
'use client';
import { useMemo } from 'react';
import type { PurchaseOrder } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { DollarSign, ShoppingCart, Truck, TrendingUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';


export function ProcurementAnalyticsReport({ purchaseOrders, dateRange }: { purchaseOrders: PurchaseOrder[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return purchaseOrders.filter(po => {
        if (!dateRange?.from) return true;
        const orderDate = new Date(po.orderDate);
        return orderDate >= dateRange.from && orderDate <= (dateRange.to || new Date());
    });
  }, [purchaseOrders, dateRange]);

  const summaryMetrics = useMemo(() => {
    if (reportData.length === 0) {
      return { totalSpend: 0, totalPOs: 0, avgPOValue: 0, topSupplier: 'N/A', currency: 'UGX' };
    }
    const totalSpend = reportData.reduce((sum, row) => sum + row.totalCost, 0);
    const totalPOs = reportData.length;
    const avgPOValue = totalSpend / totalPOs;
    
    // Top supplier by spend
    const spendBySupplier: {[key: string]: number} = {};
    reportData.forEach(po => {
        spendBySupplier[po.supplierName] = (spendBySupplier[po.supplierName] || 0) + po.totalCost;
    });

    const topSupplier = Object.keys(spendBySupplier).reduce((a, b) => spendBySupplier[a] > spendBySupplier[b] ? a : b, 'N/A');


    return {
      totalSpend,
      totalPOs,
      avgPOValue,
      topSupplier,
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
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>A detailed chart showing procurement spending trends will be available here.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Chart Placeholder
        </CardContent>
      </Card>
    </div>
  );
}
