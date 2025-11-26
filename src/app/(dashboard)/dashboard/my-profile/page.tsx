
'use client';
import { useAuth } from '@/context/auth-context';
import { StaffForm } from '@/components/dashboard/staff-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';
import { updateStaff } from '@/services/staff';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import type { Staff } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProfilePage() {
    const { user, setUser } = useAuth();
    
    if (!user) {
        return (
            <DashboardPageLayout title="My Profile">
                <div className="max-w-4xl space-y-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </DashboardPageLayout>
        );
    }
    
    const handleSave = async (updatedStaff: Partial<Staff>) => {
        if (!user) return;
        const savedStaff = await updateStaff(user.id, updatedStaff);
        setUser(prev => prev ? { ...prev, ...savedStaff } : null);
    }

    return (
         <DashboardPageLayout title="My Profile">
            <div className="max-w-4xl space-y-6">
                <StaffForm initialStaff={user} onSave={handleSave} isSelfEditing />
                <PasswordSettings />
            </div>
        </DashboardPageLayout>
    )
}
