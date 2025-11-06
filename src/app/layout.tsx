
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { cn } from '@/lib/utils';
import { OnboardingProvider } from '@/context/onboarding-context';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [themeClass, setThemeClass] = useState('light');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const applyTheme = () => {
      const onboardingDataRaw = localStorage.getItem('onboardingData');
      if (onboardingDataRaw) {
        try {
          const onboardingData = JSON.parse(onboardingDataRaw);
          if (onboardingData.theme) {
            const themeName = onboardingData.theme.toLowerCase();
            document.documentElement.className = `light theme-${themeName}`;
          } else {
            document.documentElement.className = 'light';
          }
        } catch (error) {
          console.error("Failed to parse onboarding data:", error);
          document.documentElement.className = 'light';
        }
      } else {
          document.documentElement.className = 'light';
      }
    };

    applyTheme();

    const onboardingData = localStorage.getItem('onboardingData');
    const loggedInUser = localStorage.getItem('loggedInUserId');
    const publicPaths = ['/', '/get-started', '/login', '/store', '/affiliate-signup', '/affiliate/login'];

    if (
      !onboardingData &&
      !publicPaths.some(p => pathname.startsWith(p))
    ) {
      router.push('/');
    } else if (onboardingData && !loggedInUser && pathname.startsWith('/dashboard')) {
      router.push('/login');
    }

    window.addEventListener('theme-changed', applyTheme);
    return () => {
      window.removeEventListener('theme-changed', applyTheme);
    };
  }, [pathname, router]);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <title>Paynze</title>
        <meta name="description" content="Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants." />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("font-sans antialiased", inter.variable)} suppressHydrationWarning={true}>
        <AuthProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return <RootLayoutContent>{children}</RootLayoutContent>;
}
