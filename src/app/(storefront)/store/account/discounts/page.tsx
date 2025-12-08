

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
import { getDiscounts } from '@/services/marketing';
import type { Customer, Discount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

export default function DiscountsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [eligibleDiscounts, setEligibleDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
      if (!loggedInCustomerId) {
        setLoading(false);
        return;
      }
      
      const [custData, allDiscounts] = await Promise.all([
        getCustomerById(loggedInCustomerId),
        getDiscounts()
      ]);
      
      setCustomer(custData || null);

      if (custData) {
        const filtered = allDiscounts.filter(discount => 
            (discount.customerGroup === 'Everyone' || discount.customerGroup === custData.customerGroup) &&
            (discount.status === 'Active' || discount.status === 'Expired')
        );
        setEligibleDiscounts(filtered.sort((a, b) => (a.status === 'Active' ? -1 : 1)));
      }
      
      setLoading(false);
    }
    loadData();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard!", description: `Discount code ${code} is ready to use.` });
  };
  
  const formatValue = (discount: Discount) => {
      if (discount.type === 'Percentage') {
          return `${discount.value}% OFF`;
      }
       if (discount.type === 'Fixed Amount') {
          return `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(discount.value)} OFF`;
      }
      return 'Special Offer';
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Vouchers</CardTitle>
          <CardDescription>Your available discounts and vouchers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
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
        {eligibleDiscounts.length > 0 ? (
          eligibleDiscounts.map((discount, index) => (
            <div key={discount.code}>
                <div className="p-4 border border-dashed rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Ticket className="h-8 w-8 text-primary flex-shrink-0" />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-lg text-primary">{formatValue(discount)}</p>
                                <Badge variant={discount.status === 'Active' ? 'default' : 'outline'}>{discount.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {discount.description || `On orders above ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(discount.minPurchase)}`}
                            </p>
                        </div>
                    </div>
                    {discount.status === 'Active' && (
                        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                            <p className="font-mono text-foreground font-semibold">{discount.code}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(discount.code)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                {index < eligibleDiscounts.length - 1 && <Separator className="my-4" />}
            </div>
          ))
        ) : (
          <EmptyState 
            icon={<Ticket className="h-12 w-12 text-muted-foreground" />}
            title="No Vouchers Available"
            description="You currently have no special discounts. Check back later!"
          />
        )}
      </CardContent>
    </Card>
  );
}
