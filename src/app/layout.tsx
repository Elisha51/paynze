import type { Metadata } from 'next';
import { Inter, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
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

// This function allows for dynamic metadata generation, which is crucial for a multi-tenant app.
// In a real app, you might fetch tenant-specific settings from a database based on the domain.
export async function generateMetadata(): Promise<Metadata> {
  // For this simulation, we'll keep a default but acknowledge this is where
  // dynamic, tenant-specific data would be fetched.
  const businessName = 'Paynze'; // In a real app, this would be dynamic, e.g., getTenantData(headers()).name
  const description = 'Your Business, Online in Minutes. The all-in-one e-commerce platform for merchants.';

  return {
    title: {
      template: `%s | ${businessName}`,
      default: businessName,
    },
    description: description,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: businessName,
    },
    themeColor: '#ffffff',
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", inter.variable, ptSans.variable)}>
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
