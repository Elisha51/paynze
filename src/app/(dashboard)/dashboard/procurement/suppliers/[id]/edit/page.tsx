
'use client';
import { SupplierForm } from '@/components/dashboard/supplier-form';
import { getSupplierById } from '@/services/procurement';
import type { Supplier } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function EditSupplierPage() {
    const params = useParams();
    const id = params.id as string;
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const fetchedSupplier = await getSupplierById(id);
            setSupplier(fetchedSupplier || null);
            setIsLoading(false);
        }
        if (id) {
            loadData();
        }
    }, [id]);

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    return <SupplierForm initialSupplier={supplier} />;
}
