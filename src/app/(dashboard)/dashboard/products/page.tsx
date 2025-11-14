
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { CategoriesTab } from '@/components/dashboard/categories-tab';
import { usePathname } from 'next/navigation';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [myTemplates, setMyTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-products');
  const { user, isLoading: isUserLoading } = useAuth();
  const pathname = usePathname();
  
  const canCreate = user?.permissions.products.create;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    if (!user) return;
    const [fetchedProducts, fetchedTemplates] = await Promise.all([
        getProducts(),
        getProductTemplates()
    ]);
    setProducts(fetchedProducts);
    // Correctly filter templates to only those created by the current user for the dropdown
    const userTemplates = fetchedTemplates.filter(t => t.author === user.name);
    setMyTemplates(userTemplates); 
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!isUserLoading) {
      loadData();
    }
  }, [loadData, isUserLoading, pathname]);

  const tabs = [
    { value: 'all-products', label: 'All Products' },
    { value: 'categories', label: 'Categories' },
  ];

  const ctaContent = (
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
                        {myTemplates.length > 0 && (
                             <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>From My Templates</DropdownMenuLabel>
                                {myTemplates.map(template => (
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
    </DashboardPageLayout>
  );
}
