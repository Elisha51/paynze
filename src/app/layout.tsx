import type { Metadata } from 'next';
import { Inter, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeHandler } from '@/components/ThemeHandler';
import { Providers } from '@/components/layout/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Paynze',
  description: 'Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Paynze',
  },
  themeColor: '#ffffff',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", inter.variable, ptSans.variable)}>
        <ThemeHandler />
        <Providers>
          <div className="max-w-screen-2xl mx-auto">
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
