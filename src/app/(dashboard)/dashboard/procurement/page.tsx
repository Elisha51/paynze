
'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import type { Supplier, PurchaseOrder } from '@/lib/types';
import { getSuppliers, getPurchaseOrders } from '@/services/procurement';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ProcurementAnalyticsReport } from '@/components/dashboard/analytics/procurement-analytics-report';

const getSupplierColumns = (): ColumnDef<Supplier>[] => [
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
    }
];

const getPurchaseOrderColumns = (): ColumnDef<PurchaseOrder>[] => [
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
];


export default function ProcurementPage() {
    const [activeTab, setActiveTab] = useState('suppliers');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { user } = useAuth();
    
    const canCreate = user?.permissions.procurement.create;

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
    
    const supplierColumns = useMemo(() => getSupplierColumns(), []);
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
        { value: 'analytics', label: 'Analytics' }
    ];

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
            <DashboardPageLayout.TabContent value="analytics">
                <DashboardPageLayout.Content>
                    <ProcurementAnalyticsReport purchaseOrders={purchaseOrders} dateRange={dateRange} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
        </DashboardPageLayout>
    );
}
