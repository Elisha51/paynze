
'use client';
import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { getProductTemplates } from '@/services/templates';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { useEffect, useState } from 'react';
import type { ProductTemplate } from '@/lib/types';

export default function EditProductTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const [template, setTemplate] = useState<ProductTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTemplate() {
            if (id) {
                setIsLoading(true);
                const allTemplates = await getProductTemplates();
                const foundTemplate = allTemplates.find(t => t.id === id);
                setTemplate(foundTemplate || null);
                setIsLoading(false);
            }
        }
        loadTemplate();
    }, [id]);

    if (isLoading) {
        return (
            <DashboardPageLayout title="Loading Template...">
                <div className="space-y-6">
                    <Skeleton className="h-96 w-full" />
                </div>
            </DashboardPageLayout>
        );
    }
    
    if (!template) {
         return (
            <DashboardPageLayout title="Error">
                <p>Template not found.</p>
            </DashboardPageLayout>
        );
    }

    return (
        <DashboardPageLayout title="Edit Product Template" backHref="/dashboard/templates">
            <ProductTemplateForm initialTemplate={template} />
        </DashboardPageLayout>
    )
}
