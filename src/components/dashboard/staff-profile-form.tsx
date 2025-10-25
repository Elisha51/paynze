
'use client';

import { useState } from 'react';
import type { Staff } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type StaffProfileFormProps = {
    staff: Staff;
    onSave: (updatedStaff: Staff) => Promise<void>;
    onCancel: () => void;
};

export function StaffProfileForm({ staff, onSave, onCancel }: StaffProfileFormProps) {
    const [formData, setFormData] = useState(staff);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };
    
    const handleSaveChanges = async () => {
        try {
            await onSave(formData);
            toast({
                title: "Profile Updated",
                description: "Your profile information has been saved.",
            });
            onCancel(); // Go back to view mode
        } catch(e) {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not save your profile. Please try again.",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name, contact details, and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                        <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                        <Input id="avatarUrl" value={formData.avatarUrl || ''} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
            </CardContent>
        </Card>
    )
}
