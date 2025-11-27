
'use client';
import { useState, useEffect } from 'react';
import type { Order, Staff } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { getStaff } from '@/services/staff';
import { getOrders } from '@/services/orders';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { DeliveryRunsheetCard } from './_components/delivery-runsheet-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Truck, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// View for a single agent
const AgentRunsheetView = ({ onUpdate }: { onUpdate: () => void }) => {
    const { user } = useAuth();
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            if (!user) return;
            setIsLoading(true);
            const allOrders = await getOrders();
            setAssignedOrders(allOrders.filter(o => o.assignedStaffId === user.id && !['Delivered', 'Picked Up', 'Cancelled'].includes(o.status)));
            setIsLoading(false);
        }
        loadTasks();
    }, [user, onUpdate]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
        {assignedOrders.length > 0 ? (
            assignedOrders.map(order => (
                <DeliveryRunsheetCard key={order.id} order={order} onUpdate={onUpdate} />
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
    );
};

export default function MyRunsheetPage() {
    const { user } = useAuth();
    // This state is used to trigger a re-fetch in child components
    const [updateCount, setUpdateCount] = useState(0);

    const handleUpdate = () => {
        setUpdateCount(prev => prev + 1);
    };

    if (!user) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <DashboardPageLayout 
            title="My Runsheet"
            description="Your assigned deliveries for today."
        >
            <AgentRunsheetView onUpdate={handleUpdate} />
        </DashboardPageLayout>
    )
}
