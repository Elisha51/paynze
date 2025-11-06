'use client';
import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { mockProductTemplates } from '@/services/templates';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function EditProductTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const template = mockProductTemplates.find(t => t.id === id);

    if (!template) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
             </div>
        );
    }

    return <ProductTemplateForm initialTemplate={template} />;
}
