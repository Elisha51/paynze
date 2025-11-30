
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCountryList } from '@/services/countries';

export default function AccountPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [countryCode, setCountryCode] = useState('+256');

  useEffect(() => {
    async function loadData() {
      const [countryList, loggedInCustomerId] = await Promise.all([
          getCountryList(),
          localStorage.getItem('loggedInCustomerId')
      ]);
      
      setCountries(countryList);

      if (loggedInCustomerId) {
        const cust = await getCustomerById(loggedInCustomerId);
        setCustomer(cust || null);
        if (cust?.phone) {
            const country = countryList.find(c => cust.phone.startsWith(c.dialCode));
            if (country) {
                setCountryCode(country.dialCode);
            }
        }
      }
      setLoading(false);
    }
    loadData();
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
        const phoneWithoutCode = customer.phone?.replace(countryCode, '');
        const updatedCustomerData = { ...customer, phone: `${countryCode}${phoneWithoutCode}` };

        const updated = await updateCustomer(updatedCustomerData);
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
  
  const phoneWithoutCode = customer.phone?.startsWith(countryCode) ? customer.phone.substring(countryCode.length) : customer.phone;

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
                <div className="flex items-center gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input id="phone" type="tel" value={phoneWithoutCode} onChange={handleInputChange} placeholder="772123456"/>
                </div>
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
