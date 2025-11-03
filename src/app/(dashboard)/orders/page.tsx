
'use client';

import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const canCreate = user?.permissions.orders.create;

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
        setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <DashboardPageLayout 
        title="Orders"
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
        <DashboardPageLayout.Content>
            <OrdersTable orders={orders} isLoading={isLoading} />
        </DashboardPageLayout.Content>
    </DashboardPageLayout>
  );
}
