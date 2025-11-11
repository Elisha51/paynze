
'use client';
import { StaffForm } from '@/components/dashboard/staff-form';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useParams } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

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
            <DashboardPageLayout title="Loading Staff Profile...">
                 <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </DashboardPageLayout>
        )
    }

    if (!staffMember) {
        // This can happen on an invalid ID, redirect them.
        router.push('/dashboard/staff');
        return null;
    }

    return (
        <DashboardPageLayout title={`Edit ${staffMember.name}`} backHref={`/dashboard/staff/${staffMember.id}`}>
            <StaffForm initialStaff={staffMember} />
        </DashboardPageLayout>
    );
}
