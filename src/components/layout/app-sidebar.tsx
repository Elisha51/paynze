
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  FileText,
  Building,
  Truck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { type OnboardingFormData } from '@/context/onboarding-context';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
];

const premiumMenuItems = [
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: Building, plan: 'Premium' },
  { href: '/dashboard/purchase-orders', label: 'Purchase Orders', icon: Truck, plan: 'Premium' },
];

const bottomMenuItems = [
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

type AppSidebarProps = {
    onboardingData: OnboardingFormData | null;
}

export default function AppSidebar({ onboardingData }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // In a real app, this would come from user auth state
    const data = localStorage.getItem('onboardingData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setIsPremium(parsedData.plan === 'Premium');
      } catch (e) {
        console.error("Failed to parse onboarding data:", e);
      }
    }
  }, []);

  return (
    <Sidebar>
        <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-primary shrink-0" />
            <div className={cn("flex flex-col transition-opacity duration-300", state === 'collapsed' && 'opacity-0 w-0')}>
                <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground whitespace-nowrap">{onboardingData?.businessName || 'Paynze'}</h2>
            </div>
            </Link>
        </SidebarHeader>

        <SidebarContent>
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                    isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                    tooltip={item.label}
                    >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
             {isPremium && premiumMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
             ))}
            </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
            <SidebarMenu>
            {bottomMenuItems.map((item) => (
                 <SidebarMenuItem key={item.href}>
                 <Link href={item.href} passHref>
                     <SidebarMenuButton
                     isActive={pathname.startsWith(item.href)}
                     tooltip={item.label}
                     >
                     <item.icon className="h-5 w-5 shrink-0" />
                     <span className="flex-1">{item.label}</span>
                     </SidebarMenuButton>
                 </Link>
                 </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Support">
                    <LifeBuoy className="h-5 w-5 shrink-0" />
                    <span className="flex-1">Support</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/login" passHref>
                    <SidebarMenuButton tooltip="Logout">
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="flex-1">Logout</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            </SidebarMenu>
             <div className="border-t -mx-2 mt-2 pt-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button variant="ghost" className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={toggleSidebar}>
                             <ChevronLeft className={cn("h-6 w-6 shrink-0 transition-transform duration-300", state === 'collapsed' && 'rotate-180')} />
                             <span className="sr-only">Toggle Sidebar</span>
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
             </div>
      </SidebarFooter>
    </Sidebar>
  );
}
