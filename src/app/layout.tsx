
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { cn } from '@/lib/utils';
import { OnboardingProvider } from '@/context/onboarding-context';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// export const metadata: Metadata = {
//   title: 'Paynze',
//   description: 'Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants.',
//   manifest: '/manifest.json',
//   themeColor: '#ffffff',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [themeClass, setThemeClass] = useState('light');

  useEffect(() => {
    const onboardingDataRaw = localStorage.getItem('onboardingData');
    if (onboardingDataRaw) {
      try {
        const onboardingData = JSON.parse(onboardingDataRaw);
        if (onboardingData.theme) {
          const themeName = onboardingData.theme.toLowerCase();
          setThemeClass(`light theme-${themeName}`);
        }
      } catch (error) {
        console.error("Failed to parse onboarding data:", error);
      }
    }
  }, []);

  return (
    <html lang="en" className={themeClass}>
      <head>
        <title>Paynze</title>
        <meta name="description" content="Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants." />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("font-sans antialiased", inter.variable)}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
