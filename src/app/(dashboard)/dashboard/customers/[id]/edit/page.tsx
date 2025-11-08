
'use client';
import { CustomerForm } from '@/components/dashboard/customer-form';
import { getCustomerById } from '@/services/customers';
import type { Customer } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
            <DashboardPageLayout title="Edit Customer">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9" />
                        <div className="space-y-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
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
             <DashboardPageLayout title="Error">
                <div className="text-center">
                    <p className="mb-4">Customer not found.</p>
                     <Button asChild variant="outline">
                        <Link href="/dashboard/customers">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Customers
                        </Link>
                    </Button>
                </div>
             </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title={`Edit ${customer.name}`}>
            <CustomerForm initialCustomer={customer} />
        </DashboardPageLayout>
    );
}
