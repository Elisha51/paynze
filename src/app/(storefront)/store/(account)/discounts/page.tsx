
'use client';
import { useState, useEffect, useMemo } from 'react';
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
import type { Customer, Discount, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getProducts } from '@/services/products';

export default function DiscountsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
      if (!loggedInCustomerId) {
        setLoading(false);
        return;
      }
      
      const [custData, productsData] = await Promise.all([
        getCustomerById(loggedInCustomerId),
        getProducts()
      ]);
      
      setCustomer(custData || null);
      setProducts(productsData);
      setLoading(false);
    }
    loadData();
  }, []);
  
  const eligibleDiscounts = useMemo(() => {
    if (!customer?.discounts) return [];
    // Sort to show Active first, then Scheduled, then Expired
    return [...customer.discounts].sort((a, b) => {
        const statusOrder: Record<string, number> = { 'Active': 1, 'Scheduled': 2, 'Expired': 3 };
        const aStatus = a.status || 'Expired';
        const bStatus = b.status || 'Expired';
        return (statusOrder[aStatus] || 4) - (statusOrder[bStatus] || 4);
    });
  }, [customer]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard!", description: `Discount code ${code} is ready to use.` });
  };
  
  const formatValue = (discount: Discount) => {
      if (discount.type === 'Percentage') {
          return `${discount.value}% OFF`;
      }
      if (discount.type === 'Fixed Amount') {
        const currency = customer?.currency || 'UGX';
        return `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(discount.value)} OFF`;
      }
      if (discount.type === 'Buy X Get Y') {
          return `Buy ${discount.bogoDetails?.buyQuantity || 1}, Get ${discount.bogoDetails?.getQuantity || 1}`;
      }
      return 'Special Offer';
  }

  const getStatusInfo = (status: Discount['status']) => {
    switch (status) {
        case 'Active': return { variant: 'default', text: 'Active' };
        case 'Scheduled': return { variant: 'secondary', text: 'Coming Soon' };
        case 'Expired': return { variant: 'outline', text: 'Expired' };
        default: return { variant: 'outline', text: status };
    }
  }

  const formatCurrency = (amount: number) => {
    const currency = customer?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
  
  const getApplicabilityText = (discount: Discount): string => {
    if (discount.applicableProductIds && discount.applicableProductIds.length > 0) {
      const productNames = discount.applicableProductIds
        .map(id => products.find(p => p.sku === id)?.name)
        .filter(Boolean)
        .join(', ');
      return `Applies to: ${productNames}`;
    }
    
    if (discount.type === 'Buy X Get Y' && discount.bogoDetails?.buyProductIds.length) {
      const buyProductNames = discount.bogoDetails.buyProductIds
        .map(id => products.find(p => p.sku === id)?.name)
        .filter(Boolean)
        .join(' or ');
      return `Applies when buying: ${buyProductNames}`;
    }

    return 'Applies to all products.';
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Vouchers</CardTitle>
          <CardDescription>Your available discounts and vouchers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
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
          eligibleDiscounts.map((discount) => {
            const statusInfo = getStatusInfo(discount.status);
            return (
                <div key={discount.code} className="p-4 border border-dashed rounded-lg flex flex-col sm:flex-row sm:items-start gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-12 flex items-center justify-center bg-muted/50">
                       <Ticket className="h-8 w-8 text-primary rotate-[-45deg]" />
                    </div>
                    <div className="flex-1 pl-16">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-primary">{formatValue(discount)}</h3>
                                    <Badge variant={statusInfo.variant as any}>{statusInfo.text}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{discount.description}</p>
                            </div>
                            {discount.status === 'Active' && (
                                <div className="flex items-center gap-2 bg-muted p-2 rounded-md mt-2 sm:mt-0">
                                    <p className="font-mono text-foreground font-semibold">{discount.code}</p>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(discount.code)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Separator className="my-2" />
                        <div className="text-xs text-muted-foreground space-y-1">
                             {discount.minPurchase > 0 && <p>• Minimum purchase of {formatCurrency(discount.minPurchase)}</p>}
                             {discount.onePerCustomer && <p>• One use per customer.</p>}
                             {discount.type === 'Buy X Get Y' && discount.bogoDetails && <p>• {`Buy ${discount.bogoDetails.buyQuantity}, get ${discount.bogoDetails.getQuantity} of a selected item for ${discount.bogoDetails.getDiscountPercentage}% off.`}</p>}
                             <p>• {getApplicabilityText(discount)}</p>
                             {discount.endDate && <p>• {discount.status === 'Expired' ? 'Expired on' : 'Expires on'} {new Date(discount.endDate).toLocaleDateString()}</p>}
                        </div>
                    </div>
                </div>
            )
          })
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
