
'use client';

import { useState, useEffect } from 'react';
import type { Staff } from '@/lib/types';
import { getStaff } from '@/services/staff';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';
import { useAuth } from '@/context/auth-context';


export default function MyProfilePage() {
    const { user, setUser } = useAuth();
    const [staffMember, setStaffMember] = useState<Staff | null>(user);

    useEffect(() => {
        setStaffMember(user);
    }, [user]);

    const handleProfileUpdate = async (updatedStaff: Staff) => {
        // In a real app, this would call the service.
        // For our simulation, we just update the state in the context.
        setUser(updatedStaff);
        setStaffMember(updatedStaff);
    };
    
    if (!staffMember) {
        return (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StaffProfileForm 
                    staff={staffMember}
                    onSave={handleProfileUpdate}
                    onCancel={() => {}} // In this context, save just updates state
                    isSelfEditing={true}
                />
                <PasswordSettings />
            </div>
        </div>
    );
}
