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
  import { PlusCircle } from 'lucide-react';
  
  
  export default function OrdersPage() {
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
  