
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
    }, [user]);

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


// View for an Admin/Manager
const AdminDashboardView = ({ onUpdate }: { onUpdate: () => void }) => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [staffData, ordersData] = await Promise.all([getStaff(), getOrders()]);
            const deliveryStaff = staffData.filter(s => s.role === 'Agent');
            const activeDeliveries = ordersData.filter(o => o.assignedStaffId && !['Delivered', 'Picked Up', 'Cancelled'].includes(o.status));

            const staffWithDeliveries = deliveryStaff.map(s => ({
                ...s,
                assignedOrders: activeDeliveries.filter(o => o.assignedStaffId === s.id)
            })).filter(s => s.assignedOrders.length > 0);

            setStaff(staffWithDeliveries);
            setOrders(activeDeliveries);
            setIsLoading(false);
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    
    if (staff.length === 0) {
       return (
         <Card>
            <CardContent className="pt-6">
                <EmptyState
                    icon={<Users className="h-12 w-12 text-muted-foreground" />}
                    title="No Active Deliveries"
                    description="There are no deliveries currently assigned to any agents."
                />
            </CardContent>
        </Card>
       )
    }

    return (
        <Accordion type="multiple" className="w-full space-y-4">
            {staff.map(agent => (
                <AccordionItem value={agent.id} key={agent.id} className="border rounded-lg bg-card">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12">
                                <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                                <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <p className="font-semibold">{agent.name}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{agent.assignedOrders?.length || 0} deliveries</Badge>
                                    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", agent.onlineStatus === 'Online' ? 'text-green-600' : 'text-gray-500')}>
                                        <span className={cn("h-2 w-2 rounded-full", agent.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400')} />
                                        {agent.onlineStatus}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                        <div className="space-y-4">
                            {agent.assignedOrders?.map(order => (
                                <DeliveryRunsheetCard key={order.id} order={order} onUpdate={onUpdate} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

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

    const isAdmin = user.role === 'Admin' || user.role === 'Manager';

    return (
        <DashboardPageLayout 
            title={isAdmin ? "Delivery Dashboard" : "My Runsheet"}
            description={isAdmin ? "Oversee all active deliveries and agent assignments." : "Your assigned deliveries for today."}
        >
            {isAdmin ? <AdminDashboardView onUpdate={handleUpdate} /> : <AgentRunsheetView onUpdate={handleUpdate} />}
        </DashboardPageLayout>
    )
}
