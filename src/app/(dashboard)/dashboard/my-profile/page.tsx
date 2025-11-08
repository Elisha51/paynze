
'use client';
import { useAuth } from '@/context/auth-context';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';
import { updateStaff } from '@/services/staff';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function MyProfilePage() {
    const { user, setUser } = useAuth();
    
    if (!user) {
        return <div>Loading profile...</div>;
    }
    
    const handleSave = async (updatedStaff: any) => {
        const savedStaff = await updateStaff(updatedStaff);
        setUser(prev => prev ? { ...prev, ...savedStaff } : null);
    }

    return (
         <DashboardPageLayout title="My Profile" description="Manage your personal information and password.">
            <div className="max-w-4xl space-y-6">
                <StaffProfileForm staff={user} onSave={handleSave} onCancel={() => {}} isSelfEditing />
                <PasswordSettings />
            </div>
        </DashboardPageLayout>
    )
}
