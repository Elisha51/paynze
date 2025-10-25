

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, Target, MapPin, List, CheckCircle, Award, Calendar, Hash, Type, ToggleRight, FileText, XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Staff, Order, Role, AssignableAttribute } from '@/lib/types';
import { getStaff, getStaffOrders, updateStaff } from '@/services/staff';
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
import { EmptyState } from '@/components/ui/empty-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


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
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const [staffMember, setStaffMember] = useState<Staff | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const [staffData, allRoles] = await Promise.all([
        getStaff().then(staffList => staffList.find(s => s.id === id)),
        getRoles()
    ]);
    
    setStaffMember(staffData || null);
    if (staffData) {
        const staffRole = allRoles.find(r => r.name === staffData.role);
        setRole(staffRole || null);
        if (staffRole?.permissions.orders.view) {
            const orderData = await getStaffOrders(id);
            setAssignedOrders(orderData);
        }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handleVerification = async (action: 'approve' | 'reject') => {
      if (!staffMember) return;

      let updatedStaff: Staff | null = null;

      if (action === 'approve') {
          updatedStaff = await updateStaff({ ...staffMember, status: 'Active' });
          toast({ title: 'Staff Member Approved', description: `${staffMember.name} is now an active staff member.`});
      } else {
          updatedStaff = await updateStaff({ ...staffMember, status: 'Inactive', rejectionReason });
           toast({ variant: 'destructive', title: 'Staff Member Rejected', description: `${staffMember.name}'s application has been rejected.`});
      }
      setStaffMember(updatedStaff);
  }


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
  
  const showAssignedOrders = role?.permissions.orders.view;
  const assignedAttributes = staffMember.attributes ? Object.entries(staffMember.attributes).map(([key, value]) => {
      const attributeDefinition = role?.assignableAttributes?.find(attr => attr.key === key);
      return attributeDefinition ? { definition: attributeDefinition, value } : null;
  }).filter(Boolean) : [];
  const hasAttributes = assignedAttributes.length > 0;
  const isPendingVerification = staffMember.status === 'Pending Verification';

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
             <Badge variant={staffMember.status === 'Active' ? 'default' : staffMember.status === 'Pending Verification' ? 'secondary' : 'destructive'} className="capitalize">{staffMember.status}</Badge>
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

      {isPendingVerification && (
          <Card className="border-yellow-400 bg-yellow-50">
              <CardHeader>
                  <CardTitle>Verification Required</CardTitle>
                  <CardDescription>Review the submitted documents and approve or reject this staff member.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <h4 className="font-semibold text-sm">Submitted Documents</h4>
                  <div className="flex flex-wrap gap-4">
                      {staffMember.verificationDocuments?.map(doc => (
                          <a href={doc.url} key={doc.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border rounded-md bg-background hover:bg-muted">
                              <FileText className="h-5 w-5 text-primary"/>
                              <span className="text-sm font-medium">{doc.name}</span>
                          </a>
                      ))}
                  </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Staff Member</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please provide a reason for rejecting {staffMember.name}. This will be recorded for administrative purposes.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Label htmlFor="rejectionReason">Rejection Reason</Label>
                            <Textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleVerification('reject')} disabled={!rejectionReason}>Confirm Rejection</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button onClick={() => handleVerification('approve')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                </Button>
              </CardFooter>
          </Card>
      )}
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn("space-y-6", hasAttributes || showAssignedOrders ? 'lg:col-span-2' : 'lg:col-span-3')}>
            {showAssignedOrders && (
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
            )}
            
            {!showAssignedOrders && !hasAttributes && !isPendingVerification && (
                 <Card>
                    <CardContent>
                        <EmptyState 
                            icon={<Award className="h-12 w-12 text-primary" />}
                            title="No Tasks or Attributes"
                            description="This staff member currently has no assigned orders or role-specific attributes to display."
                             cta={(
                                <Button asChild>
                                    <Link href={`/dashboard/staff/${staffMember.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile & Attributes
                                    </Link>
                                </Button>
                            )}
                        />
                    </CardContent>
                </Card>
            )}
        </div>

        {hasAttributes && (
            <div className="lg:col-span-1 space-y-6">
                {assignedAttributes.map((attr) => {
                    if (!attr) return null;
                    return (
                        <DynamicAttributeCard 
                            key={attr.definition.key}
                            attribute={attr.definition}
                            value={attr.value}
                        />
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}

