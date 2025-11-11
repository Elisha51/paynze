
import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddProductTemplatePage() {
    return (
        <DashboardPageLayout title="Create Product Template">
             <ProductTemplateForm />
        </DashboardPageLayout>
    );
}
