// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      // If a user session exists, go to the dashboard.
      // Otherwise, go to the main storefront page.
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/store');
      }
    }
  }, [isLoading, user, router]);

  // Render a loading state while we determine the redirect.
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
