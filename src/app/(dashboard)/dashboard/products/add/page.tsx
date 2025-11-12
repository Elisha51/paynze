
'use client';
import { ProductForm } from '@/components/dashboard/product-form';
import { useSearchParams } from 'next/navigation';
import { getProductTemplates } from '@/services/templates';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import type { Product, ProductTemplate } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function AddProductPage() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get('template');
    const [template, setTemplate] = useState<ProductTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTemplate() {
            if (templateId) {
                const allTemplates = await getProductTemplates();
                const found = allTemplates.find(t => t.id === templateId);
                setTemplate(found || null);
            }
            setIsLoading(false);
        }
        loadTemplate();
    }, [templateId]);
    
    const initialProduct = template ? template.product : null;
    
    const pageTitle = template ? `New Product from "${template.name}"` : 'Add New Product';

    return (
        <DashboardPageLayout title={pageTitle} backHref="/dashboard/products">
            <ProductForm initialProduct={initialProduct || {}} />
        </DashboardPageLayout>
    )
}
