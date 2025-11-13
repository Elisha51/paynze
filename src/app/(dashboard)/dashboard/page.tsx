
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, ShoppingCart, AlertTriangle, Truck } from 'lucide-react';
import Link from 'next/link';
import type { Order, RecentSale, OnboardingFormData, Staff } from '@/lib/types';
import { getOrders } from '@/services/orders';
import { getStaff } from '@/services/staff';
import { getTodos } from '@/services/todos';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { QuickLinks } from '@/components/dashboard/quick-links';
import { StaffWidget } from '@/components/dashboard/staff-widget';
import { OrdersDeliveriesTable } from '@/components/dashboard/orders-deliveries-table';


export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [todos, setTodos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const pathname = usePathname();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [ordersData, staffData, todosData] = await Promise.all([
            getOrders(),
            getStaff(),
            getTodos(),
        ]);
        
        const storedSettings = localStorage.getItem('onboardingData');
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }

        // Manually link assigned orders to staff members after fetching
        const staffWithOrders = staffData.map(s => {
            return {
                ...s,
                assignedOrders: ordersData.filter(o => o.assignedStaffId === s.id),
            };
        });

        setOrders(ordersData);
        setStaff(staffWithOrders.filter(s => s.role !== 'Affiliate'));
        setTodos(todosData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData, pathname]);

    const { summaryMetrics, currency } = useMemo(() => {
        const currencyCode = settings?.currency || 'UGX';
        const ordersToday = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
        const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

        const pendingOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Awaiting Payment').length;
        const pendingDeliveries = orders.filter(o => o.status === 'Paid' && o.fulfillmentMethod === 'Delivery' && !o.assignedStaffId).length;
        const deliveriesToday = orders.filter(o => o.status === 'Shipped' && new Date(o.date).toDateString() === new Date().toDateString()).length;
        const activeStaff = staff.filter(s => s.onlineStatus === 'Online').length;
        
        return {
            summaryMetrics: {
                ordersToday: ordersToday.length,
                revenueToday,
                pendingOrders,
                activeStaff,
                deliveriesToday,
                pendingDeliveries
            },
            currency: currencyCode,
        }
    }, [orders, staff, settings]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[150px] w-full" />
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <QuickLinks />
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{summaryMetrics.ordersToday}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.revenueToday)}</div>
                    </CardContent>
                </Card>
                <Card>
                  <Link href="/dashboard/orders">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.pendingOrders}</div>
                    </CardContent>
                  </Link>
                </Card>
                 <Card>
                  <Link href="/dashboard/orders?tab=deliveries">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.deliveriesToday}</div>
                    </CardContent>
                  </Link>
                </Card>
                <Card>
                   <Link href="/dashboard/orders?tab=deliveries">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.pendingDeliveries}</div>
                    </CardContent>
                  </Link>
                </Card>
                 <Card>
                  <Link href="/dashboard/staff">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.activeStaff}</div>
                    </CardContent>
                  </Link>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <OrdersDeliveriesTable orders={orders} staff={staff} />
                </div>
                <div className="lg:col-span-1">
                    <StaffWidget staff={staff} isLoading={isLoading} />
                </div>
            </div>

        </div>
    )
}
