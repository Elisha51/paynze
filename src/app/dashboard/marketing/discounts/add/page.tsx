
'use client';
import { ArrowLeft, Save, Percent, DollarSign, Check, ChevronsUpDown, X } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { getProducts } from '@/services/products';
import type { Product, Discount } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AddDiscountPage() {
    const [discountCode, setDiscountCode] = useState('');
    const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
    const [hasMinPurchase, setHasMinPurchase] = useState(false);
    const [appliesTo, setAppliesTo] = useState('all'); // 'all' or 'specific'
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const { toast } = useToast();
    const router = useRouter();


    useEffect(() => {
        async function loadProducts() {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        }
        loadProducts();
    }, []);

    const handleProductSelect = (productSku: string) => {
        setSelectedProducts(prev => {
            const newSelection = prev.includes(productSku)
                ? prev.filter(sku => sku !== productSku)
                : [...prev, productSku];
            return newSelection;
        });
    }

    const generateCode = () => {
        const code = `SUMMER${Math.floor(10 + Math.random() * 90)}`;
        setDiscountCode(code);
    }

    const handleSave = () => {
        // Mock save logic
        toast({
            title: "Discount Created",
            description: `Discount code "${discountCode}" has been created.`
        });
        router.push('/dashboard/marketing?tab=discounts');
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
          <h1 className="text-2xl font-bold tracking-tight">Create New Discount</h1>
          <p className="text-muted-foreground text-sm">Configure a new discount code for your store.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Discount
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
                        <div className="flex gap-2">
                            <Input id="code" placeholder="e.g., EID2024" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} />
                            <Button variant="outline" onClick={generateCode}>Generate Code</Button>
                        </div>
                    </div>
                    <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as any)} className="flex gap-4">
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
                        <Input id="value" type="number" placeholder={discountType === 'Percentage' ? 'e.g., 15' : 'e.g., 5000'} />
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
                             <div className="flex flex-wrap gap-1 pt-1">
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
                                     <Input type="number" placeholder="e.g., 50000" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerGroup">Customer eligibility</Label>
                        <Select defaultValue="Everyone">
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
      </div>
    </div>
  );
}
