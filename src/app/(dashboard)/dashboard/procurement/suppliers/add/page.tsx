

import { SupplierForm } from '@/components/dashboard/supplier-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddSupplierPage() {
    return (
        <DashboardPageLayout title="Add New Supplier" backHref="/dashboard/procurement">
            <SupplierForm />
        </DashboardPageLayout>
    );
}
