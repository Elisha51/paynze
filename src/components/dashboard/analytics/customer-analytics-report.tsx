
'use client';
import { useMemo } from 'react';
import type { Customer } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Users, UserPlus, Repeat, UserCheck } from 'lucide-react';
import { DateRange } from 'react-day-picker';


export function CustomerAnalyticsReport({ customers, dateRange }: { customers: Customer[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return customers.filter(customer => {
        if (!dateRange?.from || !customer.createdAt) return true;
        const creationDate = new Date(customer.createdAt);
        return creationDate >= dateRange.from && creationDate <= (dateRange.to || new Date());
    });
  }, [customers, dateRange]);

  const summaryMetrics = useMemo(() => {
    if (reportData.length === 0) {
      return { newCustomers: 0, returningCustomers: 0, vipCustomers: 0 };
    }
    
    const newCustomers = reportData.length;
    const returningCustomers = customers.length - newCustomers; // Simplistic
    const vipCustomers = reportData.filter(c => c.customerGroup === 'Wholesaler').length;


    return {
      newCustomers,
      returningCustomers,
      vipCustomers,
    };
  }, [reportData, customers]);

  return (
    <div className="space-y-4">
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
            <p className="text-xs text-muted-foreground">Made more than one purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP / Wholesale</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.vipCustomers}</div>
            <p className="text-xs text-muted-foreground">Customers in special groups</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>A detailed chart showing customer acquisition trends will be available here.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Chart Placeholder
        </CardContent>
      </Card>
    </div>
  );
}
