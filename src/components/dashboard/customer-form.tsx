
'use client';
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import type { Customer } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const emptyCustomer: Partial<Customer> = {
    name: '',
    email: '',
    phone: '',
    customerGroup: 'default',
};

export function CustomerForm({ initialCustomer }: { initialCustomer?: Customer | null }) {
  const [customer, setCustomer] = useState<Partial<Customer>>(initialCustomer || emptyCustomer);
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const canCreate = user?.permissions.customers.create;
  const canEdit = user?.permissions.customers.edit;
  const isEditing = !!initialCustomer;

  useEffect(() => {
    async function loadCountries() {
        const countryList = await getCountryList();
        setCountries(countryList);
    }
    loadCountries();

    if (initialCustomer) {
        setCustomer(initialCustomer);
    }
  }, [initialCustomer]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomer(prev => ({...prev, [id]: value }));
  }
  
  const handleSelectChange = (id: 'customerGroup' | 'country', value: string) => {
      // In a real app you might have a more complex address object
      if (id === 'country') {
          // This is a simplification
          console.log('Country changed to:', value);
      } else {
          setCustomer(prev => ({...prev, [id]: value as any}));
      }
  }
  
  const handleSave = () => {
    // Mock saving logic
    console.log("Saving customer", customer);
    toast({
        title: initialCustomer ? "Customer Updated" : "Customer Created",
        description: `Customer ${customer.name} has been saved.`
    });
    router.push('/dashboard/customers');
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{initialCustomer ? 'Edit Customer' : 'Add New Customer'}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Customer
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="e.g., John Doe" value={customer.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="e.g., john.doe@example.com" value={customer.email} onChange={handleInputChange}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                 <div className="flex items-center gap-2">
                    <Select defaultValue="+254">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <Input id="phone" type="tel" placeholder="712 345 678" value={customer.phone} onChange={handleInputChange}/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Primary shipping address for the customer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="e.g., 123 Main St"/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="e.g., Nairobi"/>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="country">Country</Label>
                        <Select onValueChange={(v) => handleSelectChange('country', v)}>
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
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                                <SelectItem value="Retailer">Retailer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
