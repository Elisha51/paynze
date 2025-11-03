'use client';

import { PlusCircle, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import Link from 'next/link';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import type { Customer } from '@/lib/types';


type CustomersTableProps = {
  columns: ColumnDef<Customer, any>[];
  data: Customer[];
  isLoading: boolean;
};

export function CustomersTable({ columns, data, isLoading }: CustomersTableProps) {
  const customerGroups = [
    { value: 'default', label: 'Default' },
    { value: 'Wholesaler', label: 'Wholesaler' },
    { value: 'Retailer', label: 'Retailer' },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      filters={[{
        columnId: 'customerGroup',
        title: 'Group',
        options: customerGroups
      }]}
      emptyState={{
        icon: Users,
        title: "No Customers Yet",
        description: "You haven't added any customers. Add your first customer to get started.",
        cta: (
          <Button asChild>
            <Link href="/dashboard/customers/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        )
      }}
    />
  );
}
