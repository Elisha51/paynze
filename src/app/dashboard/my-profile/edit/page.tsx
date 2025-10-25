
'use client';
import { useEffect, useState } from 'react';
import type { Staff } from '@/lib/types';
import { getStaff, updateStaff } from '@/services/staff';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';


const LOGGED_IN_STAFF_ID = 'staff-003';

export default function EditMyProfilePage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const staffList = await getStaff();
            const member = staffList.find(s => s.id === LOGGED_IN_STAFF_ID);
            setStaffMember(member || null);
            setLoading(false);
        }
        loadData();
    }, []);
    
    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }
    
    if (!staffMember) {
        return <div>Could not load your profile. Please try again.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/my-tasks">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to My Tasks</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Your Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information.</p>
                </div>
            </div>
            <StaffProfileForm staff={staffMember} onSave={updateStaff} />
        </div>
    );
}

