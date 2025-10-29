
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingCart, UserPlus, BarChart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

type QuickLinkItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: boolean;
};

export function QuickLinks() {
    const { user } = useAuth();
    const permissions = user?.permissions;

    if (!permissions) {
        return null;
    }

    const links: QuickLinkItem[] = [
        {
            href: '/dashboard/products/add',
            label: 'Add Product',
            icon: PlusCircle,
            permission: permissions.products.create,
        },
        {
            href: '/dashboard/orders/add',
            label: 'Create Order',
            icon: ShoppingCart,
            permission: permissions.orders.create,
        },
        {
            href: '/dashboard/customers/add',
            label: 'Add Customer',
            icon: UserPlus,
            permission: permissions.customers.create,
        },
        {
            href: '/dashboard/orders?tab=analytics',
            label: 'View Reports',
            icon: BarChart,
            permission: permissions.orders.view, // Or a more specific reporting permission
        }
    ];

    const availableLinks = links.filter(link => link.permission);
    
    if (availableLinks.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableLinks.map((link) => (
                        <Button key={link.href} variant="outline" size="lg" className="h-auto py-4 flex-col gap-2" asChild>
                            <Link href={link.href}>
                                <link.icon className="h-6 w-6 text-primary" />
                                <span className="text-sm font-medium">{link.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
