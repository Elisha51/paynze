

'use client';

import { PlusCircle, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Edit } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Supplier, PurchaseOrder, OnboardingFormData } from '@/lib/types';
import { getSuppliers, getPurchaseOrders } from '@/services/procurement';
import { DataTable } from '@/components/dashboard/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ProcurementAnalyticsReport } from '@/components/dashboard/analytics/procurement-analytics-report';
import { Calendar } from '@/components/ui/calendar';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Columns for Suppliers Table
const supplierColumns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: 'Supplier Name',
    cell: ({ row }) => (
      <Link href={`/dashboard/procurement/suppliers/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'contactName',
    header: 'Contact Name',
  },
  {
    accessorKey: 'email',
    header: 'Contact Info',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.email}</span>
        <span className="text-muted-foreground">{row.original.phone}</span>
      </div>
    ),
  },
  {
    accessorKey: 'productsSupplied',
    header: 'Products',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.productsSupplied.length} product(s)</span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="relative bg-background text-right sticky right-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/procurement/suppliers/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/procurement/suppliers/${row.original.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Supplier
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

const poStatuses = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Partial', label: 'Partial' },
    { value: 'Received', label: 'Received' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const getPOColumns = (currency: string): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => (
      <Link href={`/dashboard/procurement/purchase-orders/${row.original.id}`} className="font-medium hover:underline">
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
    cell: ({ row }) => (
      <Link href={`/dashboard/procurement/suppliers/${row.original.supplierId}`} className="font-medium hover:underline">
        {row.original.supplierName}
      </Link>
    ),
  },
  {
    accessorKey: 'orderDate',
    header: 'Order Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'Sent' ? 'secondary' : row.getValue('status') === 'Cancelled' ? 'destructive' : 'default'}>
        {row.getValue('status') as string}
      </Badge>
    ),
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'totalCost',
    header: ({ column }) => (
      <div className="text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalCost'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="relative bg-background text-right sticky right-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/procurement/purchase-orders/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Mark as Received</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

export default function ProcurementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get('tab') || 'suppliers';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({ from: addDays(new Date(), -29), to: new Date() });
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);

  React.useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    async function loadData() {
      setIsLoading(true);
      const [fetchedSuppliers, fetchedPOs] = await Promise.all([
        getSuppliers(),
        getPurchaseOrders(),
      ]);
      setSuppliers(fetchedSuppliers);
      setPurchaseOrders(fetchedPOs);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const poColumns = getPOColumns(settings?.currency || 'UGX');
  
  const handleTabChange = (tab: string) => {
    router.push(`${pathname}?tab=${tab}`);
  };

  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'today': setDate({ from: now, to: now }); break;
      case 'last-7': setDate({ from: addDays(now, -6), to: now }); break;
      case 'last-30': setDate({ from: addDays(now, -29), to: now }); break;
      case 'ytd': setDate({ from: new Date(now.getFullYear(), 0, 1), to: now }); break;
      default: setDate(undefined);
    }
  };

  const mainTabs = [
    { value: 'suppliers', label: 'Suppliers' },
    { value: 'purchase-orders', label: 'Purchase Orders' },
    { value: 'analytics', label: 'Analytics' },
  ];

  const cta = (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Create New <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/procurement/suppliers/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Supplier
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/procurement/purchase-orders/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Purchase Order
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  return (
    <DashboardPageLayout 
        title="Procurement" 
        tabs={mainTabs} 
        cta={cta} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
    >
      <DashboardPageLayout.TabContent value="suppliers">
        <DataTable columns={supplierColumns} data={suppliers} />
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="purchase-orders">
        <DataTable 
            columns={poColumns} 
            data={purchaseOrders}
            filters={[{
                columnId: 'status',
                title: 'Status',
                options: poStatuses
            }]}
        />
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="analytics">
        <Card>
          <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
            <div>
              <CardTitle>Procurement Analytics</CardTitle>
              <CardDescription>Analyze supplier costs and purchase order volume.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Select onValueChange={handlePresetChange} defaultValue="last-30">
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last-7">Last 7 days</SelectItem>
                  <SelectItem value="last-30">Last 30 days</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date" variant={"outline"} className={cn("w-full lg:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProcurementAnalyticsReport purchaseOrders={purchaseOrders} dateRange={date} />
          </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
