// src/app/(storefront)/affiliate-signup/page.tsx

import { AffiliateSignupForm } from '@/components/storefront/affiliate-signup-form';
import { getMockOnboardingData } from '@/services/mock';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getMockOnboardingData();

  if (!settings) {
    return { title: 'Affiliate Signup' };
  }
  
  const title = `Become an Affiliate for ${settings.businessName}`;

  return {
    title,
    openGraph: {
      title,
      description: `Join our affiliate program and earn commissions on sales you refer to ${settings.businessName}.`,
      images: [
        {
          url: settings.logoUrl || '/icon-512x512.png',
          width: 512,
          height: 512,
          alt: `${settings.businessName} Logo`,
        },
      ],
      siteName: settings.businessName,
    },
  };
}

export default async function AffiliateSignupPage() {
    const settings = await getMockOnboardingData();

    return <AffiliateSignupForm settings={settings} />;
}
