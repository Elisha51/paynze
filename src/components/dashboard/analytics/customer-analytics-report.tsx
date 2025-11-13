
'use client';
import { useMemo } from 'react';
import type { Customer } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserPlus, Repeat, UserCheck } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartConfig } from '@/components/ui/chart';
import { DataTable } from '@/components/dashboard/data-table';
import { customersColumns } from './report-columns';

const chartConfig = {
  customers: {
    label: 'Customers',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function CustomerAnalyticsReport({ customers, dateRange }: { customers: Customer[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return customers.filter(customer => {
        if (!dateRange?.from || !customer.createdAt) return true;
        const creationDate = new Date(customer.createdAt);
        return creationDate >= dateRange.from && creationDate <= (dateRange.to || new Date());
    });
  }, [customers, dateRange]);

  const { summaryMetrics, chartData } = useMemo(() => {
    if (reportData.length === 0) {
      return { 
        summaryMetrics: { newCustomers: 0, returningCustomers: 0, vipCustomers: 0 },
        chartData: []
      };
    }
    
    const newCustomersCount = reportData.length;
    // This is a simplification. A real calculation would be more complex.
    const returningCustomers = customers.length - newCustomersCount; 
    const vipCustomers = reportData.filter(c => c.customerGroup === 'Wholesaler').length;
    
    const customersByDate: {[key: string]: number} = {};
    reportData.forEach(customer => {
        if (customer.createdAt) {
            const date = new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            customersByDate[date] = (customersByDate[date] || 0) + 1;
        }
    });

    const formattedChartData = Object.keys(customersByDate).map(date => ({
        date,
        customers: customersByDate[date]
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return {
      summaryMetrics: {
        newCustomers: newCustomersCount,
        returningCustomers,
        vipCustomers,
      },
      chartData: formattedChartData
    };
  }, [reportData, customers]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summaryMetrics.newCustomers}</div>
            <p className="text-xs text-muted-foreground">Acquired in this period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returning Customers</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.returningCustomers}</div>
            <p className="text-xs text-muted-foreground">(Simplistic calculation)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP / Wholesale</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.vipCustomers}</div>
            <p className="text-xs text-muted-foreground">New customers in special groups</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
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
                      allowDecimals={false}
                  />
                  <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>New Customer List</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={customersColumns}
                data={reportData}
                isLoading={false}
            />
        </CardContent>
      </Card>
    </div>
  );
}
