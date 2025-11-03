
'use client';

import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { PackageSearch } from 'lucide-react';

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Products Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}
