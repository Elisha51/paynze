
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { OnboardingFormData } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { NotificationProvider } from '@/context/notification-context';
import { useAuth } from '@/context/auth-context';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDevMode = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
      setOnboardingData(JSON.parse(data));
    } else if (!isLoading && user && pathname !== '/get-started') {
        // If user is logged in but has no onboarding data, redirect to setup
        router.push('/get-started');
    }
  }, [pathname, router, user, isLoading]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const SkeletonLoader = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-full w-16" />
        <div className="flex-1 flex flex-col h-full">
            <Skeleton className="h-14 border-b" />
            <div className="p-8">
                <Skeleton className="h-32 w-full mb-8" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
  );

  return (
    <SidebarProvider>
      <NotificationProvider>
        {isLoading || !user ? (
           <SkeletonLoader />
        ) : (
          <div className="flex min-h-screen w-full">
            <AppSidebar onboardingData={onboardingData} />
            <div className="flex flex-1 flex-col">
              <AppHeader onboardingData={onboardingData} isDevMode={isDevMode} />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
                {children}
              </main>
            </div>
          </div>
        )}
        <Toaster />
      </NotificationProvider>
    </SidebarProvider>
  );
}
