
'use client';
import { StoreHeader } from '@/components/storefront/store-header';
import { OnboardingFormData } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartProvider } from '@/context/cart-context';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
      setSettings(JSON.parse(data));
    }
  }, []);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <StoreHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <footer className="bg-muted py-8">
            <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-2 col-span-2 md:col-span-1">
                  <h4 className="font-semibold">{settings?.businessName || 'Your Store'}</h4>
                  <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()}. All rights reserved.</p>
                  <p className="text-xs text-muted-foreground">
                      Powered by <Link href="https://paynze.com" target="_blank" className="font-semibold text-primary hover:underline">Paynze</Link>
                  </p>
              </div>
              <div className="space-y-2">
                  <h4 className="font-semibold">Shop</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                      <li><Link href="/" className="hover:text-primary">All Products</Link></li>
                  </ul>
              </div>
              <div className="space-y-2">
                  <h4 className="font-semibold">Affiliates</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                      <li><Link href="/affiliate-signup" className="hover:text-primary">Become an Affiliate</Link></li>
                      <li><Link href="/affiliate/login" className="hover:text-primary">Affiliate Login</Link></li>
                  </ul>
              </div>
              <div className="space-y-2">
                  <h4 className="font-semibold">Legal</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                      <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                      <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                  </ul>
              </div>
            </div>
        </footer>
      </div>
    </CartProvider>
  );
}

    