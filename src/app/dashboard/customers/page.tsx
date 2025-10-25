
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomersTable } from '@/components/dashboard/customers-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function CustomersPage() {
  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retailer', label: 'Retailer' },
  ];

  const cta = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Customer
    </Button>
  );

  return (
    <DashboardPageLayout
      title="Customers"
      cta={cta}
    >
      <DashboardPageLayout.Content>
          <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue="all">
            <DashboardPageLayout.TabContent value="all">
                <CustomersTable
                cardTitle="All Customers"
                cardDescription="View, manage, and communicate with your customers."
                />
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="wholesale">
                <CustomersTable
                filter={{ column: 'customerGroup', value: 'Wholesaler' }}
                cardTitle="Wholesale Customers"
                cardDescription="View, manage, and communicate with your wholesale customers."
                />
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="retailer">
                <CustomersTable
                filter={{ column: 'customerGroup', value: 'Retailer' }}
                cardTitle="Retail Customers"
                cardDescription="View, manage, and communicate with your retail customers."
                />
            </DashboardPageLayout.TabContent>
          </DashboardPageLayout.FilterTabs>
      </DashboardPageLayout.Content>
    </DashboardPageLayout>
  );
}
