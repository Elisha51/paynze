

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import type { Supplier, PurchaseOrder } from '@/lib/types';
import { getSupplierById, getPurchaseOrdersBySupplierId } from '@/services/procurement';
import {
  Card,
  CardContent,
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
import { Checkbox } from '@/components/ui/checkbox';

const getPoColumns = (): ColumnDef<PurchaseOrder>[] => [
    {
        id: 'select',
        header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
        ),
        cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        header: 'Date',
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
            const order = row.original;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.totalCost);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => (
             <div className="text-right">
                <Button variant="ghost" asChild size="sm">
                    <Link href={`/dashboard/procurement/purchase-orders/${row.original.id}`}>View</Link>
                </Button>
            </div>
        )
    }
];

export default function ViewSupplierPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const poColumns = getPoColumns();

  useEffect(() => {
    if (id) {
        async function loadData() {
            setLoading(true);
            const [supplierData, poData] = await Promise.all([
                getSupplierById(id),
                getPurchaseOrdersBySupplierId(id)
            ]);
            setSupplier(supplierData || null);
            setPurchaseOrders(poData);
            setLoading(false);
        }
        loadData();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <Skeleton className="h-80 w-full" />
          </div>
           <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
        <div className="text-center">
            <p>Supplier not found.</p>
            <Button asChild className="mt-4"><Link href="/dashboard/procurement">Back to Procurement</Link></Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
          <p className="text-muted-foreground">{supplier.productsSupplied.length} products supplied</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
                    <DropdownMenuItem>Send Email</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Purchase Order History</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={poColumns} data={purchaseOrders} isLoading={loading} />
                </CardContent>
             </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="font-semibold">{supplier.contactName}</p>
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{supplier.email}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{supplier.phone}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">{supplier.address}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
