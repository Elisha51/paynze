
'use client';
import { ProductForm } from '@/components/dashboard/product-form';
import { getProducts } from '@/services/products';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9" />
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        )
    }
    
    if (!product) {
        return (
            <div className="text-center">
                <h1 className="text-xl font-bold">Product not found</h1>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/products">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Link>
                </Button>
            </div>
        )
    }

    return <ProductForm initialProduct={product} />;
}
