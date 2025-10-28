

'use client';
import { ArrowLeft, Save, Check, ChevronsUpDown, X } from 'lucide-react';
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
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { getCountryList } from '@/services/countries';
import { getProducts } from '@/services/products';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Product, Supplier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const emptySupplier = {
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    productsSupplied: [],
}

export function SupplierForm({ initialSupplier }: { initialSupplier?: Supplier | null }) {
  const [supplier, setSupplier] = useState<Partial<Supplier>>(initialSupplier || emptySupplier);
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  
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
  }, []);

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

  const handleBack = () => {
      router.back();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{initialSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h1>
          <p className="text-muted-foreground text-sm">{initialSupplier ? `Editing ${initialSupplier.name}` : 'Fill in the details to create a new supplier.'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Supplier
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input id="name" placeholder="e.g., Kitenge Kings" value={supplier.name} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input id="contactName" placeholder="e.g., Grace Nakato" value={supplier.contactName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" placeholder="e.g., grace@kitengekings.com" value={supplier.email} onChange={handleInputChange} />
              </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Select defaultValue="+256">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input id="phone" type="tel" placeholder="772 111 222" value={supplier.phone} onChange={handleInputChange} />
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="e.g., 123 Textile Road, Kampala" value={supplier.address} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
              <Label>Products Supplied</Label>
               <Popover>
                  <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                      >
                          <span className="truncate">
                              {supplier.productsSupplied && supplier.productsSupplied.length > 0 
                                  ? `${supplier.productsSupplied.length} selected`
                                  : "Select products..."
                              }
                          </span>
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
                                  className={cn(
                                      "mr-2 h-4 w-4",
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
               <div className="flex flex-wrap gap-1 pt-1">
                {(supplier.productsSupplied || []).map(sku => {
                  const product = products.find(p => p.sku === sku);
                  return product ? (
                      <Badge key={sku} variant="secondary" className="flex items-center gap-1">
                      {product.name}
                      <button onClick={() => handleProductSelect(sku)} className="rounded-full hover:bg-muted-foreground/20">
                          <X className="h-3 w-3"/>
                      </button>
                      </Badge>
                  ) : null;
                })}
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
