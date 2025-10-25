
'use client';

import { PlusCircle, Upload, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ProductsTable } from '@/components/dashboard/products-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductPerformanceReport } from '@/components/dashboard/analytics/product-performance-report';
import { CategoriesTab } from '@/components/dashboard/categories-tab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  useEffect(() => {
    async function loadProducts() {
        setIsLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setIsLoading(false);
    }
    loadProducts();
  }, []);

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

  const tabs = [
      { value: 'products', label: 'All Products' },
      { value: 'categories', label: 'Categories' },
      { value: 'reports', label: 'Reports', className: 'flex items-center gap-2' },
  ];
  
  const filterTabs = [
      { value: 'all', label: 'All' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
  ]

  const cta = (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Add Product <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/products/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Manually
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/products/import">
                <Upload className="mr-2 h-4 w-4" />
                Import Products
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  return (
    <DashboardPageLayout
        title="Products"
        tabs={tabs}
        cta={cta}
    >
        <DashboardPageLayout.TabContent value="products">
            <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue='all'>
                 <DashboardPageLayout.TabContent value="all">
                    <ProductsTable
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', excludeValue: 'archived' }}
                    />
                </DashboardPageLayout.TabContent>
                <DashboardPageLayout.TabContent value="published">
                    <ProductsTable 
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', value: 'published' }}
                    />
                </DashboardPageLayout.TabContent>
                <DashboardPageLayout.TabContent value="draft">
                    <ProductsTable
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', value: 'draft' }}
                    />
                </DashboardPageLayout.TabContent>
                <DashboardPageLayout.TabContent value="archived">
                    <ProductsTable 
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', value: 'archived' }}
                    />
                </DashboardPageLayout.TabContent>
            </DashboardPageLayout.FilterTabs>
        </DashboardPageLayout.TabContent>

        <DashboardPageLayout.TabContent value="categories">
            <CategoriesTab />
        </DashboardPageLayout.TabContent>
        
        <DashboardPageLayout.TabContent value="reports">
            <Card>
                <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                    <div>
                        <CardTitle>Product Performance</CardTitle>
                        <CardDescription>
                            Analyze sales performance by product.
                        </CardDescription>
                    </div>
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
                </CardHeader>
                <CardContent className="space-y-4">
                    <ProductPerformanceReport products={products} dateRange={date} />
                </CardContent>
            </Card>
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
