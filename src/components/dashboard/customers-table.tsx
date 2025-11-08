'use client';
import * as React from 'react';
import { PlusCircle, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/types';
import { DataTable } from './data-table';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getCustomerColumns } from './customers-columns';
import { useAuth } from '@/context/auth-context';

export function CustomersTable({ data, setData, isLoading }: { data: Customer[], setData: React.Dispatch<React.SetStateAction<Customer[]>>, isLoading: boolean }) {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const canCreate = user?.permissions.customers.create;
    const canEdit = user?.permissions.customers.edit ?? false;
    const canDelete = user?.permissions.customers.delete ?? false;

    const handleDeleteCustomer = (customerId: string) => {
        // In a real app, call a service to delete the customer
        console.log("Deleting customer:", customerId);
        setData(prev => prev.filter(c => c.id !== customerId));
        toast({ title: "Customer Deleted", variant: "destructive" });
    };

    const columns = React.useMemo(() => getCustomerColumns(handleDeleteCustomer, canEdit, canDelete), [canEdit, canDelete]);
    
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
        cta: (canCreate &&
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
