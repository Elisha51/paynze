
'use client';

import type { Metadata } from 'next';
import { Inter, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { OnboardingProvider } from '@/context/onboarding-context';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [themeClassName, setThemeClassName] = useState('light');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const onboardingDataRaw = localStorage.getItem('onboardingData');
      if (onboardingDataRaw) {
        try {
          const onboardingData = JSON.parse(onboardingDataRaw);
          if (onboardingData.theme) {
            const themeName = onboardingData.theme.toLowerCase().replace(/\s+/g, '-');
            setThemeClassName(`light theme-${themeName}`);
          } else {
            setThemeClassName('light');
          }
        } catch (error) {
          console.error("Failed to parse onboarding data:", error);
          setThemeClassName('light');
        }
      } else {
          setThemeClassName('light');
      }
    };

    if (isClient) {
      applyTheme();

      const loggedInUser = localStorage.getItem('loggedInUserId');
      if (!loggedInUser && pathname === '/get-started') {
          router.push('/signup');
      }

      window.addEventListener('theme-changed', applyTheme);
      return () => {
        window.removeEventListener('theme-changed', applyTheme);
      };
    }
  }, [isClient, pathname, router]);

  return (
    <html lang="en" className={isClient ? themeClassName : 'light'}>
      <head>
        <title>Paynze</title>
        <meta name="description" content="Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants." />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("font-sans antialiased", inter.variable, ptSans.variable)}>
        <div className="max-w-screen-2xl mx-auto">
          <AuthProvider>
            <OnboardingProvider>
              {children}
              <Toaster />
            </OnboardingProvider>
          </AuthProvider>
        </div>
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
