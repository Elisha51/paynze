
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, DollarSign, Users, CreditCard, ShoppingCart, AlertTriangle, Truck, ListTodo } from 'lucide-react';
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
import { DeliveryManagement } from '@/components/dashboard/delivery-management';


export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [todos, setTodos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);

    useEffect(() => {
        async function loadData() {
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

            setOrders(ordersData);
            setStaff(staffData.filter(s => s.role !== 'Affiliate'));
            setTodos(todosData);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const { summaryMetrics, currency } = useMemo(() => {
        const currencyCode = settings?.currency || 'UGX';
        const ordersToday = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString());
        const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

        const pendingOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Awaiting Payment').length;
        const pendingDeliveries = orders.filter(o => o.status === 'Paid' && o.fulfillmentMethod === 'Delivery').length;
        const deliveriesToday = orders.filter(o => o.status === 'Shipped' && new Date(o.date).toDateString() === new Date().toDateString()).length;
        const activeStaff = staff.filter(s => s.onlineStatus === 'Online').length;
        const tasksCompleted = todos.filter(t => t.status === 'Completed' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;

        return {
            summaryMetrics: {
                ordersToday: ordersToday.length,
                revenueToday,
                activeProducts: 45, // mock
                pendingOrders,
                activeStaff,
                tasksCompleted,
                deliveriesToday,
                pendingDeliveries
            },
            currency: currencyCode,
        }
    }, [orders, staff, todos, settings]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[150px] w-full" />
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
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
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.pendingOrders}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.activeStaff}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.deliveriesToday}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.pendingDeliveries}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryMetrics.tasksCompleted}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">View Storefront</CardTitle>
                         <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Button size="sm" className="w-full" asChild>
                            <Link href="/" target="_blank">
                                View Live Store
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <OrdersDeliveriesTable orders={orders} staff={staff} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeliveryManagement />
                <StaffWidget staff={staff} isLoading={isLoading} />
            </div>

        </div>
    )
}
