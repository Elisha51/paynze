
'use client';
import { StoreHeader } from '@/components/storefront/store-header';
import { OnboardingFormData } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div className="flex min-h-screen flex-col">
      <StoreHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <footer className="bg-muted py-6">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {settings?.businessName || 'Your Store'}. All rights reserved.</p>
                <p className="text-xs text-muted-foreground">
                    Powered by <Link href="/" className="font-semibold text-primary hover:underline">Paynze</Link>
                </p>
          </div>
      </footer>
    </div>
  );
}
