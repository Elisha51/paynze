
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Percent, DollarSign, Users, Package } from 'lucide-react';
import Link from 'next/link';
import type { Discount, Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts } from '@/services/products';

const mockDiscounts: Discount[] = [
  { code: 'NEWBIE10', type: 'Percentage', value: 10, status: 'Active', redemptions: 152, minPurchase: 0, customerGroup: 'New Customers', applicableProductIds: [] },
  { code: 'SALE5K', type: 'Fixed Amount', value: 5000, status: 'Active', redemptions: 88, minPurchase: 50000, customerGroup: 'Everyone', applicableProductIds: ['KIT-001-RF', 'KIT-001-BG'] },
  { code: 'FLASH20', type: 'Percentage', value: 20, status: 'Expired', redemptions: 210, minPurchase: 0, customerGroup: 'Everyone', applicableProductIds: [] },
];

async function getDiscountByCode(code: string): Promise<Discount | undefined> {
    return mockDiscounts.find(d => d.code === code);
}

export default function ViewDiscountPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        if (!code) return;
        setLoading(true);
        const [fetchedDiscount, fetchedProducts] = await Promise.all([
          getDiscountByCode(code),
          getProducts()
        ]);
        setDiscount(fetchedDiscount || null);
        setProducts(fetchedProducts);
        setLoading(false);
    }
    loadData();
  }, [code]);

  const handleBack = () => {
    router.back();
  }
  
  const formatCurrency = (amount: number) => {
    // In a real app, get currency from settings
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(amount);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!discount) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Discount not found</h1>
            <p className="text-muted-foreground">The discount you are looking for does not exist.</p>
            <Button onClick={handleBack} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Discounts</Button>
        </div>
    );
  }

  const applicableProducts = products.filter(p => discount.applicableProductIds?.includes(p.sku || ''));

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Discount: {discount.code}</h1>
           <Badge variant={discount.status === 'Active' ? 'default' : 'secondary'}>{discount.status}</Badge>
        </div>
        <div className="ml-auto">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/marketing/discounts/${discount.code}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
            </Button>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-muted rounded-md">
                           {discount.type === 'Percentage' ? <Percent className="h-6 w-6" /> : <DollarSign className="h-6 w-6" />}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Value</p>
                            <p className="text-xl font-bold">
                                {discount.type === 'Percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                            </p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-muted rounded-md">
                           <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Customer Group</p>
                            <p className="text-xl font-bold">{discount.customerGroup}</p>
                        </div>
                    </div>
                </CardContent>
             </Card>
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Applicable Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {applicableProducts.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {applicableProducts.map(p => (
                                <li key={p.sku} className="py-2">
                                    <Link href={`/dashboard/products/${p.sku}`} className="font-medium hover:underline">{p.name}</Link>
                                    <p className="text-sm text-muted-foreground">SKU: {p.sku}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">This discount applies to all products.</p>
                    )}
                </CardContent>
             </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Conditions & Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {discount.minPurchase > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Min. Purchase</span>
                            <span className="font-semibold">{formatCurrency(discount.minPurchase)}</span>
                        </div>
                    )}
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Redemptions</span>
                        <span className="font-semibold">{discount.redemptions.toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

