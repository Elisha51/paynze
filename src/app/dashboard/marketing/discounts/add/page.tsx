
'use client';
import { ArrowLeft, Save, Percent, DollarSign } from 'lucide-react';
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
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

export default function AddDiscountPage() {
    const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
    const [hasMinPurchase, setHasMinPurchase] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/marketing?tab=discounts">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Discount</h1>
          <p className="text-muted-foreground text-sm">Configure a new discount code for your store.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button>
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
                            <Input id="code" placeholder="e.g., EID2024" />
                            <Button variant="outline">Generate Code</Button>
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
