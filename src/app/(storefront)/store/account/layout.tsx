
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
import { usePathname } from 'next/navigation';
import { Home, Package, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/store/account', label: 'My Profile', icon: User },
  { href: '/store/account/orders', label: 'My Orders', icon: Package },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
                <Button
                    variant="ghost"
                    className="justify-start text-destructive hover:text-destructive"
                    asChild
                  >
                    <Link href="/">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Link>
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
