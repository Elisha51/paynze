
'use client';

import { PlusCircle } from 'lucide-react';
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
    filter?: {
        column: string;
        value: string;
    };
};

function PurchaseOrdersTable({ filter }: PurchaseOrdersTableProps) {
  const [data, setData] = React.useState<PurchaseOrder[]>([]);
  const [allData, setAllData] = React.useState<PurchaseOrder[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const fetchedData = await getPurchaseOrders();
      setAllData(fetchedData);
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (filter) {
      setData(allData.filter(item => (item as any)[filter.column] === filter.value));
    } else {
      setData(allData);
    }
  }, [allData, filter]);

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}


export default function PurchaseOrdersPage() {

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
      cta={cta}
    >
      <DashboardPageLayout.Content>
          <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue="all">
            <DashboardPageLayout.TabContent value="all">
                <PurchaseOrdersTable />
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="sent">
                <PurchaseOrdersTable filter={{ column: 'status', value: 'Sent' }} />
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="received">
                <PurchaseOrdersTable filter={{ column: 'status', value: 'Received' }} />
            </DashboardPageLayout.TabContent>
          </DashboardPageLayout.FilterTabs>
      </DashboardPageLayout.Content>
    </DashboardPageLayout>
  );
}
