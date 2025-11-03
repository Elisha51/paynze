
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingCart, UserPlus, BarChart, Truck } from 'lucide-react';
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
            href: '/dashboard/staff/add',
            label: 'Add Staff/Agent',
            icon: UserPlus,
            permission: permissions.staff.create,
        },
        {
            href: '/dashboard/deliveries', // Placeholder link
            label: 'Add Delivery Type',
            icon: Truck,
            permission: permissions.settings.edit, // Tied to settings permissions
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
