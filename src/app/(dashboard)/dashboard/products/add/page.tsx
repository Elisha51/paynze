

'use client';
import { ProductForm } from '@/components/dashboard/product-form';
import { useSearchParams } from 'next/navigation';
import { mockProductTemplates } from '@/services/templates';

export default function AddProductPage() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get('template');
    
    const template = templateId ? mockProductTemplates.find(t => t.id === templateId) : null;
    const initialProduct = template ? template.product : null;
    
    return <ProductForm initialProduct={initialProduct} />;
}
