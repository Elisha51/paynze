
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Mock customer data for demonstration
const mockCustomer = {
    name: 'Amelia Barlow',
    email: 'amelia.b@example.com'
}

export default function MyProfilePage() {
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Manage your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={mockCustomer.name} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={mockCustomer.email} disabled />
                    </div>
                </div>
                <div className="space-y-4 pt-6 border-t">
                     <h4 className="font-medium">Change Password</h4>
                     <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                    </div>
                </div>
                 <Button>Save Changes</Button>
            </CardContent>
        </Card>
    );
}
