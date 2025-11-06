
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { useMemo } from 'react';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = (product.images[0] as { url?: string })?.url;
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  const hasSale = product.compareAtPrice && product.compareAtPrice > product.retailPrice;

  const isOutOfStock = useMemo(() => {
    if (product.inventoryTracking === "Don't Track") return false;
    const totalAvailable = product.variants.reduce((sum, v) => 
        sum + (v.stockByLocation?.reduce((locSum, loc) => locSum + loc.stock.available, 0) || 0), 0);
    return totalAvailable <= 0;
  }, [product]);

  return (
    <Card className="overflow-hidden transition-all group relative">
      <Link href={`/store/product/${product.sku}`} className="block">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={imageUrl || `https://picsum.photos/seed/${product.sku}/400/400`}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isOutOfStock ? (
                <Badge variant="secondary" className="absolute top-2 left-2 z-10 bg-black/60 text-white border-transparent">Out of Stock</Badge>
            ) : hasSale && (
                <Badge variant="destructive" className="absolute top-2 left-2 z-10">Sale</Badge>
            )}
          </div>
          <div className="p-4 space-y-1 bg-background">
            <h3 className="font-semibold text-base truncate group-hover:text-primary">{product.name}</h3>
            <div className="flex items-baseline gap-2">
                <p className="font-bold text-lg text-primary">{formatCurrency(product.retailPrice, product.currency)}</p>
                {hasSale && (
                    <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice!, product.currency)}</p>
                )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
