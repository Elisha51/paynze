
'use client'
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { OrderForm } from '@/components/dashboard/order-form';

export default function AddOrderPage() {
    return (
        <DashboardPageLayout title="Create Manual Order" backHref="/dashboard/orders">
            <OrderForm />
        </DashboardPageLayout>
    )
}
