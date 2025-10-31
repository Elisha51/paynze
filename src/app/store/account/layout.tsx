'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock customer data for demonstration
const mockCustomer = {
    name: 'Amelia Barlow',
    email: 'amelia.b@example.com'
}

const navItems = [
    { href: '/store/account', label: 'My Profile', icon: User },
    { href: '/store/account/orders', label: 'My Orders', icon: ShoppingBag },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <div className="mb-6">
                    <h2 className="text-xl font-bold">{mockCustomer.name}</h2>
                    <p className="text-sm text-muted-foreground">{mockCustomer.email}</p>
                </div>
                <nav className="space-y-1">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} passHref>
                             <Button 
                                variant={pathname === item.href ? 'secondary' : 'ghost'} 
                                className="w-full justify-start gap-2"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                     <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </nav>
            </aside>
            <main className="md:col-span-3">
                {children}
            </main>
        </div>
    </div>
  );
}
