
'use client';
import { Save, Check, ChevronsUpDown, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { getCountryList } from '@/services/countries';
import { getProducts } from '@/services/products';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Product, Supplier } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const emptySupplier = {
    name: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    productsSupplied: [],
}

export function SupplierForm({ initialSupplier }: { initialSupplier?: Supplier | null }) {
  const [supplier, setSupplier] = useState<Partial<Supplier>>(initialSupplier || emptySupplier);
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [countryCode, setCountryCode] = useState('+256');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+256');
  const router = useRouter();
  const { user } = useAuth();
  
  const canCreate = user?.permissions.procurement.create;
  const canEdit = user?.permissions.procurement.edit;
  const isEditing = !!initialSupplier;

  useEffect(() => {
    async function loadData() {
        const [countryList, productList] = await Promise.all([
            getCountryList(),
            getProducts()
        ]);
        setCountries(countryList);
        setProducts(productList);
    }
    loadData();
    if(initialSupplier) {
        setSupplier(initialSupplier);
    }
  }, [initialSupplier]);

  const handleProductSelect = (productSku: string) => {
    setSupplier(prev => {
        const currentSelection = prev.productsSupplied || [];
        const newSelection = currentSelection.includes(productSku)
            ? currentSelection.filter(sku => sku !== productSku)
            : [...currentSelection, productSku];
        return { ...prev, productsSupplied: newSelection };
    });
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSupplier(prev => ({...prev, [e.target.id]: e.target.value}));
  }

  const handleSave = () => {
    // In a real app, this would call an API service
    console.log("Saving supplier", supplier);
    toast({
        title: initialSupplier ? "Supplier Updated" : "Supplier Created",
        description: `${supplier.name} has been saved.`
    });
    router.push('/dashboard/procurement');
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
    <div className="space-y-6 max-w-4xl">
       <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Supplier
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input id="name" placeholder="Enter supplier name" value={supplier.name} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input id="contactName" placeholder="Enter contact person's name" value={supplier.contactName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" placeholder="Enter contact email" value={supplier.email} onChange={handleInputChange} />
              </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (for Calls/SMS)</Label>
                <div className="flex items-center gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input id="phone" type="tel" placeholder="Enter phone number" value={supplier.phone} onChange={handleInputChange} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="flex items-center gap-2">
                  <Select value={whatsappCountryCode} onValueChange={setWhatsappCountryCode}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input id="whatsapp" type="tel" placeholder="Enter WhatsApp number" value={supplier.whatsapp || ''} onChange={handleInputChange} />
                </div>
            </div>
           </div>
          <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter full physical address" value={supplier.address} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
              <Label>Products Supplied</Label>
               <Popover>
                  <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-auto min-h-10"
                      >
                          <div className="flex flex-wrap gap-1">
                              {(supplier.productsSupplied || []).length > 0 
                                  ? (supplier.productsSupplied || []).map(sku => {
                                      const product = products.find(p => p.sku === sku);
                                      return <Badge key={sku} variant="secondary">{product?.name || sku}</Badge>;
                                  })
                                  : "Select products..."
                              }
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                          <CommandInput placeholder="Search products..." />
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                              {products.map((product) => (
                              <CommandItem
                                  key={product.sku}
                                  value={product.name}
                                  onSelect={() => handleProductSelect(product.sku || '')}
                              >
                                  <Check
                                  className={cn("mr-2 h-4 w-4",
                                      (supplier.productsSupplied || []).includes(product.sku || '') ? "opacity-100" : "opacity-0"
                                  )}
                                  />
                                  {product.name}
                              </CommandItem>
                              ))}
                          </CommandGroup>
                      </Command>
                  </PopoverContent>
              </Popover>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
