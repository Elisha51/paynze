'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, PlusCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDetails } from '@/components/dashboard/product-details';
import { ProductDetailsAdjustStock } from '@/components/dashboard/product-details-adjust-stock';

export default function ViewProductPage() {
  const params = useParams();
  const sku = params.sku as string;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sku) {
      async function loadProduct() {
        setLoading(true);
        const allProducts = await getProducts();
        const foundProduct = allProducts.find(p => p.sku === sku);
        setProduct(foundProduct || null);
        setLoading(false);
      }
      loadProduct();
    }
  }, [sku]);
  
  const handleStockUpdate = (updatedProduct: Product) => {
    setProduct(updatedProduct);
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
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
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-2xl font-bold tracking-tight">
          {product.name}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {product.inventoryTracking !== "Don't Track" && <ProductDetailsAdjustStock product={product} onStockUpdate={handleStockUpdate} />}
          <Button asChild>
            <Link href={`/dashboard/products/${product.sku}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate Product</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/store/product/${product.sku}`} target="_blank">
                    View on Storefront
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Archive Product</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ProductDetails product={product} />

    </div>
  );
}
