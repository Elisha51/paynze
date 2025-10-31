
'use client';

import { ProductGrid } from "@/components/storefront/product-grid";
import { getProducts } from "@/services/products";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreHeader } from "@/components/storefront/store-header";
import type { OnboardingFormData } from "@/lib/types";
import Link from 'next/link';

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts.filter(p => p.status === 'published'));
      setIsLoading(false);
    }
    loadProducts();
    
    const data = localStorage.getItem('onboardingData');
    if (data) {
      setSettings(JSON.parse(data));
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
        <StoreHeader settings={settings} />
        <main className="flex-1">
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
        </main>
         <footer className="bg-muted py-6">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {settings?.businessName || 'Your Store'}. All rights reserved.</p>
                    <p className="text-xs text-muted-foreground">
                        Powered by <Link href="/" className="font-semibold text-primary hover:underline">Paynze</Link>
                    </p>
            </div>
        </footer>
    </div>
  );
}
