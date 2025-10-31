

'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { Supplier, PurchaseOrder, Product, OnboardingFormData } from '@/lib/types';
import { getSupplierById, getPurchaseOrdersBySupplierId } from '@/services/procurement';
import { getProducts } from '@/services/products';
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
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';


const getPOColumns = (currency: string): ColumnDef<PurchaseOrder>[] => [
    {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }) => (
            <Link href={`/dashboard/procurement/purchase-orders/${row.original.id}`} className="font-medium hover:underline">
                {row.getValue('id')}
            </Link>
        )
    },
    {
        accessorKey: 'orderDate',
        header: 'Order Date',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge>{row.getValue('status')}</Badge>
    },
    {
        accessorKey: 'totalCost',
        header: 'Total',
        cell: ({ row }) => {
            const po = row.original;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(po.totalCost);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    }
];

export default function ViewSupplierPage() {
  const params = useParams();
  const id = params.id as string;
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const [fetchedSupplier, fetchedPOs, fetchedProducts] = await Promise.all([
            getSupplierById(id),
            getPurchaseOrdersBySupplierId(id),
            getProducts()
        ]);
        setSupplier(fetchedSupplier || null);
        setPurchaseOrders(fetchedPOs);
        setProducts(fetchedProducts);
        setLoading(false);
    }
    loadData();
  }, [id]);

  const poColumns = getPOColumns(settings?.currency || 'UGX');
  const suppliedProducts = products.filter(p => supplier?.productsSupplied.includes(p.sku || ''));

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
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

  if (!supplier) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Supplier not found</h1>
            <p className="text-muted-foreground">The supplier you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/procurement">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Procurement
                </Link>
            </Button>
        </div>
    )
  }
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
  
  const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0);

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/procurement?tab=suppliers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Procurement</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {supplier.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {supplier.productsSupplied.length} product(s) supplied
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/dashboard/procurement/purchase-orders/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New PO
                </Link>
            </Button>
            <Button variant="outline" asChild>
                 <Link href={`/dashboard/procurement/suppliers/${supplier.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Contact History</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Order History</CardTitle>
                    <CardDescription>A log of all purchase orders sent to this supplier.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                      columns={poColumns}
                      data={purchaseOrders}
                       emptyState={{
                        icon: FileText,
                        title: "No Purchase Orders Yet",
                        description: "You haven't sent any purchase orders to this supplier.",
                        cta: (
                            <Button asChild>
                                <Link href="/dashboard/procurement/purchase-orders/add">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Purchase Order
                                </Link>
                            </Button>
                        )
                      }}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Supplied Products</CardTitle>
                    <CardDescription>Products that are sourced from this supplier.</CardDescription>
                </CardHeader>
                <CardContent>
                    {suppliedProducts.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {suppliedProducts.map(product => (
                                <li key={product.sku} className="py-2">
                                    <Link href={`/dashboard/products/${product.sku}`} className="font-medium hover:underline">{product.name}</Link>
                                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <EmptyState 
                            icon={<FileText className="h-12 w-12 text-primary" />}
                            title="No Products Linked"
                            description="No products are currently linked to this supplier. You can link them when editing a product."
                            cta={(
                                <Button asChild>
                                    <Link href="/dashboard/products">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Go to Products
                                    </Link>
                                </Button>
                            )}
                        />
                    )}
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
                        <span className="font-semibold">{formatCurrency(totalSpend, settings.currency)}</span>
                     </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-semibold">{purchaseOrders.length}</span>
                      </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Contact Person:</strong> {supplier.contactName}</p>
                    <p><strong>Email:</strong> {supplier.email}</p>
                    <p><strong>Phone:</strong> {supplier.phone}</p>
                    <div className="pt-2">
                        <p className="font-medium">Address</p>
                        <address className="text-muted-foreground not-italic">
                           {supplier.address.split(',').map((line, i) => <span key={i}>{line.trim()}<br/></span>)}
                        </address>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
