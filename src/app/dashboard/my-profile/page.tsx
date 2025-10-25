
'use client';

import { useState, useEffect } from 'react';
import type { Staff } from '@/lib/types';
import { getStaff } from '@/services/staff';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';

const LOGGED_IN_STAFF_ID = 'staff-003';

const ProfileView = ({ staff, onEditClick }: { staff: Staff, onEditClick: () => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>This is how your profile appears to other team members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                    <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">{staff.name}</h3>
                    <p className="text-muted-foreground">{staff.role}</p>
                </div>
            </div>
            <div className="space-y-2">
                <p><strong>Email:</strong> {staff.email}</p>
                <p><strong>Phone:</strong> {staff.phone || 'Not provided'}</p>
            </div>
            <Button onClick={onEditClick}>Edit Profile</Button>
        </CardContent>
    </Card>
);

export default function MyProfilePage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const loadStaffData = async () => {
        setLoading(true);
        const staffList = await getStaff();
        const member = staffList.find(s => s.id === LOGGED_IN_STAFF_ID);
        setStaffMember(member || null);
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

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-5 gap-4">
                    <Skeleton className="h-10 col-span-1" />
                    <Skeleton className="h-10 col-span-1" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    if (!staffMember) {
        return <div>Could not load your profile. Please try again.</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    {isEditing ? (
                        <StaffProfileForm 
                            staff={staffMember}
                            onSave={handleProfileUpdate}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <ProfileView 
                            staff={staffMember}
                            onEditClick={() => setIsEditing(true)}
                        />
                    )}
                </TabsContent>
                <TabsContent value="security">
                   <PasswordSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
