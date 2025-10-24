
'use client';

import React, { useEffect, useState } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/app-header';
import { SearchProvider } from '@/context/search-context';
import { type OnboardingFormData } from '@/context/onboarding-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
      setOnboardingData(JSON.parse(data));
    }
    // Check for development mode
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      setIsDevMode(true);
    }
  }, []);

  return (
    <SearchProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar onboardingData={onboardingData} isDevMode={isDevMode} />
          <div className="flex flex-col w-full overflow-x-hidden">
            <AppHeader onboardingData={onboardingData} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
