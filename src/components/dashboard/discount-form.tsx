
'use client';

import { Save, Sparkles, Ticket, Check, ChevronsUpDown, Calendar as CalendarIcon, ShieldAlert, ArrowLeft, Info, Copy } from 'lucide-react';
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
import type { Discount, OnboardingFormData, Product, Affiliate, BogoDetails } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import { getProducts } from '@/services/products';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { getAffiliates } from '@/services/affiliates';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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
      buyConditionType: 'quantity',
      buyQuantity: 1,
      buyProductIds: [],
      getQuantity: 1,
      getProductIds: [],
      getDiscountPercentage: 100,
  },
  applicableProductIds: [],
};

type DiscountFormProps = {
    initialDiscount?: Partial<Discount> | null;
    isEditing?: boolean;
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


export function DiscountForm({ initialDiscount, isEditing = false }: DiscountFormProps) {
    const [discount, setDiscount] = useState<Partial<Discount>>({ ...emptyDiscount, ...initialDiscount });
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [hasUsageLimit, setHasUsageLimit] = useState(!!initialDiscount?.usageLimit);
    const [applicability, setApplicability] = useState<ApplicabilityType>(
        (initialDiscount?.applicableProductIds && initialDiscount.applicableProductIds.length > 0) ? 'specific' : 'all'
    );
    
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialDiscount?.startDate ? new Date(initialDiscount.startDate) : new Date()
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialDiscount?.endDate ? new Date(initialDiscount.endDate) : undefined
    );
    const [noEndDate, setNoEndDate] = useState(!initialDiscount?.endDate);


    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const bogoDetailsWithDefaults: BogoDetails = {
            buyConditionType: initialDiscount?.bogoDetails?.buyConditionType || 'quantity',
            buyQuantity: 1,
            buyProductIds: [],
            getQuantity: 1,
            getProductIds: [],
            getDiscountPercentage: 100,
            ...initialDiscount?.bogoDetails,
        };

        const fullInitialDiscount = {
            ...emptyDiscount,
            ...initialDiscount,
            bogoDetails: bogoDetailsWithDefaults,
        };
        setDiscount(fullInitialDiscount);
        setHasUsageLimit(!!initialDiscount?.usageLimit);
        setApplicability((initialDiscount?.applicableProductIds && initialDiscount.applicableProductIds.length > 0) ? 'specific' : 'all');
        setStartDate(initialDiscount?.startDate ? new Date(initialDiscount.startDate) : new Date());
        setEndDate(initialDiscount?.endDate ? new Date(initialDiscount.endDate) : undefined);
        setNoEndDate(!initialDiscount?.endDate);
        
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
        if (noEndDate) {
            setEndDate(undefined);
        }
    }, [noEndDate]);

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
    
    const handleSwitchChange = (id: 'onePerCustomer', checked: boolean) => {
        setDiscount(prev => ({...prev, [id]: checked }));
    }
    
    const handleBogoChange = (field: 'buyQuantity' | 'getQuantity' | 'getDiscountPercentage' | 'buyConditionType' | 'buyAmount', value: string | number) => {
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
        const finalDiscount: Partial<Discount> = {
            ...discount,
            startDate: startDate?.toISOString(),
            endDate: noEndDate ? undefined : endDate?.toISOString(),
        };

        if (!hasUsageLimit) {
            finalDiscount.usageLimit = null;
        }

        if (applicability === 'all') {
            finalDiscount.applicableProductIds = [];
        }

        // In a real app, this would call a service
        console.log("Saving discount", finalDiscount);
        toast({
            title: isEditing ? "Discount Updated" : "Discount Created",
            description: `Discount code "${finalDiscount.code}" has been saved.`
        });
        localStorage.removeItem('duplicateDiscountData');
        router.push('/dashboard/marketing?tab=discounts');
    }

    const currency = settings?.currency || 'UGX';

    return (
        <div className="space-y-6">
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
                                    <Input id="code" value={discount.code || ''} onChange={handleInputChange} placeholder="e.g., SAVE20" disabled={isEditing}/>
                                    <Button variant="outline" onClick={generateCode} disabled={isEditing}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate
                                    </Button>
                                </div>
                                {isEditing && <p className="text-xs text-muted-foreground">The discount code cannot be changed after creation.</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                {isEditing && (
                                    <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                                        <Info className="h-4 w-4 !text-blue-800" />
                                        <AlertDescription>
                                            To change the discount type, duplicate this discount and create a new one.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <RadioGroup value={discount.type} onValueChange={(v) => handleSelectChange('type', v)} className="grid grid-cols-1 sm:grid-cols-3 gap-4" disabled={isEditing}>
                                    <div>
                                        <RadioGroupItem value="Percentage" id="type-percentage" className="peer sr-only" />
                                        <Label htmlFor="type-percentage" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary", isEditing && "cursor-not-allowed opacity-70")}>
                                            <Ticket className="mb-3 h-6 w-6" />
                                            Percentage
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="Fixed Amount" id="type-fixed" className="peer sr-only" />
                                        <Label htmlFor="type-fixed" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary", isEditing && "cursor-not-allowed opacity-70")}>
                                            <Ticket className="mb-3 h-6 w-6" />
                                            Fixed Amount
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="Buy X Get Y" id="type-bogo" className="peer sr-only" />
                                        <Label htmlFor="type-bogo" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary", isEditing && "cursor-not-allowed opacity-70")}>
                                            <Ticket className="mb-3 h-6 w-6" />
                                            Buy X Get Y
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            
                            {discount.type !== 'Buy X Get Y' && (
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value</Label>
                                    <div className="flex items-center">
                                        <Input id="value" type="number" value={discount.value || ''} onChange={handleNumberChange} className="flex-1 rounded-r-none" placeholder="e.g. 15"/>
                                        <div className="text-muted-foreground p-2 rounded-r-md border border-l-0 h-10 flex items-center bg-muted">
                                            {discount.type === 'Percentage' ? '%' : currency}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {discount.type === 'Buy X Get Y' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Card>
                                        <CardHeader><CardTitle className="text-base">Customer Buys</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            <RadioGroup value={discount.bogoDetails?.buyConditionType} onValueChange={(v) => handleBogoChange('buyConditionType', v as 'quantity' | 'amount')}>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="quantity" id="buy-quantity-option" />
                                                    <Label htmlFor="buy-quantity-option">A minimum quantity of products</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="amount" id="buy-amount-option" />
                                                    <Label htmlFor="buy-amount-option">A minimum purchase amount</Label>
                                                </div>
                                            </RadioGroup>
                                            {discount.bogoDetails?.buyConditionType === 'quantity' ? (
                                                <div className="pl-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="buyQuantity">Quantity</Label>
                                                        <Input id="buyQuantity" type="number" value={discount.bogoDetails?.buyQuantity} onChange={(e) => handleBogoChange('buyQuantity', Number(e.target.value))} placeholder="1" />
                                                    </div>
                                                    <ProductSelector
                                                        label="Specific products (optional)"
                                                        allProducts={products}
                                                        selectedProductIds={discount.bogoDetails?.buyProductIds || []}
                                                        onSelect={(sku) => handleBogoProductChange('buyProductIds', sku)}
                                                    />
                                                     <p className="text-xs text-muted-foreground">If no products are selected, this will apply to any products in the cart.</p>
                                                </div>
                                            ) : (
                                                <div className="pl-6 space-y-2">
                                                    <Label htmlFor="buyAmount">Minimum Amount ({currency})</Label>
                                                    <Input id="buyAmount" type="number" value={discount.bogoDetails?.buyAmount} onChange={(e) => handleBogoChange('buyAmount', Number(e.target.value))} placeholder="e.g., 100000"/>
                                                </div>
                                            )}
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
                                                <div className="flex items-center">
                                                    <Input id="getDiscountPercentage" type="number" value={discount.bogoDetails?.getDiscountPercentage} onChange={(e) => handleBogoChange('getDiscountPercentage', Number(e.target.value))} className="flex-1 rounded-r-none" placeholder="100"/>
                                                    <div className="text-muted-foreground p-2 rounded-r-md border border-l-0 h-10 flex items-center bg-muted">%</div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Enter 100 for a "Buy One, Get One Free" offer.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                             )}

                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Applicability</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup value={applicability} onValueChange={(v) => setApplicability(v as ApplicabilityType)} disabled={discount.type === 'Buy X Get Y'}>
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
                             {discount.type === 'Buy X Get Y' && <p className="text-xs text-muted-foreground">BOGO applicability is defined in the offer configuration.</p>}
                        </CardContent>
                    </Card>


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
                                <Switch id="onePerCustomer" checked={!!discount.onePerCustomer} onCheckedChange={(c) => handleSwitchChange('onePerCustomer', c as boolean)} />
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
                                <div className="flex items-center">
                                    <span className="text-muted-foreground p-2 rounded-l-md border border-r-0 bg-muted h-10 flex items-center">{currency}</span>
                                    <Input id="minPurchase" type="number" value={discount.minPurchase || ''} onChange={handleNumberChange} className="rounded-l-none" placeholder="e.g. 50000"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Active Dates</Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-normal">Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-normal">End Date</Label>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="no-end-date" checked={noEndDate} onCheckedChange={(c) => setNoEndDate(c as boolean)} />
                                                <Label htmlFor="no-end-date" className="text-xs font-normal">No end date</Label>
                                            </div>
                                        </div>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" disabled={noEndDate} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSave} className="ml-2">
                    <Save className="mr-2 h-4 w-4" />
                    Save {isEditing ? 'Changes' : 'Discount'}
                </Button>
            </div>
        </div>
    );
}
