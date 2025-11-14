
'use client';

import { Inter, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { OnboardingProvider } from '@/context/onboarding-context';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ThemeHandler } from '@/components/ThemeHandler';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="">
      <head>
        <title>Paynze</title>
        <meta name="description" content="Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants." />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning={true} className={cn("font-sans antialiased", inter.variable, ptSans.variable)}>
        <ThemeHandler />
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
