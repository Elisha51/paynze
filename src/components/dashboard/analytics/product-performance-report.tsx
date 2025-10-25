
'use client';
import { useState, useEffect, useMemo } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, DollarSign, Package, TrendingUp, ShoppingBasket, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ReportRow = {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  unitsSold: number;
  netSales: number;
  currency: string;
};

const getColumns = (currency: string): ColumnDef<ReportRow>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product/Variant
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
       <div className="flex flex-col">
          <Link href={`/dashboard/products/${row.original.sku}`} className="font-medium hover:underline">{row.original.name}</Link>
          <span className="text-xs text-muted-foreground">{row.original.sku}</span>
        </div>
    )
  },
  {
    accessorKey: 'unitsSold',
    header: ({ column }) => (
       <div className="text-center">
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            Units Sold
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('unitsSold')}</div>,
  },
  {
    accessorKey: 'netSales',
    header: ({ column }) => (
      <div className="text-right">
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            Net Sales
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('netSales'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

export function ProductPerformanceReport({ products }: { products: Product[] }) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const reportData = useMemo(() => {
    const data: ReportRow[] = [];
    products.forEach(product => {
       if (product.hasVariants) {
            product.variants.forEach(variant => {
                const salesAdjustments = (variant.stockAdjustments || [])
                    .filter(adj => {
                        const adjDate = new Date(adj.date);
                        return adj.type === 'Sale' &&
                               (!date?.from || adjDate >= date.from) &&
                               (!date?.to || adjDate <= date.to);
                    });

                if (salesAdjustments.length > 0) {
                    const unitsSold = salesAdjustments.reduce((sum, adj) => sum + Math.abs(adj.quantity), 0);
                    const price = variant.price ?? product.retailPrice;
                    const netSales = unitsSold * price;

                    data.push({
                        productId: product.sku || product.name,
                        variantId: variant.id,
                        name: `${product.name} - ${Object.values(variant.optionValues).join(' / ')}`,
                        sku: variant.sku || product.sku || 'N/A',
                        unitsSold,
                        netSales,
                        currency: product.currency,
                    });
                }
            });
       } else {
           const variant = product.variants[0];
           if (variant) {
                const salesAdjustments = (variant.stockAdjustments || [])
                    .filter(adj => {
                        const adjDate = new Date(adj.date);
                        return adj.type === 'Sale' &&
                               (!date?.from || adjDate >= date.from) &&
                               (!date?.to || adjDate <= date.to);
                    });
                if (salesAdjustments.length > 0) {
                    const unitsSold = salesAdjustments.reduce((sum, adj) => sum + Math.abs(adj.quantity), 0);
                    const price = product.retailPrice;
                    const netSales = unitsSold * price;
                    data.push({
                        productId: product.sku || product.name,
                        variantId: variant.id,
                        name: product.name,
                        sku: product.sku || 'N/A',
                        unitsSold,
                        netSales,
                        currency: product.currency,
                    });
                }
           }
       }
    });
    return data;
  }, [products, date]);

  const summaryMetrics = useMemo(() => {
    if (reportData.length === 0) {
      return { totalRevenue: 0, productsSold: 0, unitsSold: 0, bestSeller: 'N/A', currency: products[0]?.currency || 'UGX' };
    }
    const totalRevenue = reportData.reduce((sum, row) => sum + row.netSales, 0);
    const unitsSold = reportData.reduce((sum, row) => sum + row.unitsSold, 0);
    const bestSeller = reportData.reduce((best, row) => row.unitsSold > best.unitsSold ? row : best, reportData[0]);

    return {
      totalRevenue,
      productsSold: reportData.length,
      unitsSold,
      bestSeller: bestSeller.name,
      currency: reportData[0].currency,
    };
  }, [reportData, products]);

  const currency = products[0]?.currency || 'UGX';
  const columns = useMemo(() => getColumns(currency), [currency]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: summaryMetrics.currency || 'UGX' }).format(amount);
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

  return (
    <div className="space-y-4">
        <div className="flex justify-end items-center gap-2">
            <Select onValueChange={handlePresetChange} defaultValue="last-30">
                <SelectTrigger className="w-[180px]">
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
                    "w-[300px] justify-start text-left font-normal",
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From all product sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.productsSold}</div>
            <p className="text-xs text-muted-foreground">Unique products/variants with sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.unitsSold}</div>
            <p className="text-xs text-muted-foreground">Total items sold across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Seller (Units)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{summaryMetrics.bestSeller}</div>
            <p className="text-xs text-muted-foreground">Top product by units sold</p>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={reportData} />
    </div>
  );
}
