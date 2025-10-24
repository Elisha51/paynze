
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';


export default function OrdersPage() {

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const cta = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" />
      Create Order
    </Button>
  );

  return (
    <DashboardPageLayout
      title="Orders"
      tabs={tabs}
      cta={cta}
    >
      <DashboardPageLayout.TabContent value="all">
        <OrdersTable
            cardTitle="All Orders"
            cardDescription="View and manage all customer orders."
        />
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="pending">
        <OrdersTable
            filter={{ column: 'status', value: 'Pending' }}
            cardTitle="Pending Orders"
            cardDescription="View and manage all pending orders."
        />
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="delivered">
        <OrdersTable
            filter={{ column: 'status', value: 'Delivered' }}
            cardTitle="Delivered Orders"
            cardDescription="View and manage all delivered orders."
        />
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="cancelled">
        <OrdersTable
            filter={{ column: 'status', value: 'Cancelled' }}
            cardTitle="Cancelled Orders"
            cardDescription="View and manage all cancelled orders."
        />
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
