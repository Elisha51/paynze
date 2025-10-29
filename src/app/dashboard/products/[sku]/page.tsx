

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { getProducts } from '@/services/products';
import { ProductDetails } from '@/components/dashboard/product-details';
import { ProductDetailsAdjustStock } from '@/components/dashboard/product-details-adjust-stock';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';


export default function ViewProductPage({ params }: { params: { sku: string } }) {
  const { sku } = params;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = user?.permissions.products.edit;

  useEffect(() => {
    async function loadProduct() {
      const allProducts = await getProducts();
      const foundProduct = allProducts.find(p => p.sku === sku);
      setProduct(foundProduct || null);
      setLoading(false);
    }
    loadProduct();
  }, [sku]);
  

  if (loading) {
      return <div>Loading product...</div>
  }

  if (!product) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Products</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            View details for product SKU: {product.sku}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            {canEdit && (
              <>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/products/${sku}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
                {product.inventoryTracking !== "Don't Track" && (
                  <ProductDetailsAdjustStock product={product} />
                )}
              </>
            )}
        </div>
      </div>

      <ProductDetails product={product} />

    </div>
  );
}

    