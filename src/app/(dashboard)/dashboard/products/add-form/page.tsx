

'use client';
import { ProductForm } from '@/components/dashboard/product-form';
import { useSearchParams } from 'next/navigation';
import { mockProductTemplates } from '@/services/templates';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddProductFormPage() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get('template');
    
    const template = templateId ? mockProductTemplates.find(t => t.id === templateId) : null;
    const initialProduct = template ? template.product : null;
    
    const pageTitle = template ? `New ${template.name}` : 'Add New Product';

    return (
        <DashboardPageLayout title={pageTitle} backHref="/dashboard/products/add">
            <ProductForm initialProduct={initialProduct} />
        </DashboardPageLayout>
    )
}
