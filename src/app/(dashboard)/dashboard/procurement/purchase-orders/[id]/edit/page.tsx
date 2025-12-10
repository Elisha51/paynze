
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPurchaseOrderById, updatePurchaseOrder } from '@/services/procurement';
import type { PurchaseOrder } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { PurchaseOrderForm } from '@/components/dashboard/purchase-order-form'; // Re-using the form logic

export default function EditPurchaseOrderPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            async function loadOrder() {
                const fetchedOrder = await getPurchaseOrderById(id);
                // Only allow editing of non-completed orders
                if (fetchedOrder && fetchedOrder.status !== 'Completed' && fetchedOrder.status !== 'Cancelled') {
                    setOrder(fetchedOrder);
                } else {
                    setOrder(null);
                    if (fetchedOrder) {
                        router.push(`/dashboard/procurement/purchase-orders/${id}`);
                    }
                }
                setIsLoading(false);
            }
            loadOrder();
        }
    }, [id, router]);

    if (isLoading) {
        return (
             <DashboardPageLayout title="Loading Purchase Order...">
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
             <DashboardPageLayout title="Error" backHref="/dashboard/procurement?tab=purchase-orders">
                <p>Purchase Order not found or cannot be edited.</p>
             </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title={`Edit PO #${order.id}`} backHref={`/dashboard/procurement/purchase-orders/${order.id}`}>
            <PurchaseOrderForm initialPurchaseOrder={order} />
        </DashboardPageLayout>
    );
}
