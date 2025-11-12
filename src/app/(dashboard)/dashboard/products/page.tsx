
'use client';

import { PlusCircle, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductsTable } from '@/components/dashboard/products-table';
import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductTemplate } from '@/lib/types';
import { getProducts } from '@/services/products';
import { getProductTemplates } from '@/services/templates';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { useAuth } from '@/context/auth-context';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ProductPerformanceReport } from '@/components/dashboard/analytics/product-performance-report';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { CategoriesTab } from '@/components/dashboard/categories-tab';
import { usePathname } from 'next/navigation';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-products');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { user } = useAuth();
  const pathname = usePathname();
  
  const canCreate = user?.permissions.products.create;
  const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [fetchedProducts, fetchedTemplates] = await Promise.all([
        getProducts(),
        getProductTemplates()
    ]);
    setProducts(fetchedProducts);
    // Correctly load ALL templates for use, not just published ones.
    setTemplates(fetchedTemplates); 
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, pathname]);

  const tabs = [
    { value: 'all-products', label: 'All Products' },
    { value: 'categories', label: 'Categories' },
  ];
  if (canViewAnalytics) {
    tabs.push({ value: 'analytics', label: 'Analytics' });
  }

  const ctaContent = activeTab === 'analytics'
    ? <DateRangePicker date={dateRange} setDate={setDateRange} />
    : (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setActiveTab('categories')}>
                <Settings className="mr-2 h-4 w-4" /> Manage Categories
            </Button>
            {canCreate && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Product <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Create a new product</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/products/add">
                                From Scratch
                            </Link>
                        </DropdownMenuItem>
                        {templates.length > 0 && (
                             <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>From Template</DropdownMenuLabel>
                                {templates.map(template => (
                                    <DropdownMenuItem key={template.id} asChild>
                                        <Link href={`/dashboard/products/add?template=${template.id}`}>
                                            {template.name}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                             </>
                        )}
                        <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                            <Link href="/dashboard/templates/add">
                                Create New Template
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      );

  return (
    <DashboardPageLayout 
        title="Products"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={ctaContent}
    >
      <DashboardPageLayout.TabContent value="all-products">
        <DashboardPageLayout.Content>
            <ProductsTable data={products} setData={setProducts} isLoading={isLoading} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="categories">
        <DashboardPageLayout.Content>
            <CategoriesTab />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      {canViewAnalytics && (
        <DashboardPageLayout.TabContent value="analytics">
          <DashboardPageLayout.Content>
              <ProductPerformanceReport products={products} dateRange={dateRange} />
          </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
      )}
    </DashboardPageLayout>
  );
}
