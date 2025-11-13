
'use client';

import { PlusCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CustomersTable } from '@/components/dashboard/customers-table';
import { useState, useEffect, useCallback } from 'react';
import type { Customer } from '@/lib/types';
import { getCustomers } from '@/services/customers';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { CustomerAnalyticsReport } from '@/components/dashboard/analytics/customer-analytics-report';
import { useAuth } from '@/context/auth-context';
import { CustomerGroupsTab } from '@/components/dashboard/customer-groups-tab';
import type { ColumnFiltersState } from '@tanstack/react-table';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-customers');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { user } = useAuth();

  const canCreate = user?.permissions.customers.create;
  const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise' || process.env.NODE_ENV === 'development';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await getCustomers(user || undefined);
    setCustomers(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if(user) {
        loadData();
    }
  }, [loadData, user]);

  const tabs = [
    { value: 'all-customers', label: 'All Customers' },
    { value: 'groups', label: 'Groups' },
  ];

  if (canViewAnalytics) {
    tabs.push({ value: 'analytics', label: 'Analytics' });
  }
  
  const ctaContent = activeTab === 'analytics'
    ? <DateRangePicker date={dateRange} setDate={setDateRange} />
    : ( canCreate && activeTab === 'all-customers' && (
        <div className="flex gap-2">
             {canCreate && (
                <Button asChild>
                    <Link href="/dashboard/customers/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Link>
                </Button>
            )}
        </div>
      )
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
            <CustomersTable 
              data={customers} 
              setData={setCustomers} 
              isLoading={isLoading} 
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
            />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
       <DashboardPageLayout.TabContent value="groups">
        <DashboardPageLayout.Content>
            <CustomerGroupsTab customers={customers} isLoading={isLoading} setCustomers={setCustomers} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      {canViewAnalytics && (
        <DashboardPageLayout.TabContent value="analytics">
          <DashboardPageLayout.Content>
              <CustomerAnalyticsReport customers={customers} dateRange={dateRange} />
          </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
      )}
    </DashboardPageLayout>
  );
}
