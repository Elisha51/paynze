
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { OrdersTable } from '@/components/dashboard/orders-table';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { PlusCircle, Search } from 'lucide-react';
  import { useSearch } from '@/context/search-context';
  
  
  export default function OrdersPage() {
    const { searchQuery, setSearchQuery } = useSearch();

    return (
      <Tabs defaultValue="all">
          <div className="space-y-2 mb-4">
              <h2 className="text-3xl font-bold tracking-tight font-headline">Orders</h2>
          </div>
          <div className="flex items-center justify-between">
              <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search orders..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Order
                  </Button>
              </div>
          </div>
        <TabsContent value="all">
          <Card className="mt-4">
              <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                  View and manage all customer orders.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <OrdersTable />
              </CardContent>
              </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card className="mt-4">
              <CardHeader>
                  <CardTitle>Pending Orders</CardTitle>
                  <CardDescription>
                  View and manage all pending orders.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <OrdersTable filter={{ column: 'status', value: 'Pending' }}/>
              </CardContent>
              </Card>
        </TabsContent>
         <TabsContent value="delivered">
          <Card className="mt-4">
              <CardHeader>
                  <CardTitle>Delivered Orders</CardTitle>
                  <CardDescription>
                  View and manage all delivered orders.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <OrdersTable filter={{ column: 'status', value: 'Delivered' }}/>
              </CardContent>
              </Card>
        </TabsContent>
         <TabsContent value="cancelled">
          <Card className="mt-4">
              <CardHeader>
                  <CardTitle>Cancelled Orders</CardTitle>
                  <CardDescription>
                  View and manage all cancelled orders.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <OrdersTable filter={{ column: 'status', value: 'Cancelled' }}/>
              </CardContent>
              </Card>
        </TabsContent>
      </Tabs>
    );
  }
  
