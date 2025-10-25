
'use client';

import { useEffect, useState } from 'react';
import type { Staff, Order, Role } from '@/lib/types';
import { getStaff, getStaffOrders } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

// Assuming the logged-in user is staff-003 for demonstration
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

export default function MyTasksPage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [staffData, orderData, allRoles] = await Promise.all([
                getStaff().then(list => list.find(s => s.id === LOGGED_IN_STAFF_ID)),
                getStaffOrders(LOGGED_IN_STAFF_ID),
                getRoles()
            ]);
            
            if (staffData) {
                setStaffMember(staffData);
                const staffRole = allRoles.find(r => r.name === staffData.role);
                setRole(staffRole || null);
            }
            setAssignedOrders(orderData);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading || !staffMember || !role) {
        return (
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }
    
    // Example of extracting a KPI for display
    const deliveryTarget = role.assignableAttributes?.find(a => a.key === 'deliveryTarget');
    const deliveryTargetValue = staffMember.attributes?.[deliveryTarget?.key || ''] as { current: number, goal: number } | undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks & Performance</h1>
                    <p className="text-muted-foreground">Here's an overview of your current assignments and goals.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/my-profile/edit">
                        <Edit className="mr-2 h-4 w-4"/>
                        Edit Profile
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveryTarget && deliveryTargetValue && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{deliveryTarget.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between items-baseline mb-1">
                                <span className="text-2xl font-bold">{deliveryTargetValue.current}</span>
                                <span className="text-sm text-muted-foreground">of {deliveryTargetValue.goal} deliveries</span>
                            </div>
                            <Progress value={(deliveryTargetValue.current / deliveryTargetValue.goal) * 100} />
                        </CardContent>
                    </Card>
                )}
                 <Card>
                    <CardHeader>
                        <CardTitle>Assigned Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-3xl font-bold">{assignedOrders.length}</p>
                         <p className="text-sm text-muted-foreground">Currently in your queue.</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Assigned Orders</CardTitle>
                    <CardDescription>All orders currently assigned to you for fulfillment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={orderColumns} data={assignedOrders} />
                </CardContent>
            </Card>
        </div>
    );
}
