
'use client';

import { ProductGrid } from "@/components/storefront/product-grid";
import { getProducts } from "@/services/products";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts.filter(p => p.status === 'published'));
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div>
        <section className="bg-secondary">
            <div className="container py-20 text-center">
                <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">Our Products</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Browse our latest collection of high-quality goods.
                </p>
            </div>
        </section>
        <section className="container py-12">
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            ) : (
                <ProductGrid products={products} />
            )}
        </section>
    </div>
  );
}
