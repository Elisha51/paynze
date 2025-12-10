
'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { PurchaseOrderForm } from '@/components/dashboard/purchase-order-form';

export default function AddPurchaseOrderPage() {
    return (
        <DashboardPageLayout title="Create Purchase Order" backHref="/dashboard/procurement?tab=purchase-orders">
            <PurchaseOrderForm />
        </DashboardPageLayout>
    )
}
