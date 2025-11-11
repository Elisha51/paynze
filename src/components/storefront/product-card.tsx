

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { useMemo } from 'react';
import { Button } from '../ui/button';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

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

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event from bubbling up to the card's link

    if (product.hasVariants) {
        router.push(`/store/product/${product.sku}`);
    } else {
        // Add the single-variant product directly to the cart
        addToCart(product, product.variants[0], 1);
    }
  }

  return (
    <Card className="overflow-hidden transition-all group relative flex flex-col">
      <Link href={`/store/product/${product.sku}`} className="block">
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
      </Link>
      <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <Link href={`/store/product/${product.sku}`} className="block">
                <h3 className="font-semibold text-base truncate group-hover:text-primary">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="font-bold text-lg text-primary">{formatCurrency(product.retailPrice, product.currency)}</p>
                    {hasSale && (
                        <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice!, product.currency)}</p>
                    )}
                </div>
            </Link>
          </div>
          <div className="pt-2">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handlePrimaryAction} 
              disabled={isOutOfStock}
              aria-label={product.hasVariants ? 'Select Options' : 'Add to Cart'}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? 'Out of Stock' : (product.hasVariants ? 'Select Options' : 'Add to Cart')}
            </Button>
          </div>
      </CardContent>
    </Card>
  );
}
