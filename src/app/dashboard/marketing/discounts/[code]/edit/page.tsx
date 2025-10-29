'use client';
import { ArrowLeft, Save, Percent, DollarSign, Trash2, Check, ChevronsUpDown, X, ShieldAlert } from 'lucide-react';
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
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useParams, useRouter } from 'next/navigation';
import type { Discount } from '@/lib/types';
import { getProducts } from '@/services/products';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { useAuth } from '@/context/auth-context';


const mockDiscounts: Discount[] = [
  { code: 'NEWBIE10', type: 'Percentage', value: 10, status: 'Active', redemptions: 152, minPurchase: 0, customerGroup: 'New Customers', applicableProductIds: [] },
  { code: 'SALE5K', type: 'Fixed Amount', value: 5000, status: 'Active', redemptions: 88, minPurchase: 50000, customerGroup: 'Everyone', applicableProductIds: ['KIT-001-RF', 'KIT-001-BG'] },
  { code: 'FLASH20', type: 'Percentage', value: 20, status: 'Expired', redemptions: 210, minPurchase: 0, customerGroup: 'Everyone', applicableProductIds: [] },
];

export default function EditDiscountPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const code = params.code as string;
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [hasMinPurchase, setHasMinPurchase] = useState(false);
    const [appliesTo, setAppliesTo] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    
    const canEdit = user?.permissions.dashboard.view; // Simplification, should be marketing perm

    useEffect(() => {
        async function loadProducts() {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        }
        loadProducts();

        const found = mockDiscounts.find(d => d.code === code);
        if (found) {
            setDiscount(found);
            setHasMinPurchase(found.minPurchase > 0);
            if(found.applicableProductIds && found.applicableProductIds.length > 0) {
              setAppliesTo('specific');
              setSelectedProducts(found.applicableProductIds);
            } else {
              setAppliesTo('all');
            }
        }
    }, [code]);

    const handleDiscountChange = (field: keyof Discount, value: any) => {
        setDiscount(prev => prev ? { ...prev, [field]: value } : null);
    }
    
    const handleProductSelect = (productSku: string) => {
        setSelectedProducts(prev => {
            const newSelection = prev.includes(productSku)
                ? prev.filter(sku => sku !== productSku)
                : [...prev, productSku];
            handleDiscountChange('applicableProductIds', newSelection);
            return newSelection;
        });
    }

    const handleBack = () => {
        router.back();
    }

    if (!canEdit) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You do not have permission to edit discounts.</p>
                     <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!discount) {
        return <div>Discount not found</div>
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Discount</h1>
          <p className="text-muted-foreground text-sm">Editing discount code: {discount.code}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="destructive" >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Discount Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="code">Discount Code</Label>
                        <Input id="code" value={discount.code} disabled />
                    </div>
                    <RadioGroup value={discount.type} onValueChange={(v) => handleDiscountChange('type', v)} className="flex gap-4">
                        <Label htmlFor="percentage" className="flex items-center gap-2 border p-4 rounded-md flex-1 cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="Percentage" id="percentage" />
                            <Percent className="h-5 w-5" />
                            Percentage
                        </Label>
                        <Label htmlFor="fixed" className="flex items-center gap-2 border p-4 rounded-md flex-1 cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="Fixed Amount" id="fixed" />
                            <DollarSign className="h-5 w-5" />
                            Fixed Amount
                        </Label>
                    </RadioGroup>
                    <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input id="value" type="number" value={discount.value} onChange={(e) => handleDiscountChange('value', Number(e.target.value))} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Applies To</CardTitle>
                    <CardDescription>Specify which products this discount can be used with.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={appliesTo} onValueChange={setAppliesTo} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all-products" />
                            <Label htmlFor="all-products">All products</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="specific" id="specific-products" />
                            <Label htmlFor="specific-products">Specific products</Label>
                        </div>
                    </RadioGroup>
                    {appliesTo === 'specific' && (
                        <div className="pt-4 pl-6 space-y-2">
                             <Label>Products</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        <span className="truncate">
                                            {selectedProducts.length > 0 
                                                ? `${selectedProducts.length} selected`
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
                                                    selectedProducts.includes(product.sku || '') ? "opacity-100" : "opacity-0"
                                                )}
                                                />
                                                {product.name}
                                            </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                             <div className="flex flex-wrap gap-1 pt-2">
                              {selectedProducts.map(sku => {
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
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Conditions</CardTitle>
                    <CardDescription>Set rules for when this discount can be used.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                        <Switch id="hasMinPurchase" checked={hasMinPurchase} onCheckedChange={setHasMinPurchase} />
                        <div className="space-y-1 leading-none">
                            <Label htmlFor="hasMinPurchase">Minimum purchase requirement</Label>
                            <p className="text-xs text-muted-foreground">
                                Customer must spend a certain amount to use this code.
                            </p>
                            {hasMinPurchase && (
                                <div className="pt-2">
                                     <Input type="number" value={discount.minPurchase > 0 ? discount.minPurchase : ''} placeholder="e.g., 50000" onChange={(e) => handleDiscountChange('minPurchase', Number(e.target.value))} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerGroup">Customer eligibility</Label>
                        <Select value={discount.customerGroup} onValueChange={(v) => handleDiscountChange('customerGroup', v)}>
                            <SelectTrigger id="customerGroup">
                                <SelectValue placeholder="Select who can use this" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Everyone">Everyone</SelectItem>
                                <SelectItem value="New Customers">New Customers</SelectItem>
                                <SelectItem value="Wholesalers">Wholesalers</SelectItem>
                                <SelectItem value="Retailers">Retailers</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
         <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Select value={discount.status} onValueChange={(v) => handleDiscountChange('status', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                     </Select>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Redemptions</span>
                        <span className="font-medium">{discount.redemptions}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
