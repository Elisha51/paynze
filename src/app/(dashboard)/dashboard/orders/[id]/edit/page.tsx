
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/services/orders';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { OrderForm } from '@/components/dashboard/order-form';

export default function EditOrderPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            async function loadOrder() {
                const fetchedOrder = await getOrderById(id);
                setOrder(fetchedOrder || null);
                setIsLoading(false);
            }
            loadOrder();
        }
    }, [id]);

    if (isLoading) {
        return (
             <DashboardPageLayout title="Loading Order...">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-80 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </DashboardPageLayout>
        );
    }
    
    if (!order) {
        return (
             <DashboardPageLayout title="Error" backHref="/dashboard/orders">
                <p>Order not found.</p>
             </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title={`Edit Order #${order.id}`} backHref={`/dashboard/orders/${order.id}`}>
            <OrderForm initialOrder={order} />
        </DashboardPageLayout>
    );
}
