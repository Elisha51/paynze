'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is the root page component for the `app` directory.
// It redirects to the storefront homepage, which is now in a route group.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
