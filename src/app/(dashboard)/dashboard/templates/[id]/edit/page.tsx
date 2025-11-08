
'use client';
import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { mockProductTemplates } from '@/services/templates';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function EditProductTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const template = mockProductTemplates.find(t => t.id === id);

    if (!template) {
        return (
            <DashboardPageLayout title="Loading Template...">
                <div className="space-y-6">
                    <Skeleton className="h-96 w-full" />
                </div>
            </DashboardPageLayout>
        );
    }

    return (
        <DashboardPageLayout title="Edit Product Template" description="Update the details of this template.">
            <ProductTemplateForm initialTemplate={template} />
        </DashboardPageLayout>
    )
}
