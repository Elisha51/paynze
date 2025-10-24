import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { CustomersTable } from '@/components/dashboard/customers-table';
  
  export default function CustomersPage() {
    return (
      <>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Customers</h2>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              View, manage, and communicate with your customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomersTable />
          </CardContent>
        </Card>
      </>
    );
  }
  