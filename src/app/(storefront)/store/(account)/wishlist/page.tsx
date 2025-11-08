
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCustomerById } from '@/services/customers';
import { getProducts } from '@/services/products';
import type { Customer, Product } from '@/lib/types';
import { ProductGrid } from '@/components/storefront/product-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WishlistPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // In a real app, you'd get the customer ID from a session.
      const cust = await getCustomerById('cust-02');
      setCustomer(cust || null);
      
      if (cust?.wishlist && cust.wishlist.length > 0) {
        const allProducts = await getProducts();
        const wishlistItems = allProducts.filter(p => cust.wishlist.includes(p.sku));
        setWishlistProducts(wishlistItems);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Wishlist</CardTitle>
          <CardDescription>Your saved items for later.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading your wishlist...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <CardDescription>Your collection of saved items. Add them to your cart when you're ready!</CardDescription>
      </CardHeader>
      <CardContent>
        {wishlistProducts.length > 0 ? (
          <ProductGrid products={wishlistProducts} />
        ) : (
          <EmptyState
            icon={<Heart className="h-12 w-12 text-muted-foreground" />}
            title="Your Wishlist is Empty"
            description="You haven't saved any items yet. Click the heart icon on a product page to add it to your wishlist."
            cta={<Button asChild><Link href="/store">Continue Shopping</Link></Button>}
          />
        )}
      </CardContent>
    </Card>
  );
}
