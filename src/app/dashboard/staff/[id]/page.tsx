
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, Target, MapPin, List, CheckCircle, Award, Calendar, Hash, Type, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import type { Staff, Order, Role, AssignableAttribute } from '@/lib/types';
import { getStaff, getStaffOrders } from '@/services/staff';
import { getRoles } from '@/services/roles';
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
import { format } from 'date-fns';


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

const DynamicAttributeCard = ({ attribute, value }: { attribute: AssignableAttribute, value: any }) => {
    const iconMap = {
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
                <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary"/>
                    {attribute.label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {attribute.type === 'kpi' && value && (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{attribute.label}</span>
                                <span className="text-sm font-semibold">{value.current}/{value.goal}</span>
                            </div>
                            <Progress value={(value.current / value.goal) * 100} />
                        </div>
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
                 {attribute.type === 'date' && value && (
                     <p className="text-lg font-medium">{format(new Date(value), 'PPP')}</p>
                 )}

                {(!value || (Array.isArray(value) && value.length === 0)) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No value assigned.</p>
                )}
            </CardContent>
        </Card>
    );
};


export default function ViewStaffPage() {
  const params = useParams();
  const id = params.id as string;
  const [staffMember, setStaffMember] = useState<Staff | null>(null);
  const [role, setRole] = useState<Role | null>(null);
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
        const [staffData, orderData, allRoles] = await Promise.all([
            getStaff().then(staffList => staffList.find(s => s.id === id)),
            getStaffOrders(id),
            getRoles()
        ]);
        
        setStaffMember(staffData || null);
        if (staffData) {
            const staffRole = allRoles.find(r => r.name === staffData.role);
            setRole(staffRole || null);
        }
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
            <Button variant="outline" asChild>
                <Link href={`/dashboard/staff/${staffMember.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Link>
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
            {staffMember.attributes && role?.assignableAttributes && Object.entries(staffMember.attributes).map(([key, value]) => {
                const attributeDefinition = role.assignableAttributes?.find(attr => attr.key === key);
                if (!attributeDefinition) return null;

                return (
                    <DynamicAttributeCard 
                        key={key}
                        attribute={attributeDefinition}
                        value={value}
                    />
                );
            })}
        </div>
      </div>
    </div>
  );
}
