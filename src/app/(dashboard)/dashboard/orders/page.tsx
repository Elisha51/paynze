
'use client';

import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { useState, useEffect, useCallback } from 'react';
import type { Order, Staff } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { OrdersDeliveriesTable } from '@/components/dashboard/orders-deliveries-table';
import { getStaff } from '@/services/staff';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { OrderAnalyticsReport } from '@/components/dashboard/analytics/order-analytics-report';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { OrdersPickupsTable } from '@/components/dashboard/orders-pickups-table';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all-orders');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { user } = useAuth();
  const pathname = usePathname();
  
  const canCreate = user?.permissions.orders.create;
  const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise' || process.env.NODE_ENV === 'development';

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    const statusParams = searchParams.getAll('status');
    const fulfillmentParam = searchParams.get('fulfillmentMethod');

    if (statusParams.length > 0) {
        filters.push({ id: 'status', value: statusParams });
    }
    if (fulfillmentParam) {
        filters.push({ id: 'fulfillmentMethod', value: [fulfillmentParam] });
    }
    return filters;
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [fetchedOrders, fetchedStaff] = await Promise.all([
        getOrders(),
        getStaff(),
    ]);

    // Manually link assigned orders to staff members after fetching
    const staffWithOrders = fetchedStaff.map(s => {
        return {
            ...s,
            assignedOrders: fetchedOrders.filter(o => o.assignedStaffId === s.id),
        };
    });

    setOrders(fetchedOrders);
    setStaff(staffWithOrders);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, pathname]);

  const tabs = [
    { value: 'all-orders', label: 'All Orders' },
    { value: 'deliveries', label: 'Deliveries' },
    { value: 'pickups', label: 'Pickups' },
  ];
  
  if (canViewAnalytics) {
    tabs.push({ value: 'analytics', label: 'Analytics' });
  }
  
  const ctaContent = activeTab === 'analytics'
    ? <DateRangePicker date={dateRange} setDate={setDateRange} />
    : ( canCreate && activeTab === 'all-orders' && (
         <Button asChild>
            <Link href="/dashboard/orders/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Order
            </Link>
        </Button>
      )
    );

  return (
    <DashboardPageLayout 
        title="Orders"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={ctaContent}
    >
        <DashboardPageLayout.TabContent value="all-orders">
            <DashboardPageLayout.Content>
                <OrdersTable 
                    orders={orders} 
                    staff={staff} 
                    isLoading={isLoading} 
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="deliveries">
            <DashboardPageLayout.Content>
                <OrdersDeliveriesTable orders={orders} staff={staff} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
         <DashboardPageLayout.TabContent value="pickups">
            <DashboardPageLayout.Content>
                <OrdersPickupsTable orders={orders} isLoading={isLoading} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        {canViewAnalytics && (
          <DashboardPageLayout.TabContent value="analytics">
              <DashboardPageLayout.Content>
                  <OrderAnalyticsReport orders={orders} dateRange={dateRange} />
              </DashboardPageLayout.Content>
          </DashboardPageLayout.TabContent>
        )}
    </DashboardPageLayout>
  );
}
