
'use client';

import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Supplier, PurchaseOrder } from '@/lib/types';
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


const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: 'Supplier Name',
    cell: ({ row }) => {
        const supplier = row.original;
        return (
             <Link href={`/dashboard/suppliers/${supplier.id}`} className="font-medium hover:underline">
                {supplier.name}
            </Link>
        )
    }
  },
  {
    accessorKey: 'contactName',
    header: 'Contact Name',
  },
  {
    accessorKey: 'email',
    header: 'Contact Info',
     cell: ({ row }) => {
        const supplier = row.original;
        return (
            <div className="flex flex-col">
                <span>{supplier.email}</span>
                <span className="text-muted-foreground">{supplier.phone}</span>
            </div>
        )
    }
  },
    {
    accessorKey: 'productsSupplied',
    header: 'Products',
    cell: ({ row }) => {
        const products = row.original.productsSupplied;
        return (
            <div className="flex flex-col">
                <span className="font-medium">{products.length} product(s)</span>
            </div>
        )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="text-right">
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
                <Link href={`/dashboard/suppliers/${supplier.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Supplier</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];


function SuppliersTable() {
  const [data, setData] = React.useState<Supplier[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const fetchedData = await getSuppliers();
      setData(fetchedData);
    }
    loadData();
  }, []);

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}


export default function SuppliersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  React.useEffect(() => {
    async function loadPOs() {
        setIsLoading(true);
        const fetchedPOs = await getPurchaseOrders();
        setPurchaseOrders(fetchedPOs);
        setIsLoading(false);
    }
    loadPOs();
  }, []);

  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'today':
        setDate({ from: now, to: now });
        break;
      case 'last-7':
        setDate({ from: addDays(now, -6), to: now });
        break;
      case 'last-30':
        setDate({ from: addDays(now, -29), to: now });
        break;
      case 'ytd':
        setDate({ from: new Date(now.getFullYear(), 0, 1), to: now });
        break;
      default:
        setDate(undefined);
    }
  };

  const mainTabs = [
      { value: 'suppliers', label: 'All Suppliers' },
      { value: 'reports', label: 'Reports' },
  ];

  const cta = (
    <Button asChild>
      <Link href="/dashboard/suppliers/add">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Supplier
      </Link>
    </Button>
  );

  return (
    <DashboardPageLayout
      title="Suppliers"
      tabs={mainTabs}
      cta={cta}
    >
        <DashboardPageLayout.TabContent value="suppliers">
            <Card>
                <CardContent className="pt-6">
                    <SuppliersTable />
                </CardContent>
            </Card>
        </DashboardPageLayout.TabContent>

        <DashboardPageLayout.TabContent value="reports">
            <Card>
                <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                    <div>
                        <CardTitle>Procurement Report</CardTitle>
                        <CardDescription>
                            Analyze supplier costs and purchase order volume.
                        </CardDescription>
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
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full lg:w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
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
