import React from 'react';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/app-header';
import { SearchProvider } from '@/context/search-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col w-full">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/40">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
