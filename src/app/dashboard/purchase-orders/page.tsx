
'use client';

import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PurchaseOrder } from '@/lib/types';
import { getPurchaseOrders } from '@/services/procurement';
import { DataTable } from '@/components/dashboard/data-table';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ProcurementAnalyticsReport } from '@/components/dashboard/analytics/procurement-analytics-report';
import { Calendar } from '@/components/ui/calendar';


const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => {
        const po = row.original;
        return (
             <Link href={`/dashboard/purchase-orders/${po.id}`} className="font-medium hover:underline">
                {po.id}
            </Link>
        )
    }
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
     cell: ({ row }) => {
        const po = row.original;
        return (
             <Link href={`/dashboard/suppliers/${po.supplierId}`} className="font-medium hover:underline">
                {po.supplierName}
            </Link>
        )
    }
  },
  {
    accessorKey: 'orderDate',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Order Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
    {
    accessorKey: 'expectedDelivery',
    header: 'Expected Delivery',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'Sent' ? 'secondary' : row.getValue('status') === 'Cancelled' ? 'destructive' : 'default'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'totalCost',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalCost'));
      const currency = row.original.currency;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const po = row.original;
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
                  <Link href={`/dashboard/purchase-orders/${po.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Mark as Received</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

type PurchaseOrdersTableProps = {
    data: PurchaseOrder[];
    filter?: {
        column: string;
        value: string;
    };
};

function PurchaseOrdersTable({ data, filter }: PurchaseOrdersTableProps) {
  const [tableData, setTableData] = React.useState<PurchaseOrder[]>([]);

  React.useEffect(() => {
    if (filter) {
      setTableData(data.filter(item => (item as any)[filter.column] === filter.value));
    } else {
      setTableData(data);
    }
  }, [data, filter]);

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}


export default function PurchaseOrdersPage() {
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
      { value: 'purchase-orders', label: 'All Purchase Orders' },
      { value: 'reports', label: 'Reports' },
  ];

  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'sent', label: 'Sent' },
    { value: 'received', label: 'Received' },
  ];

  const cta = (
    <Button asChild>
      <Link href="/dashboard/purchase-orders/add">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Purchase Order
      </Link>
    </Button>
  );

  return (
    <DashboardPageLayout
      title="Purchase Orders"
      tabs={mainTabs}
      cta={cta}
    >
      <DashboardPageLayout.TabContent value="purchase-orders">
          <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue="all">
            <DashboardPageLayout.TabContent value="all">
                <PurchaseOrdersTable data={purchaseOrders} />
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="sent">
                <PurchaseOrdersTable data={purchaseOrders} filter={{ column: 'status', value: 'Sent' }} />
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="received">
                <PurchaseOrdersTable data={purchaseOrders} filter={{ column: 'status', value: 'Received' }} />
            </DashboardPageLayout.TabContent>
          </DashboardPageLayout.FilterTabs>
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
