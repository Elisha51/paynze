
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Staff, Order, Role } from '@/lib/types';
import { getStaff, getStaffOrders } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTable } from '@/components/dashboard/orders-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardCheck, CheckCircle } from 'lucide-react';

const LOGGED_IN_STAFF_ID = 'staff-003';

export default function MyTasksPage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todo');

    const loadData = async () => {
        setLoading(true);
        const [staffList, orderData] = await Promise.all([
            getStaff(),
            getStaffOrders(LOGGED_IN_STAFF_ID),
        ]);
        const member = staffList.find(s => s.id === LOGGED_IN_STAFF_ID);
        
        setStaffMember(member || null);
        setAssignedOrders(orderData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const { todoOrders, completedOrders } = useMemo(() => {
        const todo = assignedOrders.filter(order => !['Delivered', 'Picked Up', 'Cancelled'].includes(order.status));
        const completed = assignedOrders.filter(order => ['Delivered', 'Picked Up'].includes(order.status));
        return { todoOrders: todo, completedOrders: completed };
    }, [assignedOrders]);
    
    if (loading || !staffMember) {
        return (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">Your assigned orders and tasks.</p>
                </div>
            </div>
            
           <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="todo">To Do ({todoOrders.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="todo" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Active Assignments</CardTitle>
                            <CardDescription>Orders that require your action.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable 
                                orders={todoOrders}
                                isLoading={loading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Completed Orders</CardTitle>
                            <CardDescription>A history of your fulfilled orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <OrdersTable 
                                orders={completedOrders}
                                isLoading={loading}
                                emptyState={{
                                    icon: CheckCircle,
                                    title: 'No Completed Tasks',
                                    description: 'You haven\'t completed any orders yet. Once you do, they will appear here.'
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
