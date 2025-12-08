
'use client';

import { Save, Sparkles, Ticket, Check, ChevronsUpDown } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Discount, OnboardingFormData, Product, Affiliate } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Switch } from '../ui/switch';
import { getProducts } from '@/services/products';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { getAffiliates } from '@/services/affiliates';

const emptyDiscount: Omit<Discount, 'code'> & { code?: string } = {
  type: 'Percentage',
  value: 10,
  status: 'Active',
  currency: 'UGX',
  redemptions: 0,
  minPurchase: 0,
  customerGroup: 'Everyone',
  usageLimit: null,
  onePerCustomer: true,
  startDate: new Date().toISOString(),
  allowedAffiliateIds: [],
  bogoDetails: {
      buyQuantity: 1,
      buyProductIds: [],
      getQuantity: 1,
      getProductIds: [],
      getDiscountPercentage: 100,
  },
  applicableProductIds: [],
};

type DiscountFormProps = {
    initialDiscount?: Discount | null;
}

type ApplicabilityType = 'all' | 'specific';

const ProductSelector = ({
    label,
    allProducts,
    selectedProductIds,
    onSelect
}: {
    label: string,
    allProducts: Product[],
    selectedProductIds: string[],
    onSelect: (sku: string) => void
}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                    <div className="flex flex-wrap gap-1">
                        {selectedProductIds.length > 0
                            ? selectedProductIds.map(id => {
                                const product = allProducts.find(p => p.sku === id);
                                return <Badge key={id} variant="secondary">{product?.name || id}</Badge>;
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
                        {allProducts.map((product) => (
                        <CommandItem key={product.sku} value={product.name} onSelect={() => onSelect(product.sku || '')}>
                            <Check className={cn("mr-2 h-4 w-4", selectedProductIds.includes(product.sku || '') ? "opacity-100" : "opacity-0")} />
                            {product.name}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    </div>
);


export function DiscountForm({ initialDiscount }: DiscountFormProps) {
    const [discount, setDiscount] = useState<Partial<Discount>>(initialDiscount || emptyDiscount);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        initialDiscount?.startDate ? {
            from: new Date(initialDiscount.startDate),
            to: initialDiscount.endDate ? new Date(initialDiscount.endDate) : undefined,
        } : undefined
    );
    const [hasUsageLimit, setHasUsageLimit] = useState(!!initialDiscount?.usageLimit);
    const [applicability, setApplicability] = useState<ApplicabilityType>('all');

    const router = useRouter();
    const { toast } = useToast();
    const isEditing = !!initialDiscount;

    useEffect(() => {
        if (initialDiscount) {
            setDiscount(initialDiscount);
            setHasUsageLimit(!!initialDiscount.usageLimit);
            if (initialDiscount.applicableProductIds && initialDiscount.applicableProductIds.length > 0) {
                setApplicability('specific');
            } else {
                setApplicability('all');
            }
        }
        
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        async function loadData() {
            const [productData, affiliateData] = await Promise.all([
                getProducts(),
                getAffiliates()
            ]);
            setProducts(productData);
            setAffiliates(affiliateData.filter(a => a.status === 'Active'));
        }
        loadData();
    }, [initialDiscount]);

    useEffect(() => {
        if (initialDiscount?.applicableProductIds && initialDiscount.applicableProductIds.length > 0) {
            setApplicability('specific');
        } else {
            setApplicability('all');
        }
    }, [initialDiscount]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setDiscount(prev => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setDiscount(prev => ({ ...prev, [id]: Number(value) }));
    };

    const handleSelectChange = (id: 'type' | 'customerGroup' | 'currency', value: string) => {
        setDiscount(prev => ({...prev, [id]: value as any}));
    }
    
    const handleCheckboxChange = (id: 'onePerCustomer', checked: boolean) => {
        setDiscount(prev => ({...prev, [id]: checked }));
    }
    
    const handleBogoChange = (field: 'buyQuantity' | 'getQuantity' | 'getDiscountPercentage', value: number) => {
        setDiscount(prev => ({ ...prev, bogoDetails: { ...(prev.bogoDetails || {}), [field]: value } as any }));
    }

    const handleBogoProductChange = (type: 'buyProductIds' | 'getProductIds', sku: string) => {
        setDiscount(prev => {
            const currentIds = prev.bogoDetails?.[type] || [];
            const newIds = currentIds.includes(sku) ? currentIds.filter(id => id !== sku) : [...currentIds, sku];
            return { ...prev, bogoDetails: { ...(prev.bogoDetails || {}), [type]: newIds } as any };
        });
    }

     const handleApplicableProductChange = (sku: string) => {
        setDiscount(prev => {
            const currentIds = prev.applicableProductIds || [];
            const newIds = currentIds.includes(sku) ? currentIds.filter(id => id !== sku) : [...currentIds, sku];
            return { ...prev, applicableProductIds: newIds };
        });
    }

    const handleAffiliateSelect = (affiliateId: string) => {
        setDiscount(prev => {
            const currentIds = prev.allowedAffiliateIds || [];
            const newIds = currentIds.includes(affiliateId)
                ? currentIds.filter(id => id !== affiliateId)
                : [...currentIds, affiliateId];
            return { ...prev, allowedAffiliateIds: newIds };
        })
    }

    const generateCode = () => {
        const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
        setDiscount(prev => ({...prev, code: randomString}));
    }

    const handleSave = () => {
        // In a real app, this would be a service call
        const finalDiscount: Partial<Discount> = {
            ...discount,
            startDate: dateRange?.from?.toISOString(),
            endDate: dateRange?.to?.toISOString(),
        };

        if (!hasUsageLimit) {
            finalDiscount.usageLimit = null;
        }

        if (applicability === 'all') {
            finalDiscount.applicableProductIds = [];
        }

        console.log("Saving discount", finalDiscount);
        toast({
            title: isEditing ? "Discount Updated" : "Discount Created",
            description: `Discount code "${finalDiscount.code}" has been saved.`
        });
        router.push('/dashboard/marketing?tab=discounts');
    }

    const currency = settings?.currency || 'UGX';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save {isEditing ? 'Changes' : 'Discount'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Discount Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Discount Code</Label>
                                <div className="flex gap-2">
                                    <Input id="code" value={discount.code || ''} onChange={handleInputChange} placeholder="e.g. EID2024" />
                                    <Button variant="outline" onClick={generateCode}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate
                                    </Button>
                                </div>
                            </div>
                            <RadioGroup value={discount.type} onValueChange={(v) => handleSelectChange('type', v)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <RadioGroupItem value="Percentage" id="type-percentage" className="peer sr-only" />
                                    <Label htmlFor="type-percentage" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        <Ticket className="mb-3 h-6 w-6" />
                                        Percentage
                                    </Label>
                                </div>
                                 <div>
                                    <RadioGroupItem value="Fixed Amount" id="type-fixed" className="peer sr-only" />
                                    <Label htmlFor="type-fixed" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                         <Ticket className="mb-3 h-6 w-6" />
                                        Fixed Amount
                                    </Label>
                                </div>
                                 <div>
                                    <RadioGroupItem value="Buy X Get Y" id="type-bogo" className="peer sr-only" />
                                    <Label htmlFor="type-bogo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                         <Ticket className="mb-3 h-6 w-6" />
                                        Buy X Get Y
                                    </Label>
                                </div>
                            </RadioGroup>
                            
                            {discount.type !== 'Buy X Get Y' && (
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="value" type="number" value={discount.value || ''} onChange={handleNumberChange} className="flex-1" placeholder="e.g. 15"/>
                                        {discount.type === 'Percentage' ? (
                                            <span className="text-muted-foreground text-sm p-2 bg-muted rounded-md border">%</span>
                                        ) : (
                                            <Select value={discount.currency || currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                                                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UGX">UGX</SelectItem>
                                                    <SelectItem value="KES">KES</SelectItem>
                                                    <SelectItem value="TZS">TZS</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                            )}

                             {discount.type === 'Buy X Get Y' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Card>
                                        <CardHeader><CardTitle className="text-base">Customer Buys</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="buyQuantity">Quantity</Label>
                                                <Input id="buyQuantity" type="number" value={discount.bogoDetails?.buyQuantity} onChange={(e) => handleBogoChange('buyQuantity', Number(e.target.value))} placeholder="1" />
                                            </div>
                                            <ProductSelector
                                                label="Specific products"
                                                allProducts={products}
                                                selectedProductIds={discount.bogoDetails?.buyProductIds || []}
                                                onSelect={(sku) => handleBogoProductChange('buyProductIds', sku)}
                                            />
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-base">Customer Gets</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="getQuantity">Quantity</Label>
                                                <Input id="getQuantity" type="number" value={discount.bogoDetails?.getQuantity} onChange={(e) => handleBogoChange('getQuantity', Number(e.target.value))} placeholder="1"/>
                                            </div>
                                            <ProductSelector
                                                label="Specific products"
                                                allProducts={products}
                                                selectedProductIds={discount.bogoDetails?.getProductIds || []}
                                                onSelect={(sku) => handleBogoProductChange('getProductIds', sku)}
                                            />
                                            <div className="space-y-2">
                                                <Label htmlFor="getDiscountPercentage">Discount Percentage on 'Get' items</Label>
                                                <div className="relative">
                                                    <Input id="getDiscountPercentage" type="number" value={discount.bogoDetails?.getDiscountPercentage} onChange={(e) => handleBogoChange('getDiscountPercentage', Number(e.target.value))} className="pr-8" placeholder="100"/>
                                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Enter 100 for a "Buy One, Get One Free" offer.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                             )}

                        </CardContent>
                    </Card>
                    
                    {discount.type !== 'Buy X Get Y' && (
                        <Card>
                            <CardHeader><CardTitle>Applicability</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup value={applicability} onValueChange={(v) => setApplicability(v as ApplicabilityType)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="apply-all" />
                                        <Label htmlFor="apply-all">All products</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="specific" id="apply-specific" />
                                        <Label htmlFor="apply-specific">Specific products</Label>
                                    </div>
                                </RadioGroup>
                                {applicability === 'specific' && (
                                    <div className="pt-2 pl-6">
                                        <ProductSelector
                                            label="Select products this discount applies to"
                                            allProducts={products}
                                            selectedProductIds={discount.applicableProductIds || []}
                                            onSelect={handleApplicableProductChange}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}


                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="hasUsageLimit" checked={hasUsageLimit} onCheckedChange={setHasUsageLimit} />
                                <Label htmlFor="hasUsageLimit">Limit number of times this discount can be used in total</Label>
                            </div>
                             {hasUsageLimit && (
                                <div className="pl-8 space-y-2">
                                    <Input id="usageLimit" type="number" value={discount.usageLimit || ''} onChange={handleNumberChange} className="max-w-xs" placeholder="e.g. 500" />
                                </div>
                             )}
                            <div className="flex items-center space-x-2">
                                <Switch id="onePerCustomer" checked={!!discount.onePerCustomer} onCheckedChange={(c) => handleCheckboxChange('onePerCustomer', c as boolean)} />
                                <Label htmlFor="onePerCustomer">Limit to one use per customer</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={discount.status} onValueChange={(v) => setDiscount(p => ({...p, status: v as any}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Eligibility</Label>
                                <Select value={discount.customerGroup} onValueChange={(v) => handleSelectChange('customerGroup', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Everyone">Everyone</SelectItem>
                                        <SelectItem value="No Affiliates">Store Only (No Affiliates)</SelectItem>
                                        <SelectItem value="New Customers">New Customers</SelectItem>
                                        <SelectItem value="Wholesalers">Wholesalers</SelectItem>
                                        <SelectItem value="Retailers">Retailers</SelectItem>
                                        <SelectItem value="Specific Affiliates">Specific Affiliates</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {discount.customerGroup === 'Specific Affiliates' && (
                                <div className="space-y-2">
                                    <Label>Allowed Affiliates</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                                <div className="flex flex-wrap gap-1">
                                                    {(discount.allowedAffiliateIds || []).length > 0
                                                        ? (discount.allowedAffiliateIds || []).map(id => {
                                                            const affiliate = affiliates.find(a => a.id === id);
                                                            return <Badge key={id} variant="secondary">{affiliate?.name || id}</Badge>;
                                                        })
                                                        : "Select affiliates..."
                                                    }
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search affiliates..." />
                                                <CommandEmpty>No affiliates found.</CommandEmpty>
                                                <CommandGroup>
                                                    {affiliates.map((affiliate) => (
                                                    <CommandItem
                                                        key={affiliate.id}
                                                        value={affiliate.name}
                                                        onSelect={() => handleAffiliateSelect(affiliate.id)}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", (discount.allowedAffiliateIds || []).includes(affiliate.id) ? "opacity-100" : "opacity-0")} />
                                                        {affiliate.name}
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="minPurchase">Minimum purchase requirement</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="minPurchase" type="number" value={discount.minPurchase || ''} onChange={handleNumberChange} className="flex-1" placeholder="e.g. 50000" />
                                     <Select value={discount.currency || currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                                        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UGX">UGX</SelectItem>
                                            <SelectItem value="KES">KES</SelectItem>
                                            <SelectItem value="TZS">TZS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Active Dates</Label>
                                <DateRangePicker date={dateRange} setDate={setDateRange} showPresets={false} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
