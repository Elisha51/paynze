
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Ticket } from 'lucide-react';
import { getCustomerById } from '@/services/customers';
import type { Customer, Discount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function DiscountsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCustomer() {
      // In a real app, you'd get the ID from a session.
      const cust = await getCustomerById('cust-02');
      setCustomer(cust || null);
      setLoading(false);
    }
    loadCustomer();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard!", description: `Discount code ${code} is ready to use.` });
  };
  
  const formatValue = (discount: Discount) => {
      if (discount.type === 'Percentage') {
          return `${discount.value}% OFF`;
      }
      return `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(discount.value)} OFF`;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Vouchers</CardTitle>
          <CardDescription>Your available discounts and vouchers.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading your vouchers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Vouchers</CardTitle>
        <CardDescription>
          Here are the discounts and special offers available for you to use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer?.discounts && customer.discounts.length > 0 ? (
          customer.discounts.map((discount, index) => (
            <div key={discount.code}>
                <div className="p-4 border border-dashed rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Ticket className="h-8 w-8 text-primary flex-shrink-0" />
                        <div>
                            <p className="font-bold text-lg text-primary">{formatValue(discount)}</p>
                            <p className="text-sm text-muted-foreground">
                                {discount.description || `On orders above ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(discount.minPurchase)}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                        <p className="font-mono text-foreground font-semibold">{discount.code}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(discount.code)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {index < customer.discounts!.length - 1 && <Separator className="my-4" />}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            You currently have no special discounts or vouchers.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
