
'use client';

import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { OrderAnalyticsReport } from '@/components/dashboard/analytics/order-analytics-report';
import { getOrders } from '@/services/orders';
import { Order } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { OrdersTable } from '@/components/dashboard/orders-table';


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  useEffect(() => {
    async function loadOrders() {
        setIsLoading(true);
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
        setIsLoading(false);
    }
    loadOrders();
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


  const mainTabs = [
      { value: 'all', label: 'All Orders' },
      { value: 'reports', label: 'Reports' },
  ];

  const cta = (
    <Button asChild>
      <Link href="/dashboard/orders/add">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Order
      </Link>
    </Button>
  );

  return (
    <DashboardPageLayout
      title="Orders"
      tabs={mainTabs}
      cta={cta}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        <DashboardPageLayout.TabContent value="all">
            <OrdersTable orders={orders} isLoading={isLoading} />
        </DashboardPageLayout.TabContent>

        <DashboardPageLayout.TabContent value="reports">
             <Card>
                <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                    <div>
                        <CardTitle>Orders Report</CardTitle>
                        <CardDescription>
                            Analyze sales and order volume over time.
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
                    <OrderAnalyticsReport orders={orders} dateRange={date} />
                </CardContent>
            </Card>
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
