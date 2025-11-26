
'use client';
import { CustomerForm } from '@/components/dashboard/customer-form';
import { getCustomerById } from '@/services/customers';
import type { Customer } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function EditCustomerPage() {
    const params = useParams();
    const id = params.id as string;
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCustomer() {
            const fetchedCustomer = await getCustomerById(id);
            setCustomer(fetchedCustomer || null);
            setIsLoading(false);
        }
        if (id) {
            loadCustomer();
        }
    }, [id]);

    if (isLoading) {
        return (
            <DashboardPageLayout title="Loading Customer...">
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="lg:col-span-1">
                            <Skeleton className="h-48 w-full" />
                        </div>
                    </div>
                </div>
            </DashboardPageLayout>
        )
    }

    if (!customer) {
        return (
             <DashboardPageLayout title="Error" backHref="/dashboard/customers">
                <div className="text-center">
                    <p className="mb-4">Customer not found.</p>
                </div>
             </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title={`Edit ${customer.name}`} backHref={`/dashboard/customers/${customer.id}`}>
            <CustomerForm initialCustomer={customer} />
        </DashboardPageLayout>
    );
}
