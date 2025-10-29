
'use client';

import React, { useEffect, useState } from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/app-header';
import { SearchProvider } from '@/context/search-context';
import { type OnboardingFormData } from '@/context/onboarding-context';
import { NotificationProvider } from '@/context/notification-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const tabRoutes: Record<string, string[]> = {
  '/dashboard/marketing': ['overview', 'campaigns', 'discounts', 'analytics'],
  '/dashboard/customers': ['customers', 'analytics'],
  '/dashboard/finances': ['transactions', 'summary', 'reconciliation', 'payouts', 'analytics'],
  '/dashboard/orders': ['orders', 'analytics'],
  '/dashboard/products': ['products', 'categories', 'analytics'],
  '/dashboard/procurement': ['suppliers', 'purchase-orders', 'analytics'],
  '/dashboard/staff': ['staff', 'permissions', 'all-logs', 'analytics'],
  '/dashboard/templates': ['products', 'email', 'sms'],
};

function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  const breadcrumbItems = React.useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    let cumulativePath = '';
    
    return pathSegments.map((segment, index) => {
        let href = `/${cumulativePath}/${segment}`;
        const parentPath = `/${cumulativePath}`;
        cumulativePath = `${cumulativePath}/${segment}`;
        
        // Check if the current segment is a tab for its parent path
        if (tabRoutes[parentPath] && tabRoutes[parentPath].includes(segment)) {
            href = `${parentPath}?tab=${segment}`;
        }
        
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        return { href, label };
    });
  }, [pathname]);

  // Pass isDevMode to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isDevMode } as any);
    }
    return child;
  });
  
  if (isLoading || !user) {
      return (
          <div className="flex items-center justify-center h-screen">
              <p>Loading...</p>
          </div>
      )
  }

  return (
    <NotificationProvider>
      <SearchProvider key={pathname}>
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar onboardingData={onboardingData} isDevMode={isDevMode} />
              <div className="flex flex-col w-full overflow-x-hidden">
                <AppHeader onboardingData={onboardingData} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
                  {breadcrumbItems.length > 1 && <Breadcrumbs items={breadcrumbItems} className="mb-4" />}
                  {childrenWithProps}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </SearchProvider>
    </NotificationProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedDashboardLayout>{children}</ProtectedDashboardLayout>
    </AuthProvider>
  )
}
