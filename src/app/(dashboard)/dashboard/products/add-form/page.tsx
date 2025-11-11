

'use client';
import { ProductForm } from '@/components/dashboard/product-form';
import { useSearchParams } from 'next/navigation';
import { mockProductTemplates } from '@/services/templates';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { addProduct } from '@/services/products';
import type { Product } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AddProductFormPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const templateId = searchParams.get('template');
    
    const template = templateId ? mockProductTemplates.find(t => t.id === templateId) : null;
    const initialProduct = template ? template.product : null;
    
    const [product, setProduct] = useState<Partial<Product>>(initialProduct || {});

    const pageTitle = template ? `New ${template.name}` : 'Add New Product';

    const handleSave = async () => {
        try {
            const savedProduct = await addProduct(product as Product);
            toast({
                title: 'Product Created',
                description: `${savedProduct.name} has been created successfully.`,
            });
            router.push(`/dashboard/products`);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'There was an error saving the product.',
            });
        }
    }
    
    const cta = (
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save
        </Button>
    )

    return (
        <DashboardPageLayout title={pageTitle} backHref="/dashboard/products/add" cta={cta}>
            <ProductForm initialProduct={initialProduct} onSave={(p) => console.log('saving', p)} />
        </DashboardPageLayout>
    )
}
