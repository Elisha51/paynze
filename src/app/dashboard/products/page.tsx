
'use client';

import { PlusCircle, Upload, ChevronDown, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { ProductsTable } from '@/components/dashboard/products-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductPerformanceReport } from '@/components/dashboard/analytics/product-performance-report';
import { CategoriesTab } from '@/components/dashboard/categories-tab';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  const tabs = [
      { value: 'all', label: 'All' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
      { value: 'categories', label: 'Categories' },
      { value: 'reports', label: 'Reports', className: 'flex items-center gap-2' },
  ];

  const cta = (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Add Product <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/products/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Manually
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/products/import">
                <Upload className="mr-2 h-4 w-4" />
                Import Products
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  const allProducts = useMemo(() => products.filter(p => p.status !== 'archived'), [products]);
  const publishedProducts = useMemo(() => products.filter(p => p.status === 'published'), [products]);
  const draftProducts = useMemo(() => products.filter(p => p.status === 'draft'), [products]);
  const archivedProducts = useMemo(() => products.filter(p => p.status === 'archived'), [products]);

  return (
    <DashboardPageLayout
        title="Products"
        tabs={tabs}
        cta={cta}
    >
        <DashboardPageLayout.TabContent value="all">
            <ProductsTable
                data={allProducts}
                setData={setProducts}
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="published">
            <ProductsTable 
                data={publishedProducts}
                setData={setProducts}
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="draft">
            <ProductsTable
                data={draftProducts}
                setData={setProducts}
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="archived">
            <ProductsTable 
                data={archivedProducts}
                setData={setProducts}
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="categories">
            <CategoriesTab />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="reports">
            <ProductPerformanceReport products={products} />
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
