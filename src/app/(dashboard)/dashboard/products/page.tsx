

'use client';

import { PlusCircle, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProductsTable } from '@/components/dashboard/products-table';
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { useAuth } from '@/context/auth-context';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ProductPerformanceReport } from '@/components/dashboard/analytics/product-performance-report';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { CategoriesTab } from '@/components/dashboard/categories-tab';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-products');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { user } = useAuth();
  
  const canCreate = user?.permissions.products.create;
  const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise';

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
    { value: 'all-products', label: 'All Products' },
    { value: 'categories', label: 'Categories' },
  ];
  if (canViewAnalytics) {
    tabs.push({ value: 'analytics', label: 'Analytics' });
  }

  const ctaContent = activeTab === 'analytics'
    ? <DateRangePicker date={dateRange} setDate={setDateRange} />
    : (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    Actions <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {canCreate && (
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/products/add">
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </DropdownMenuItem>
                )}
                 <DropdownMenuItem onClick={() => setActiveTab('categories')}>
                    <Settings className="mr-2 h-4 w-4" /> Manage Categories
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
