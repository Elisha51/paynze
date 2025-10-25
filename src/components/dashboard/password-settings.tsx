
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Info } from 'lucide-react';

export function PasswordSettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { toast } = useToast();

    const handleUpdatePassword = () => {
        if (!newPassword || newPassword !== confirmPassword) {
             toast({
                variant: 'destructive',
                title: "Passwords do not match",
                description: "Please ensure your new password and confirmation match.",
            });
            return;
        }

        if (newPassword.length < 8) {
             toast({
                variant: 'destructive',
                title: "Password is too short",
                description: "Your new password must be at least 8 characters long.",
            });
            return;
        }

        // Simulate successful password change
        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here. After saving, you will be logged out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Backend Simulation</AlertTitle>
                    <AlertDescription>
                        This is a UI demonstration. Password changes are not actually saved.
                    </AlertDescription>
                </Alert>
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <Button onClick={handleUpdatePassword}>Update Password</Button>
            </CardContent>
        </Card>
    );
}
