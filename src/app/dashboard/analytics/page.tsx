

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductPerformanceReport } from '@/components/dashboard/analytics/product-performance-report';

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4">
       <h2 className="text-3xl font-bold tracking-tight font-headline">Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 452,318.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                    <CardDescription>View your sales performance over time.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p>Sales reports coming soon.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="products">
            <ProductPerformanceReport />
        </TabsContent>
         <TabsContent value="customers">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Customer Analytics</CardTitle>
                    <CardDescription>Understand your customer behavior and demographics.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p>Customer reports coming soon.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

