
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountPage() {
  return (
    <div className="space-y-6">
        <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" placeholder="John Doe"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="+256772123456" placeholder="+256772123456"/>
            </div>
            <Button>Save Changes</Button>
        </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Your default shipping address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="1234 Makerere Hill Rd" placeholder="1234 Makerere Hill Rd"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue="Kampala" placeholder="Kampala"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="Uganda" placeholder="Uganda"/>
                </div>
            </div>
            <Button>Save Address</Button>
        </CardContent>
        </Card>
    </div>
  );
}
