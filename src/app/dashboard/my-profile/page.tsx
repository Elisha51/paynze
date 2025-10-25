
'use client';

import { useState, useEffect } from 'react';
import type { Staff, Order, Role } from '@/lib/types';
import { getStaff, getStaffOrders } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffProfileForm } from '@/components/dashboard/staff-profile-form';
import { PasswordSettings } from '@/components/dashboard/password-settings';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { List, Target, Award, MapPin, Type, Hash, ToggleRight, Calendar, Edit } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { StaffScheduleCard } from '@/components/dashboard/staff-schedule-card';

const LOGGED_IN_STAFF_ID = 'staff-003';

const orderColumns: ColumnDef<Order>[] = [
    {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => (
            <Link href={`/dashboard/orders/${row.original.id}`} className="font-medium hover:underline">
                {row.getValue('id')}
            </Link>
        )
    },
    {
        accessorKey: 'customerName',
        header: 'Customer',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge>{row.getValue('status')}</Badge>
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
            const order = row.original;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    }
];

const DynamicAttributeCard = ({ attribute, value }: { attribute: any, value: any }) => {
    const iconMap: { [key: string]: React.ElementType } = {
        kpi: Target,
        tags: MapPin,
        list: List,
        string: Type,
        number: Hash,
        boolean: ToggleRight,
        date: Calendar,
    };
    const Icon = iconMap[attribute.type] || Award;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-primary"/>
                    {attribute.label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {attribute.type === 'kpi' && value && (
                    <div className="space-y-2">
                         <div className="flex justify-between items-baseline mb-1">
                            <span className="text-2xl font-bold">{value.current}</span>
                            <span className="text-sm text-muted-foreground">of {value.goal}</span>
                        </div>
                        <Progress value={(value.current / value.goal) * 100} />
                    </div>
                )}
                 {attribute.type === 'tags' && Array.isArray(value) && value.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {value.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                )}
                 {(attribute.type === 'string' || attribute.type === 'number') && value && (
                     <p className="text-lg font-medium">{value}</p>
                 )}
                 {attribute.type === 'boolean' && typeof value === 'boolean' && (
                     <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
                 )}

                {(!value || (Array.isArray(value) && value.length === 0)) && (
                    <p className="text-sm text-muted-foreground text-center py-4">Not set.</p>
                )}
            </CardContent>
        </Card>
    );
};


export default function MyProfilePage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const loadStaffData = async () => {
        setLoading(true);
        const [staffList, allRoles, orderData] = await Promise.all([
            getStaff(),
            getRoles(),
            getStaffOrders(LOGGED_IN_STAFF_ID),
        ]);
        const member = staffList.find(s => s.id === LOGGED_IN_STAFF_ID);
        
        if (member) {
            setStaffMember(member);
            const staffRole = allRoles.find(r => r.name === member.role);
            setRole(staffRole || null);
        }
        
        setAssignedOrders(orderData);
        setLoading(false);
    };

    useEffect(() => {
        loadStaffData();
    }, []);

    const handleProfileUpdate = async (updatedStaff: Staff) => {
        // In a real app, this would call the service.
        // For now, we just update the state to reflect the change.
        setStaffMember(updatedStaff);
    };
    
    if (loading || !staffMember) {
        return (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-10 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }
    
    const assignedAttributes = staffMember.attributes ? Object.entries(staffMember.attributes).map(([key, value]) => {
      const attributeDefinition = role?.assignableAttributes?.find(attr => attr.key === key);
      return attributeDefinition ? { definition: attributeDefinition, value } : null;
    }).filter(Boolean) : [];
    
    const showAssignedOrders = role?.permissions.orders.view;
    const hasSchedule = staffMember.schedule && staffMember.schedule.length > 0;


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile & Tasks</h1>
                    <p className="text-muted-foreground">Your personal dashboard, settings, and assignments.</p>
                </div>
            </div>
            
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="settings">Account Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                   <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignedAttributes.map((attr, index) => (
                                attr && <DynamicAttributeCard key={index} attribute={attr.definition} value={attr.value} />
                            ))}
                        </div>

                        {showAssignedOrders && (
                             <Card>
                                <CardHeader>
                                    <CardTitle>Your Assigned Orders</CardTitle>
                                    <CardDescription>All orders currently assigned to you for fulfillment.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable columns={orderColumns} data={assignedOrders} />
                                </CardContent>
                            </Card>
                        )}
                        
                        {hasSchedule && (
                            <StaffScheduleCard schedule={staffMember.schedule || []} />
                        )}

                        {!showAssignedOrders && assignedAttributes.length === 0 && (
                            <Card>
                                <CardContent>
                                    <EmptyState
                                        icon={<Award className="h-12 w-12 text-primary" />}
                                        title="No Tasks or Attributes"
                                        description="You currently have no assigned orders or performance metrics to display."
                                    />
                                </CardContent>
                            </Card>
                        )}
                   </div>
                </TabsContent>
                <TabsContent value="settings" className="mt-6">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StaffProfileForm 
                            staff={staffMember}
                            onSave={handleProfileUpdate}
                            onCancel={() => {}} // In this context, save just updates state
                            isSelfEditing={true}
                        />
                       <PasswordSettings />
                   </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

