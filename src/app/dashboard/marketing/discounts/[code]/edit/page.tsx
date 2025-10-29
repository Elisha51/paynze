
'use client';
import { ArrowLeft, Save, Percent, DollarSign, Trash2 } from 'lucide-react';
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
import { useParams } from 'next/navigation';
import type { Discount } from '../../../page';

const mockDiscounts: Discount[] = [
  { code: 'NEWBIE10', type: 'Percentage', value: 10, status: 'Active', redemptions: 152, minPurchase: 0, customerGroup: 'New Customers' },
  { code: 'SALE5K', type: 'Fixed Amount', value: 5000, status: 'Active', redemptions: 88, minPurchase: 50000, customerGroup: 'Everyone' },
  { code: 'FLASH20', type: 'Percentage', value: 20, status: 'Expired', redemptions: 210, minPurchase: 0, customerGroup: 'Everyone' },
];

export default function EditDiscountPage() {
    const params = useParams();
    const code = params.code as string;
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [hasMinPurchase, setHasMinPurchase] = useState(false);

    useEffect(() => {
        const found = mockDiscounts.find(d => d.code === code);
        if (found) {
            setDiscount(found);
            setHasMinPurchase(found.minPurchase > 0);
        }
    }, [code]);

    if (!discount) {
        return <div>Discount not found</div>
    }

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
          <h1 className="text-2xl font-bold tracking-tight">Edit Discount</h1>
          <p className="text-muted-foreground text-sm">Editing discount code: {discount.code}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="destructive" variant="outline">
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
                    <RadioGroup value={discount.type} className="flex gap-4">
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
                        <Input id="value" type="number" value={discount.value} />
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
                                     <Input type="number" value={discount.minPurchase > 0 ? discount.minPurchase : ''} placeholder="e.g., 50000" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerGroup">Customer eligibility</Label>
                        <Select value={discount.customerGroup}>
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
                     <Select value={discount.status}>
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
