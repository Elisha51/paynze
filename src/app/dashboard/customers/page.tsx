import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { CustomersTable } from '@/components/dashboard/customers-table';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  
  export default function CustomersPage() {
    return (
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Customers</h2>
            <div className="flex items-center space-x-2">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="wholesale">Wholesale</TabsTrigger>
                    <TabsTrigger value="retailer">Retailer</TabsTrigger>
                </TabsList>
            </div>
        </div>
        <TabsContent value="all">
            <Card className="mt-4">
            <CardHeader>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>
                View, manage, and communicate with your customers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CustomersTable />
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="wholesale">
             <Card className="mt-4">
            <CardHeader>
                <CardTitle>Wholesale Customers</CardTitle>
                <CardDescription>
                View, manage, and communicate with your wholesale customers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CustomersTable filter={{ column: 'customerGroup', value: 'wholesale' }} />
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="retailer">
             <Card className="mt-4">
            <CardHeader>
                <CardTitle>Retail Customers</CardTitle>
                <CardDescription>
                View, manage, and communicate with your retail customers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CustomersTable filter={{ column: 'customerGroup', value: 'retailer' }} />
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    );
  }
  