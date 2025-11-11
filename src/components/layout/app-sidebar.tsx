
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
  Truck,
  Landmark,
  UserCog,
  Megaphone,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import { cn, getInitials } from '@/lib/utils';
import { type OnboardingFormData } from '@/context/onboarding-context';
import { Badge } from '../ui/badge';
import { useAuth } from '@/context/auth-context';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: (p: any) => p?.dashboard?.view },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart, permission: (p: any) => p?.orders?.view },
  { href: '/dashboard/products', label: 'Products', icon: Package, permission: (p: any) => p?.products?.view },
  { href: '/dashboard/customers', label: 'Customers', icon: Users, permission: (p: any) => p?.customers?.view },
  { href: '/dashboard/procurement', label: 'Procurement', icon: Truck, permission: (p: any) => p?.procurement?.view },
  { href: '/dashboard/marketing', label: 'Marketing', icon: Megaphone, permission: (p: any) => p?.marketing?.view },
  { href: '/dashboard/finances', label: 'Finances', icon: Landmark, permission: (p: any) => p?.finances?.view },
];


const bottomMenuItems = [
  { href: '/dashboard/staff', label: 'Staff', icon: UserCog, permission: (p: any) => p?.staff?.view },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText, permission: (p: any) => p?.templates?.view },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, permission: (p: any) => p?.settings?.view },
]

type AppSidebarProps = {
    onboardingData: OnboardingFormData | null;
}

export default function AppSidebar({ onboardingData }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();

  const userPermissions = user?.permissions;

  if (!userPermissions) {
      return null;
  }
  
  const businessName = onboardingData?.businessName || 'Paynze';

  const allowedMenuItems = menuItems.filter(item => item.permission(userPermissions));
  const allowedBottomMenuItems = bottomMenuItems.filter(item => item.permission(userPermissions));

  return (
    <Sidebar>
        <SidebarHeader className="hidden md:flex items-center justify-center p-4">
             <Link href="/dashboard/settings" className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={onboardingData?.logoUrl} alt={businessName} />
                  <AvatarFallback>{getInitials(businessName)}</AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col transition-opacity duration-300", state === 'collapsed' && 'opacity-0 w-0 h-0')}>
                    <h2 className="font-semibold tracking-tight text-sidebar-foreground whitespace-nowrap">{businessName}</h2>
                </div>
            </Link>
        </SidebarHeader>

        <SidebarContent>
            <SidebarMenu>
            {allowedMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
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
            {allowedBottomMenuItems.map((item) => (
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
                <Link href="/dashboard/support" passHref>
                    <SidebarMenuButton
                        isActive={pathname.startsWith('/dashboard/support')}
                        tooltip="Support"
                    >
                        <LifeBuoy className="h-5 w-5 shrink-0" />
                        <span className="flex-1">Support</span>
                    </SidebarMenuButton>
                </Link>
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
             <div className="border-t -mx-2 mt-2 pt-2 hidden md:block">
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
