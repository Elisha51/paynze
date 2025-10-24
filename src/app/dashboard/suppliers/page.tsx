
'use client';

import { PlusCircle } from 'lucide-react';
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
import type { Supplier } from '@/lib/types';
import { getSuppliers } from '@/services/procurement';
import { DataTable } from '@/components/dashboard/data-table';


const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: 'Supplier Name',
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
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
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
            <DropdownMenuItem>View Details</DropdownMenuItem>
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

  const tabs = [
    { value: 'all', label: 'All Suppliers' },
  ];

  const cta = (
    <Button>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Supplier
    </Button>
  );

  return (
    <DashboardPageLayout
      title="Suppliers"
      tabs={tabs}
      cta={cta}
    >
      <DashboardPageLayout.TabContent value="all">
        <SuppliersTable />
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
