
'use client';

import { useState, useEffect } from 'react';
import type { Staff } from '@/lib/types';
import { getStaff } from '@/services/staff';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';

const LOGGED_IN_STAFF_ID = 'staff-003';

export default function MyProfilePage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStaffData = async () => {
        setLoading(true);
        const [staffList] = await Promise.all([
            getStaff(),
        ]);
        const member = staffList.find(s => s.id === LOGGED_IN_STAFF_ID);
        
        if (member) {
            setStaffMember(member);
        }
        
        setLoading(false);
    };

    useEffect(() => {
        loadStaffData();
    }, []);

    const handleProfileUpdate = async (updatedStaff: Staff) => {
        // In a real app, this would call the service.
        // For now, we just update the state to reflect the change.
        setStaffMember(updatedStaff);
    };
    
    if (loading || !staffMember) {
        return (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-10 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information and account settings.</p>
                </div>
            </div>
            
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
