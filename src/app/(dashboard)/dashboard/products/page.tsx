
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductsTable } from '@/components/dashboard/products-table';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { useAuth } from '@/context/auth-context';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const canCreate = user?.permissions.products.create;

  useEffect(() => {
    async function loadProducts() {
        setIsLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <DashboardPageLayout 
        title="Products"
        cta={
            canCreate ? (
                <Button asChild>
                    <Link href="/dashboard/products/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            ) : null
        }
    >
        <DashboardPageLayout.Content>
            <ProductsTable data={products} setData={setProducts} isLoading={isLoading} />
        </DashboardPageLayout.Content>
    </DashboardPageLayout>
  );
}
