
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
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { CustomerGroupsTab } from '@/components/dashboard/customer-groups-tab';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-customers');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [initialFilter, setInitialFilter] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const canCreate = user?.permissions.customers.create;
  const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise' || process.env.NODE_ENV === 'development';
  const pathname = usePathname();

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
  }, [loadData, user, pathname]);
  
  useEffect(() => {
    const groupFilter = searchParams.get('group');
    if (groupFilter) {
        setActiveTab('all-customers');
        setInitialFilter(groupFilter);
        // Optional: remove the query param after applying the filter to clean up the URL
        router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

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
    
    const handleTabChange = (tab: string) => {
        if (tab !== 'all-customers') {
            setInitialFilter(null);
        }
        setActiveTab(tab);
    };

  return (
    <DashboardPageLayout 
        title="Customers"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cta={ctaContent}
    >
      <DashboardPageLayout.TabContent value="all-customers">
        <DashboardPageLayout.Content>
            <CustomersTable data={customers} setData={setCustomers} isLoading={isLoading} initialGroupFilter={initialFilter} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
       <DashboardPageLayout.TabContent value="groups">
        <DashboardPageLayout.Content>
            <CustomerGroupsTab customers={customers} isLoading={isLoading} />
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
