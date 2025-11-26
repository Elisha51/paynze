
'use client';
import { ProductForm } from '@/components/dashboard/product-form';
import { getProducts } from '@/services/products';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';


export default function EditProductPage() {
    const params = useParams();
    const sku = params.sku as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProduct() {
            const allProducts = await getProducts();
            const foundProduct = allProducts.find(p => p.sku === sku);
            setProduct(foundProduct || null);
            setIsLoading(false);
        }
        if (sku) {
            loadProduct();
        }
    }, [sku]);

    if (isLoading) {
        return (
            <DashboardPageLayout title="Loading Product...">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </DashboardPageLayout>
        )
    }
    
    if (!product) {
        return (
            <DashboardPageLayout title="Error" backHref="/dashboard/products">
                <h1 className="text-xl font-bold">Product not found</h1>
            </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title={`Edit ${product.name}`} backHref={`/dashboard/products`}>
            <ProductForm initialProduct={product} />
        </DashboardPageLayout>
    )
}
