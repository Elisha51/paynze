'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart, badge: '26' },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  return (
    <Sidebar>
        <SidebarHeader className="p-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <div className={cn("flex flex-col transition-opacity duration-300", state === 'collapsed' && 'opacity-0 w-0')}>
                  <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">Paynze</h2>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8 md:flex hidden", state === 'collapsed' && 'absolute -right-10 top-2')} onClick={toggleSidebar}>
              <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-data-[state=collapsed]:rotate-180" />
            </Button>
        </SidebarHeader>

        <SidebarContent className="p-2 flex-1">
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="justify-start"
                    >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {item.badge}
                        </Badge>
                    )}
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t">
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton className="justify-start" tooltip="Support">
                    <LifeBuoy className="h-5 w-5" />
                    <span>Support</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/" passHref>
                    <SidebarMenuButton className="justify-start" tooltip="Logout">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
