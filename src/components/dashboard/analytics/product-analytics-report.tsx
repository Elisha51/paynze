
'use client';
import { useMemo } from 'react';
import type { Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartConfig } from '@/components/ui/chart';
import Link from 'next/link';

const chartConfig = {
  unitsSold: {
    label: 'Units Sold',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


const getUnitsSold = (product: Product, dateRange?: DateRange) => {
    return product.variants.reduce((sum, v) => 
        sum + (v.stockAdjustments
            ?.filter(adj => {
                const adjDate = new Date(adj.date);
                const isInRange = (!dateRange?.from || adjDate >= dateRange.from) && (!dateRange?.to || adjDate <= dateRange.to);
                return adj.type === 'Sale' && isInRange;
            })
            .reduce((adjSum, adj) => adjSum + Math.abs(adj.quantity), 0) || 0)
    , 0);
}

const getAvailableStock = (product: Product) => {
    return product.variants.reduce((sum, v) => 
        sum + (v.stockByLocation?.reduce((locSum, loc) => locSum + loc.stock.available, 0) || 0), 0);
}


export function ProductAnalyticsReport({ products, dateRange }: { products: Product[], dateRange?: DateRange }) {

  const { summaryMetrics, chartData } = useMemo(() => {
    const productsWithSales = products
      .map(p => ({
        ...p,
        unitsSold: getUnitsSold(p, dateRange),
        netSales: getUnitsSold(p, dateRange) * p.retailPrice,
        profit: getUnitsSold(p, dateRange) * (p.retailPrice - (p.costPerItem || p.retailPrice))
      }))
      .filter(p => p.unitsSold > 0);

    const topSelling = [...productsWithSales].sort((a,b) => b.unitsSold - a.unitsSold)[0];
    const mostProfitable = [...productsWithSales].sort((a,b) => b.profit - a.profit)[0];
    
    const lowStockItems = products.filter(p => p.inventoryTracking !== "Don't Track" && getAvailableStock(p) <= (p.lowStockThreshold || 5)).length;

    const totalInventoryValue = products.reduce((sum, p) => {
        const stock = getAvailableStock(p);
        return sum + (stock * (p.costPerItem || p.retailPrice));
    }, 0);
    
    const top5Sold = [...productsWithSales].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

    return {
      summaryMetrics: {
        topSelling,
        mostProfitable,
        lowStockItems,
        totalInventoryValue
      },
      chartData: top5Sold.map(p => ({ name: p.name, unitsSold: p.unitsSold })).reverse()
    };
  }, [products, dateRange]);
  
  const formatCurrency = (amount: number) => {
    // A bit of a simplification, assuming currency from first product if available
    const currency = products[0]?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Selling Product</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryMetrics.topSelling ? (
                <>
                    <div className="text-lg font-bold truncate">
                        <Link href={`/dashboard/products/${summaryMetrics.topSelling.sku}`} className="hover:underline">{summaryMetrics.topSelling.name}</Link>
                    </div>
                    <p className="text-xs text-muted-foreground">{summaryMetrics.topSelling.unitsSold} units sold</p>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">No sales in this period.</p>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Profitable Product</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {summaryMetrics.mostProfitable ? (
                <>
                    <div className="text-lg font-bold truncate">
                         <Link href={`/dashboard/products/${summaryMetrics.mostProfitable.sku}`} className="hover:underline">{summaryMetrics.mostProfitable.name}</Link>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(summaryMetrics.mostProfitable.profit)} profit</p>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">No sales in this period.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items at or below threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Based on available stock cost</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Top 5 Selling Products</CardTitle>
          <CardDescription>By units sold in the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="aspect-video h-[300px] w-full">
              <BarChart layout="vertical" data={chartData} margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="unitsSold" layout="vertical" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
