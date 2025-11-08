
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, User, LogOut, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/store/account', label: 'My Profile', icon: User },
  { href: '/store/account/orders', label: 'My Orders', icon: Package },
  { href: '/store/account/notifications', label: 'Notifications', icon: Bell },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isLoggedIn = localStorage.getItem('isCustomerLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/store/login');
    }
  }, [router]);
  
  const handleLogout = () => {
      localStorage.setItem('isCustomerLoggedIn', 'false');
      router.push('/store');
  }

  // Mocking unread count. In a real app this would come from a context or API.
  const unreadNotificationCount = 3;

  if (!isClient) {
      return null;
  }
  
  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-4 gap-8 items-start">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Customer Account</CardTitle>
              <CardDescription>
                Manage your orders and personal details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      'justify-start',
                      pathname === item.href && 'bg-muted font-semibold'
                    )}
                    asChild
                  >
                    <Link href={item.href} className="flex justify-between items-center w-full">
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </div>
                      {item.href === '/store/account/notifications' && unreadNotificationCount > 0 && <Badge variant="destructive">{unreadNotificationCount}</Badge>}
                    </Link>
                  </Button>
                ))}
                <Button
                    variant="ghost"
                    className="justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                  </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
