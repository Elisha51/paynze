'use client';

import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { useState, useEffect } from 'react';
import type { Order, Staff } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { OrdersDeliveriesTable } from '@/components/dashboard/orders-deliveries-table';
import { getStaff } from '@/services/staff';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-orders');
  const { user } = useAuth();
  
  const canCreate = user?.permissions.orders.create;

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const [fetchedOrders, fetchedStaff] = await Promise.all([
            getOrders(),
            getStaff(),
        ]);
        setOrders(fetchedOrders);
        setStaff(fetchedStaff);
        setIsLoading(false);
    }
    loadData();
  }, []);

  const tabs = [
    { value: 'all-orders', label: 'All Orders' },
    { value: 'deliveries', label: 'Deliveries' },
  ];

  return (
    <DashboardPageLayout 
        title="Orders"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={
            canCreate ? (
                 <Button asChild>
                    <Link href="/dashboard/orders/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Order
                    </Link>
                </Button>
            ) : null
        }
    >
        <DashboardPageLayout.TabContent value="all-orders">
            <DashboardPageLayout.Content>
                <OrdersTable orders={orders} isLoading={isLoading} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="deliveries">
            <DashboardPageLayout.Content>
                <OrdersDeliveriesTable orders={orders} staff={staff} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
