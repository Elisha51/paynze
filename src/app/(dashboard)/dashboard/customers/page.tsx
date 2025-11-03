
'use client';

import { PlusCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CustomersTable } from '@/components/dashboard/customers-table';
import { getCustomerColumns } from '@/components/dashboard/customers-columns';
import { useState, useEffect, useMemo } from 'react';
import type { Customer } from '@/lib/types';
import { getCustomers } from '@/services/customers';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { CustomerAnalyticsReport } from '@/components/dashboard/analytics/customer-analytics-report';
import { useAuth } from '@/context/auth-context';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-customers');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setIsLoading(false);
    }
    loadData();
  }, []);
  
  const columns = useMemo(() => {
    const canEdit = user?.permissions.customers.edit ?? false;
    const canDelete = user?.permissions.customers.delete ?? false;
    return getCustomerColumns(() => {}, canEdit, canDelete);
  }, [user]);

  const tabs = [
    { value: 'all-customers', label: 'All Customers' },
    { value: 'analytics', label: 'Analytics' },
  ];

  const ctaContent = activeTab === 'analytics'
    ? <DateRangePicker date={dateRange} setDate={setDateRange} />
    : (
        <div className="flex gap-2">
            <Button variant="outline"><Send className="mr-2 h-4 w-4" /> Message</Button>
            <Button asChild>
                <Link href="/dashboard/customers/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Link>
            </Button>
        </div>
      );

  return (
    <DashboardPageLayout 
        title="Customers"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={ctaContent}
    >
      <DashboardPageLayout.TabContent value="all-customers">
        <DashboardPageLayout.Content>
            <CustomersTable columns={columns} data={customers} isLoading={isLoading} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="analytics">
        <DashboardPageLayout.Content>
            <CustomerAnalyticsReport customers={customers} dateRange={dateRange} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
