
'use client';
import { StaffForm } from '@/components/dashboard/staff-form';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useParams } from 'next/navigation';

export default function EditStaffPage() {
    const params = useParams();
    const id = params.id as string;
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadStaff() {
            const allStaff = await getStaff();
            const foundStaff = allStaff.find(s => s.id === id);
            setStaffMember(foundStaff || null);
            setIsLoading(false);
        }
        if (id) {
            loadStaff();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    if (!staffMember) {
        router.push('/dashboard/staff');
        return null;
    }

    return <StaffForm initialStaff={staffMember} />;
}
