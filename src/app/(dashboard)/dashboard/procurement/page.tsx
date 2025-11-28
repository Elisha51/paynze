

'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import type { Supplier, PurchaseOrder } from '@/lib/types';
import { getSuppliers, getPurchaseOrders, deleteSupplier } from '@/services/procurement';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ProcurementAnalyticsReport } from '@/components/dashboard/analytics/procurement-analytics-report';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const getSupplierColumns = (onDelete: (id: string) => void): ColumnDef<Supplier>[] => [
    {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
        accessorKey: 'name',
        header: 'Supplier Name',
        cell: ({ row }) => (
            <Link href={`/dashboard/procurement/suppliers/${row.original.id}`} className="font-medium hover:underline">
                {row.original.name}
            </Link>
        )
    },
    {
        accessorKey: 'contactName',
        header: 'Contact',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'productsSupplied',
        header: 'Products',
        cell: ({ row }) => {
            const num = (row.original.productsSupplied || []).length;
            return <Badge variant="secondary">{num} product{num !== 1 && 's'}</Badge>
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const supplier = row.original;
            return (
                <div className="text-right">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild><Link href={`/dashboard/procurement/suppliers/${supplier.id}`}><Edit className="mr-2 h-4 w-4"/>View Details</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href={`/dashboard/procurement/suppliers/${supplier.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the supplier "{supplier.name}". This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(supplier.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
];

const getPurchaseOrderColumns = (): ColumnDef<PurchaseOrder>[] => [
    {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Order ID <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
        cell: ({ row }) => (
            <Link href={`/dashboard/procurement/purchase-orders/${row.original.id}`} className="font-medium hover:underline">
                {row.original.id}
            </Link>
        )
    },
    {
        accessorKey: 'supplierName',
        header: 'Supplier',
    },
    {
        accessorKey: 'orderDate',
        header: 'Order Date',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.original.status === 'Received' ? 'default' : 'secondary'}>{row.original.status}</Badge>
    },
    {
        accessorKey: 'totalCost',
        header: 'Total',
        cell: ({ row }) => {
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(row.original.totalCost);
            return <div className="text-right font-medium">{formatted}</div>
        }
    },
     {
        id: 'actions',
        cell: ({ row }) => {
            const po = row.original;
            return (
                <div className="text-right">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild><Link href={`/dashboard/procurement/purchase-orders/${po.id}`}><Edit className="mr-2 h-4 w-4"/>View Details</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href={`/dashboard/procurement/purchase-orders/${po.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Edit</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Cancel PO
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will cancel Purchase Order "{po.id}". This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
];


export default function ProcurementPage() {
    const [activeTab, setActiveTab] = useState('suppliers');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const canCreate = user?.permissions.procurement.create;
    const canViewAnalytics = user?.plan === 'Pro' || user?.plan === 'Enterprise';

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [suppliersData, poData] = await Promise.all([getSuppliers(), getPurchaseOrders()]);
            setSuppliers(suppliersData);
            setPurchaseOrders(poData);
            setIsLoading(false);
        }
        loadData();
    }, []);
    
    const handleDeleteSupplier = async (id: string) => {
        await deleteSupplier(id);
        setSuppliers(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Supplier Deleted' });
    }
    
    const supplierColumns = useMemo(() => getSupplierColumns(handleDeleteSupplier), []);
    const poColumns = useMemo(() => getPurchaseOrderColumns(), []);
    
    const getCta = () => {
        if (activeTab === 'analytics') {
            return <DateRangePicker date={dateRange} setDate={setDateRange} />;
        }
        if (!canCreate) return null;
        if (activeTab === 'suppliers') {
            return (
                <Button asChild>
                    <Link href="/dashboard/procurement/suppliers/add">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Supplier
                    </Link>
                </Button>
            );
        }
        if (activeTab === 'purchase-orders') {
            return (
                 <Button asChild>
                    <Link href="/dashboard/procurement/add">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create PO
                    </Link>
                </Button>
            )
        }
        return null;
    }

    const tabs = [
        { value: 'suppliers', label: 'Suppliers' },
        { value: 'purchase-orders', label: 'Purchase Orders' },
    ];

    if (canViewAnalytics) {
        tabs.push({ value: 'analytics', label: 'Analytics' });
    }

    return (
        <DashboardPageLayout
            title="Procurement"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            cta={getCta()}
        >
            <DashboardPageLayout.TabContent value="suppliers">
                <DashboardPageLayout.Content>
                    <DataTable columns={supplierColumns} data={suppliers} isLoading={isLoading} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="purchase-orders">
                <DashboardPageLayout.Content>
                    <DataTable columns={poColumns} data={purchaseOrders} isLoading={isLoading} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            {canViewAnalytics && (
                <DashboardPageLayout.TabContent value="analytics">
                    <DashboardPageLayout.Content>
                        <ProcurementAnalyticsReport purchaseOrders={purchaseOrders} dateRange={dateRange} />
                    </DashboardPageLayout.Content>
                </DashboardPageLayout.TabContent>
            )}
        </DashboardPageLayout>
    );
}
