
'use client';
import { Save, ShieldAlert, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { getCountryList } from '@/services/countries';
import type { Customer, CustomerGroup } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addCustomer, updateCustomer } from '@/services/customers';
import { getCustomerGroups } from '@/services/customer-groups';

const emptyCustomer: Partial<Customer> = {
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    customerGroup: 'default',
    shippingAddress: {
        street: '',
        city: '',
        country: 'Uganda',
        postalCode: '',
    },
    source: 'Manual'
};

export function CustomerForm({ initialCustomer }: { initialCustomer?: Customer | null }) {
  const [customer, setCustomer] = useState<Partial<Customer>>(initialCustomer || emptyCustomer);
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [countryCode, setCountryCode] = useState('+256');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+256');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const canCreate = user?.permissions.customers.create;
  const canEdit = user?.permissions.customers.edit;
  const isEditing = !!initialCustomer;

  useEffect(() => {
    async function loadInitialData() {
        const [countryList, groupData] = await Promise.all([
            getCountryList(),
            getCustomerGroups()
        ]);
        
        setCountries(countryList);
        setCustomerGroups(groupData);
        
        if (initialCustomer) {
            setCustomer(initialCustomer);
            const initialCountry = countryList.find(c => c.name === initialCustomer.shippingAddress?.country);
            if (initialCountry) {
                setCountryCode(initialCountry.dialCode);
                setWhatsappCountryCode(initialCountry.dialCode);
            }
        } else {
             const defaultCountry = countryList.find(c => c.name === 'Uganda');
             if (defaultCountry) {
                setCountryCode(defaultCountry.dialCode);
                setWhatsappCountryCode(defaultCountry.dialCode);
            }
        }
    }
    loadInitialData();

  }, [initialCustomer]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomer(prev => ({...prev, [id]: value }));
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomer(prev => ({...prev, shippingAddress: { ...prev.shippingAddress!, [id]: value }}));
  };
  
  const handleSelectChange = (id: 'customerGroup' | 'country', value: string) => {
      if (id === 'country') {
          setCustomer(prev => ({...prev, shippingAddress: { ...prev.shippingAddress!, country: value }}));
          const selectedCountry = countries.find(c => c.name === value);
          if (selectedCountry) {
            setCountryCode(selectedCountry.dialCode);
          }
      } else {
          setCustomer(prev => ({...prev, [id]: value as any}));
      }
  }
  
  const handleSave = async () => {
    if (!customer.name || !customer.email) {
        toast({ variant: 'destructive', title: 'Name and email are required.' });
        return;
    }

    try {
        if (isEditing && customer.id) {
            await updateCustomer(customer.id, customer as Customer);
        } else {
            if (!user) throw new Error("User not found");
            const newCustomerData = {
                ...customer,
                source: 'Manual' as const,
                createdById: user.id,
                createdByName: user.name,
            };
            await addCustomer(newCustomerData as Omit<Customer, 'id'>);
        }
        toast({
            title: initialCustomer ? "Customer Updated" : "Customer Created",
            description: `Customer ${customer.name} has been saved.`
        });
        router.push('/dashboard/customers');
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Save failed' });
    }
  }

  if ((isEditing && !canEdit) || (!isEditing && !canCreate)) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You do not have permission to perform this action.</p>
                 <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter customer's full name" value={customer.name || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" value={customer.email || ''} onChange={handleInputChange}/>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> Phone Number (for Calls/SMS)</Label>
                    <div className="flex items-center gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[120px]"><SelectValue placeholder="Code" /></SelectTrigger>
                        <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <Input id="phone" type="tel" placeholder="Enter phone number" value={customer.phone || ''} onChange={handleInputChange}/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> WhatsApp Number</Label>
                    <div className="flex items-center gap-2">
                        <Select value={whatsappCountryCode} onValueChange={setWhatsappCountryCode}>
                        <SelectTrigger className="w-[120px]"><SelectValue placeholder="Code" /></SelectTrigger>
                        <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <Input id="whatsapp" type="tel" placeholder="Enter WhatsApp number" value={customer.whatsapp || ''} onChange={handleInputChange}/>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="street">Address</Label>
                    <Input id="street" placeholder="e.g., 123 Main St" value={customer.shippingAddress?.street || ''} onChange={handleAddressChange}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="e.g., Kampala" value={customer.shippingAddress?.city || ''} onChange={handleAddressChange}/>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="country">Country</Label>
                        <Select value={customer.shippingAddress?.country} onValueChange={(v) => handleSelectChange('country', v)}>
                            <SelectTrigger id="country">
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="customerGroup">Group</Label>
                        <Select value={customer.customerGroup} onValueChange={(v) => handleSelectChange('customerGroup', v)}>
                            <SelectTrigger id="customerGroup">
                                <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent>
                                {customerGroups.map(group => (
                                    <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
       <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Customer
            </Button>
        </div>
    </div>
  );
}
