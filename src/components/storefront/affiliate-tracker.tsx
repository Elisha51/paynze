
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// This component is a client component that will run in the browser.
// Its sole purpose is to read the 'ref' query parameter and set a cookie.
export function AffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const affiliateRef = searchParams.get('ref');

    if (affiliateRef) {
      // Set a cookie with the affiliate's unique ID.
      // The cookie will expire in 30 days.
      // The `path=/` makes it available across the entire site.
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      document.cookie = `paynze_affiliate_ref=${affiliateRef}; expires=${expiryDate.toUTCString()}; path=/`;
    }
  }, [searchParams]);

  // This component renders nothing.
  return null;
}
