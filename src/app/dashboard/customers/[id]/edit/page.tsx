'use client';

import { CustomerForm } from '@/components/dashboard/customer-form';
import { getCustomerById } from '@/services/customers';
import type { Customer } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCustomerPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const fetchedCustomer = await getCustomerById(id);
        setCustomer(fetchedCustomer || null);
        setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
      return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-64 w-full" />
        </div>
      );
  }

  if (!customer) {
      return <div>Customer not found.</div>
  }

  return <CustomerForm initialCustomer={customer} />;
}
