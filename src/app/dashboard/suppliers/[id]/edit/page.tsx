
'use client';

import { SupplierForm } from '@/components/dashboard/supplier-form';
import { getSupplierById } from '@/services/procurement';
import type { Supplier } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSupplierPage() {
  const params = useParams();
  const id = params.id as string;
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const fetchedSupplier = await getSupplierById(id);
        setSupplier(fetchedSupplier || null);
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

  if (!supplier) {
      return <div>Supplier not found.</div>
  }

  return <SupplierForm initialSupplier={supplier} />;
}
