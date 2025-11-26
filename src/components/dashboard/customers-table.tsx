
'use client';
import * as React from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer, CustomerGroup, Staff } from '@/lib/types';
import { DataTable } from './data-table';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getCustomerColumns } from './customers-columns';
import { useAuth } from '@/context/auth-context';
import { getCustomerGroups } from '@/services/customer-groups';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { getStaff } from '@/services/staff';

export function CustomersTable({ 
    data, 
    setData, 
    isLoading, 
    columnFilters,
    setColumnFilters,
}: { 
    data: Customer[], 
    setData: React.Dispatch<React.SetStateAction<Customer[]>>, 
    isLoading: boolean,
    columnFilters: ColumnFiltersState,
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [customerGroups, setCustomerGroups] = React.useState<CustomerGroup[]>([]);
    const [staff, setStaff] = React.useState<Staff[]>([]);

    const canCreate = user?.permissions.customers.create;
    const canEdit = user?.permissions.customers.edit ?? false;
    const canDelete = user?.permissions.customers.delete ?? false;

    React.useEffect(() => {
        async function loadData() {
            const [groups, staffData] = await Promise.all([
                getCustomerGroups(),
                getStaff(),
            ]);
            setCustomerGroups(groups);
            setStaff(staffData.filter(s => s.role !== 'Affiliate'));
        }
        loadData();
    }, []);

    const handleDeleteCustomer = (customerId: string) => {
        // In a real app, call a service to delete the customer
        console.log("Deleting customer:", customerId);
        setData(prev => prev.filter(c => c.id !== customerId));
        toast({ title: "Customer Deleted", variant: "destructive" });
    };

    const columns = React.useMemo(() => getCustomerColumns(handleDeleteCustomer, canEdit, canDelete), [canEdit, canDelete]);
    
    const customerGroupOptions = customerGroups.map(g => ({ value: g.name, label: g.name }));
    const sourceOptions = [
        { value: 'Manual', label: 'Manual' },
        { value: 'Online', label: 'Online' },
    ];
    
    const createdByOptions = React.useMemo(() => {
        if (!user?.permissions.customers.viewAll) return [];
        return staff.map(s => ({ value: s.name!, label: s.name!}));
    }, [staff, user]);


  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      filters={[
        {
            columnId: 'customerGroup',
            title: 'Group',
            options: customerGroupOptions
        },
        {
            columnId: 'source',
            title: 'Source',
            options: sourceOptions
        },
        ...(user?.permissions.customers.viewAll ? [{
            columnId: 'createdByName',
            title: 'Added By',
            options: createdByOptions,
        }] : [])
      ]}
      emptyState={{
        icon: Users,
        title: "No Customers Found",
        description: "You do not have any customers matching the current filters, or you have not created any customers yet.",
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
