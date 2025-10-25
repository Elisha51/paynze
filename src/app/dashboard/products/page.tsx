
'use client';

import { PlusCircle, Upload, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
        setIsLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setIsLoading(false);
    }
    loadProducts();
  }, []);

  const tabs = [
      { value: 'products', label: 'All Products' },
      { value: 'categories', label: 'Categories' },
      { value: 'reports', label: 'Reports', className: 'flex items-center gap-2' },
  ];
  
  const filterTabs = [
      { value: 'all', label: 'All' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
  ]

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

  return (
    <DashboardPageLayout
        title="Products"
        tabs={tabs}
        cta={cta}
    >
        <DashboardPageLayout.TabContent value="products">
            <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue='all'>
                 <DashboardPageLayout.TabContent value="all">
                    <ProductsTable
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', excludeValue: 'archived' }}
                    />
                </DashboardPageLayout.TabContent>
                <DashboardPageLayout.TabContent value="published">
                    <ProductsTable 
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', value: 'published' }}
                    />
                </DashboardPageLayout.TabContent>
                <DashboardPageLayout.TabContent value="draft">
                    <ProductsTable
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', value: 'draft' }}
                    />
                </DashboardPageLayout.TabContent>
                <DashboardPageLayout.TabContent value="archived">
                    <ProductsTable 
                        data={products}
                        setData={setProducts}
                        isLoading={isLoading}
                        filter={{ column: 'status', value: 'archived' }}
                    />
                </DashboardPageLayout.TabContent>
            </DashboardPageLayout.FilterTabs>
        </DashboardPageLayout.TabContent>

        <DashboardPageLayout.TabContent value="categories">
            <CategoriesTab />
        </DashboardPageLayout.TabContent>
        
        <DashboardPageLayout.TabContent value="reports">
            <Card>
                <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                    <CardDescription>
                        Analyze sales performance by product and variant to identify your best-sellers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductPerformanceReport products={products} />
                </CardContent>
            </Card>
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
