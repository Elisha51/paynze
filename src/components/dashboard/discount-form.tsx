'use client';

import { ArrowLeft, Save, Sparkles, Ticket } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Discount, OnboardingFormData } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { DateRangePicker } from '../ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Switch } from '../ui/switch';

const emptyDiscount: Omit<Discount, 'code'> & { code?: string } = {
  type: 'Percentage',
  value: 10,
  status: 'Active',
  redemptions: 0,
  minPurchase: 0,
  customerGroup: 'Everyone',
  usageLimit: null,
  onePerCustomer: true,
  startDate: new Date().toISOString(),
};

type DiscountFormProps = {
    initialDiscount?: Discount | null;
}

export function DiscountForm({ initialDiscount }: DiscountFormProps) {
    const [discount, setDiscount] = useState<Partial<Discount>>(initialDiscount || emptyDiscount);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        initialDiscount?.startDate ? {
            from: new Date(initialDiscount.startDate),
            to: initialDiscount.endDate ? new Date(initialDiscount.endDate) : undefined,
        } : undefined
    );
    const [hasUsageLimit, setHasUsageLimit] = useState(!!initialDiscount?.usageLimit);

    const router = useRouter();
    const { toast } = useToast();
    const isEditing = !!initialDiscount;

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setDiscount(prev => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setDiscount(prev => ({ ...prev, [id]: Number(value) }));
    };

    const handleSelectChange = (id: 'type' | 'customerGroup', value: string) => {
        setDiscount(prev => ({...prev, [id]: value as any}));
    }
    
    const handleCheckboxChange = (id: 'onePerCustomer', checked: boolean) => {
        setDiscount(prev => ({...prev, [id]: checked }));
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

        console.log("Saving discount", finalDiscount);
        toast({
            title: isEditing ? "Discount Updated" : "Discount Created",
            description: `Discount code "${finalDiscount.code}" has been saved.`
        });
        router.push('/dashboard/marketing?tab=discounts');
    }

    const handleBack = () => router.push('/dashboard/marketing?tab=discounts');

    const currency = settings?.currency || 'UGX';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{isEditing ? `Edit Discount` : 'Create Discount'}</h1>
                </div>
                 <div className="ml-auto flex items-center gap-2">
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save {isEditing ? 'Changes' : 'Discount'}
                    </Button>
                </div>
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
                                    <Input id="code" value={discount.code || ''} onChange={handleInputChange} />
                                    <Button variant="outline" onClick={generateCode}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate
                                    </Button>
                                </div>
                            </div>
                            <RadioGroup value={discount.type} onValueChange={(v) => handleSelectChange('type', v)} className="grid grid-cols-2 gap-4">
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
                            </RadioGroup>
                            <div className="space-y-2">
                                <Label htmlFor="value">Value</Label>
                                <div className="relative">
                                    <Input id="value" type="number" value={discount.value || ''} onChange={handleNumberChange} className={discount.type === 'Percentage' ? 'pr-8' : `pl-8`} />
                                    <span className="absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm p-2">
                                        {discount.type === 'Percentage' ? '%' : currency}
                                    </span>
                                </div>
                            </div>
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
                                    <Input id="usageLimit" type="number" value={discount.usageLimit || ''} onChange={handleNumberChange} className="max-w-xs" />
                                </div>
                             )}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="onePerCustomer" checked={discount.onePerCustomer} onCheckedChange={(c) => handleCheckboxChange('onePerCustomer', c as boolean)} />
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
                                <Label>Customer Eligibility</Label>
                                <Select value={discount.customerGroup} onValueChange={(v) => handleSelectChange('customerGroup', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Everyone">Everyone</SelectItem>
                                        <SelectItem value="New Customers">New Customers</SelectItem>
                                        <SelectItem value="Wholesalers">Wholesalers</SelectItem>
                                        <SelectItem value="Retailers">Retailers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minPurchase">Minimum purchase requirement</Label>
                                <div className="relative">
                                    <Input id="minPurchase" type="number" value={discount.minPurchase || ''} onChange={handleNumberChange} className="pl-8" />
                                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currency}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Active Dates</Label>
                                <DateRangePicker date={dateRange} setDate={setDateRange} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
