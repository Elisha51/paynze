
'use client';

import { PlusCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CustomersTable } from '@/components/dashboard/customers-table';
import { getCustomerColumns } from '@/components/dashboard/customers-columns';
import { useState, useEffect, useMemo } from 'react';
import type { Customer } from '@/lib/types';
import { getCustomers } from '@/services/customers';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setIsLoading(false);
    }
    loadData();
  }, []);
  
  const columns = useMemo(() => getCustomerColumns(), []);

  return (
    <DashboardPageLayout 
        title="Customers"
        cta={
            <div className="flex gap-2">
                <Button variant="outline"><Send className="mr-2 h-4 w-4" /> Message</Button>
                <Button asChild>
                    <Link href="/dashboard/customers/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Link>
                </Button>
            </div>
        }
    >
        <DashboardPageLayout.Content>
            <CustomersTable columns={columns} data={customers} isLoading={isLoading} />
        </DashboardPageLayout.Content>
    </DashboardPageLayout>
  );
}
