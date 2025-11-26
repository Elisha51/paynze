
'use client';
import { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { getStaffOrders } from '@/services/staff';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { DeliveryRunsheetCard } from './_components/delivery-runsheet-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MyRunsheetPage() {
    const { user } = useAuth();
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const loadTasks = async () => {
        if (!user) return;
        setIsLoading(true);
        const orders = await getStaffOrders(user.id);
        setAssignedOrders(orders.filter(o => !['Delivered', 'Picked Up', 'Cancelled'].includes(o.status)));
        setIsLoading(false);
    }

    useEffect(() => {
        loadTasks();
    }, [user]);

    return (
        <DashboardPageLayout title="My Runsheet" description="Your assigned deliveries for today.">
            <div className="space-y-4">
            {isLoading ? (
                <p>Loading deliveries...</p>
            ) : assignedOrders.length > 0 ? (
                assignedOrders.map(order => (
                    <DeliveryRunsheetCard key={order.id} order={order} onUpdate={loadTasks} />
                ))
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <EmptyState
                            icon={<Truck className="h-12 w-12 text-muted-foreground" />}
                            title="No Deliveries"
                            description="You have no assigned deliveries at the moment. Check back later!"
                        />
                    </CardContent>
                </Card>
            )}
            </div>
        </DashboardPageLayout>
    )
}
