
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Edit, MessageCircle, Phone, Tag } from 'lucide-react';
import Link from 'next/link';
import { getCustomerById } from '@/services/customers';
import type { Customer, Order } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { classifyCustomer, ClassifyCustomerOutput } from '@/ai/flows/classify-customers';
import { Skeleton } from '@/components/ui/skeleton';

const orderColumns: ColumnDef<Order>[] = [
    {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => (
            <Link href={`/dashboard/orders/${row.original.id}`} className="font-medium hover:underline">
                {row.getValue('id')}
            </Link>
        )
    },
    {
        accessorKey: 'date',
        header: 'Date',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge>{row.getValue('status')}</Badge>
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
            const order = row.original;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    }
];

export default function ViewCustomerPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [classification, setClassification] = useState<ClassifyCustomerOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const fetchedCustomer = await getCustomerById(id);
        if (fetchedCustomer) {
            setCustomer(fetchedCustomer);

            if (fetchedCustomer.orders && fetchedCustomer.orders.length > 0) {
                 const purchaseHistory = fetchedCustomer.orders.flatMap(order => 
                    order.items.map(item => ({
                        productId: item.sku,
                        quantity: item.quantity,
                        price: item.price,
                        category: item.category || 'Unknown',
                        timestamp: order.date,
                    }))
                );

                const classificationResult = await classifyCustomer({
                    customerId: fetchedCustomer.id,
                    purchaseHistory: purchaseHistory,
                });
                setClassification(classificationResult);
            }
        }
        setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Customer not found</h1>
            <p className="text-muted-foreground">The customer you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/customers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Link>
            </Button>
        </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const totalOrders = customer.orders?.length || 0;
  const totalSpend = customer.orders?.reduce((sum, order) => sum + order.total, 0) || 0;


  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Customers</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {customer.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Customer since {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send WhatsApp
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Send SMS
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>A complete log of all orders placed by this customer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                      columns={orderColumns}
                      data={customer.orders || []}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Spend</span>
                        <span className="font-semibold">{formatCurrency(totalSpend, customer.currency)}</span>
                     </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-semibold">{totalOrders}</span>
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {customer.email}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <div className="pt-2">
                        <p className="font-medium">Shipping Address</p>
                        <address className="text-muted-foreground not-italic">
                            123 Main Street<br/>
                            Nairobi, 12345<br/>
                            Kenya
                        </address>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" /> Customer Tagging
                    </CardTitle>
                    <CardDescription>AI-powered classification based on purchase history.</CardDescription>
                </CardHeader>
                <CardContent>
                    {classification ? (
                        <div className="space-y-2">
                            <Badge variant="secondary" className="text-base">{classification.customerGroup}</Badge>
                            <p className="text-sm text-muted-foreground">{classification.reason}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Not enough data to classify this customer yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    