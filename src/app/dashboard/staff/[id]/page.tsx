

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, Target, MapPin, List } from 'lucide-react';
import Link from 'next/link';
import type { Staff, Order } from '@/lib/types';
import { getStaff, getStaffOrders } from '@/services/staff';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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

export default function ViewStaffPage() {
  const params = useParams();
  const id = params.id as string;
  const [staffMember, setStaffMember] = useState<Staff | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const [staffData, orderData] = await Promise.all([
            getStaff().then(staffList => staffList.find(s => s.id === id)),
            getStaffOrders(id)
        ]);
        setStaffMember(staffData || null);
        setAssignedOrders(orderData);
        setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!staffMember) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Staff Member not found</h1>
            <Button asChild className="mt-4">
                <Link href="/dashboard/staff">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Staff
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/staff">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Staff</span>
          </Link>
        </Button>
         <Avatar className="h-16 w-16">
            <AvatarImage src={staffMember.avatarUrl} alt={staffMember.name} />
            <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {staffMember.name}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            {staffMember.role}
            <span className={cn(
                "h-2 w-2 rounded-full",
                staffMember.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'
            )}></span>
            {staffMember.onlineStatus}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Activity Log</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Deactivate Member</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List className="h-5 w-5 text-primary"/>
                        Assigned Orders
                    </CardTitle>
                    <CardDescription>Current orders assigned to {staffMember.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                      columns={orderColumns}
                      data={assignedOrders}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary"/>
                        Performance Goals
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {staffMember.targets && staffMember.targets.length > 0 ? staffMember.targets.map(target => (
                        <div key={target.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{target.name}</span>
                                <span className="text-sm font-semibold">{target.current}/{target.goal}</span>
                            </div>
                            <Progress value={(target.current / target.goal) * 100} />
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No performance goals set.</p>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary"/>
                        Assigned Zones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {staffMember.zones && staffMember.zones.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {staffMember.zones.map(zone => (
                                <Badge key={zone} variant="secondary">{zone}</Badge>
                            ))}
                        </div>
                    ) : (
                         <p className="text-sm text-muted-foreground text-center py-4">No zones assigned.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
