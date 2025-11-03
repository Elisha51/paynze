
'use client';
import { SupplierForm } from '@/components/dashboard/supplier-form';
import { getSupplierById } from '@/services/procurement';
import type { Supplier } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSupplierPage({ params }: { params: { id: string } }) {
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const fetchedSupplier = await getSupplierById(params.id);
            setSupplier(fetchedSupplier || null);
            setIsLoading(false);
        }
        loadData();
    }, [params.id]);

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    return <SupplierForm initialSupplier={supplier} />;
}
