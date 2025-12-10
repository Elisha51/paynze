// This page is now a Server Component to allow for metadata generation.
// Client-side interactivity is handled by a child component.

import { getPurchaseOrderById } from '@/services/procurement';
import { PurchaseOrderResponseForm } from '@/components/supplier/purchase-order-response-form';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { OnboardingFormData } from '@/lib/types';
import * as fs from 'fs/promises';
import { getMockOnboardingData } from '@/services/mock';


type Props = {
    params: { id: string };
};

// This function generates dynamic metadata for the page.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await getPurchaseOrderById(params.id);
  const settings = await getMockOnboardingData(); // Simulate fetching tenant data

  if (!order || !settings) {
    return {
      title: 'Purchase Order Not Found',
    };
  }

  const ogTitle = `Purchase Order #${order.id} from ${settings.businessName}`;
  const ogDescription = `Review and respond to a purchase order for ${order.items.length} item(s).`;
  
  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
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


export default async function PurchaseOrderResponsePage({ params }: Props) {
    const order = await getPurchaseOrderById(params.id);
    const settings = await getMockOnboardingData();

    if (!order || !settings) {
        notFound();
    }
  
    // The form itself is a Client Component to handle state and interactions.
    return <PurchaseOrderResponseForm initialOrder={order} settings={settings} />;
}
