
'use client';

import { ProductForm } from '@/components/dashboard/product-form';
import { getProducts } from '@/services/products';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductPage({ params }: { params: { sku: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const allProducts = await getProducts();
      const foundProduct = allProducts.find(p => p.sku === params.sku);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.sku]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }
  
  if(!product) {
      return <div>Product not found</div>
  }

  return <ProductForm product={product} />;
}
