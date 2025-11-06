

'use client';
import { useAuth } from '@/context/auth-context';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';
import { updateStaff } from '@/services/staff';

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
        <div className="space-y-6 max-w-4xl mx-auto">
             <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and password.</p>
            </div>
            <StaffProfileForm staff={user} onSave={handleSave} onCancel={() => {}} isSelfEditing />
            <PasswordSettings />
        </div>
    )
}
