
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ShoppingCart, UserPlus, BarChart } from 'lucide-react';

const links = [
    {
        href: '/dashboard/products/add',
        label: 'Add Product',
        icon: PlusCircle
    },
    {
        href: '/dashboard/orders/add',
        label: 'Create Order',
        icon: ShoppingCart
    },
    {
        href: '/dashboard/customers/add',
        label: 'Add Customer',
        icon: UserPlus
    },
    {
        href: '/dashboard/orders', // Links to orders, where reports tab is available
        label: 'View Reports',
        icon: BarChart
    }
];

export function QuickLinks() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {links.map((link) => (
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
