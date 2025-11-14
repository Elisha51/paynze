
'use client';

import { PlusCircle, Settings, ChevronDown, BarChart, File, FilePlus, Copy, Package } from 'lucide-react';
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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ProductAnalyticsReport } from '@/components/dashboard/analytics/product-analytics-report';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import * as Lucide from 'lucide-react';


const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

function AddProductDialog({ myTemplates }: { myTemplates: ProductTemplate[] }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add a New Product</DialogTitle>
                    <DialogDescription>
                        Create a new product listing from scratch or use one of your templates to get started quickly.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <Link href="/dashboard/products/add">
                        <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <File className="h-5 w-5" /> From Scratch
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Start with a blank product form.</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/templates/add">
                         <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FilePlus className="h-5 w-5" /> Create New Template
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Build a new reusable product template.</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                {myTemplates.length > 0 && (
                    <div>
                        <h3 className="mb-4 font-semibold">Or use a template</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myTemplates.map(template => (
                             <Link key={template.id} href={`/dashboard/products/add?template=${template.id}`}>
                                <Card className="hover:border-primary hover:bg-muted/50 transition-colors h-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                             <Icon name={template.icon} className="h-5 w-5" />
                                            {template.name}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [myTemplates, setMyTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-products');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { user, isLoading: isUserLoading } = useAuth();
  const pathname = usePathname();
  
  const canCreate = user?.permissions.products.create;
  const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise' || process.env.NODE_ENV === 'development';

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
  
  if (canViewAnalytics) {
    tabs.push({ value: 'analytics', label: 'Analytics' });
  }

  const ctaContent = () => {
    if (activeTab === 'analytics') {
      return <DateRangePicker date={dateRange} setDate={setDateRange} />;
    }
    
    if (activeTab === 'all-products') {
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setActiveTab('categories')}>
                <Settings className="mr-2 h-4 w-4" /> Manage Categories
            </Button>
            {canCreate && (
                <AddProductDialog myTemplates={myTemplates} />
            )}
        </div>
      );
    }
    return null;
  }

  return (
    <DashboardPageLayout 
        title="Products"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={ctaContent()}
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
              <ProductAnalyticsReport products={products} dateRange={dateRange} />
          </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
      )}
    </DashboardPageLayout>
  );
}
