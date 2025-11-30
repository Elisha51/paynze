'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCustomerById, updateCustomer } from '@/services/customers';
import type { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCustomer() {
      // In a real app, you'd get the ID from a session.
      const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
      if (loggedInCustomerId) {
        const cust = await getCustomerById(loggedInCustomerId);
        setCustomer(cust || null);
      }
      setLoading(false);
    }
    loadCustomer();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomer(prev => prev ? ({ ...prev, [id]: value }) : null);
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (customer) {
        setCustomer({
            ...customer,
            shippingAddress: {
                ...customer.shippingAddress,
                [id]: value
            }
        });
    }
  }

  const handleSaveChanges = async () => {
    if (!customer) return;
    try {
        const updated = await updateCustomer(customer);
        setCustomer(updated);
        toast({ title: "Profile Updated", description: "Your personal information has been saved." });
    } catch (e) {
        toast({ variant: 'destructive', title: "Update Failed", description: "Could not save your changes." });
    }
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  if (!customer) {
      return (
          <Card>
              <CardHeader><CardTitle>Error</CardTitle></CardHeader>
              <CardContent><p>Could not load customer profile.</p></CardContent>
          </Card>
      )
  }

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
                <Input id="name" value={customer.name} onChange={handleInputChange} placeholder="John Doe"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={customer.email} disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={customer.phone} onChange={handleInputChange} placeholder="+256772123456"/>
            </div>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Your default shipping address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="street">Address</Label>
                <Input id="street" value={customer.shippingAddress?.street || ''} onChange={handleAddressChange} placeholder="1234 Makerere Hill Rd"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={customer.shippingAddress?.city || ''} onChange={handleAddressChange} placeholder="Kampala"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={customer.shippingAddress?.country || ''} onChange={handleAddressChange} placeholder="Uganda"/>
                </div>
            </div>
            <Button onClick={handleSaveChanges}>Save Address</Button>
        </CardContent>
        </Card>
    </div>
  );
}
