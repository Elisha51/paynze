
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
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';


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
      cta={cta}
    >
        <DashboardPageLayout.Content>
            <Card>
                <CardContent className="pt-6">
                    <SuppliersTable />
                </CardContent>
            </Card>
        </DashboardPageLayout.Content>
    </DashboardPageLayout>
  );
}
