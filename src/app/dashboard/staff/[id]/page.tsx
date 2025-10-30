

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MoreVertical, Target, MapPin, List, CheckCircle, Award, Calendar, Hash, Type, ToggleRight, FileText, XCircle, Truck, Activity, DollarSign } from 'lucide-react';
import Link from 'next/link';
import type { Staff, Order, Role, AssignableAttribute, Payout } from '@/lib/types';
import { getStaff, updateStaff, getStaffActivity } from '@/services/staff';
import { getOrders, updateOrder } from '@/services/orders';
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
import { StaffScheduleCard } from '@/components/dashboard/staff-schedule-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StaffActivityLog } from '@/components/dashboard/staff-activity-log';
import { useAuth } from '@/context/auth-context';


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

const payoutColumns: ColumnDef<Payout>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP')
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
            const payout = row.original;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: payout.currency }).format(payout.amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
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

const UnassignedOrders = ({ orders, staffMember, onAssign }: { orders: Order[], staffMember: Staff, onAssign: (orderId: string) => void }) => {
    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="font-semibold">Assign Pending Deliveries</h3>
                <p className="text-sm text-muted-foreground">This staff member has no assigned orders. Assign one of the pending orders below.</p>
            </div>
            <ul className="divide-y divide-border rounded-md border">
                {orders.map(order => (
                    <li key={order.id} className="flex items-center justify-between p-3">
                        <div className="space-y-1">
                             <Link href={`/dashboard/orders/${order.id}`} className="font-medium hover:underline text-sm">{order.id}</Link>
                             <p className="text-xs text-muted-foreground">To: {order.customerName} - {format(new Date(order.date), 'PPP')}</p>
                        </div>
                        <Button size="sm" onClick={() => onAssign(order.id)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Assign to {staffMember.name.split(' ')[0]}
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default function ViewStaffPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const [staffMember, setStaffMember] = useState<Staff | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
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
    const [staffData, allRoles, fetchedOrders] = await Promise.all([
        getStaff().then(staffList => staffList.find(s => s.id === id)),
        getRoles(),
        getOrders(),
    ]);
    
    setAllOrders(fetchedOrders);
    setStaffMember(staffData || null);
    if (staffData) {
        const staffRole = allRoles.find(r => r.name === staffData.role);
        setRole(staffRole || null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: Staff['status']) => {
    if (!staffMember) return;
    const updatedStaff = await updateStaff({ ...staffMember, status: newStatus });
    setStaffMember(updatedStaff);
    toast({ title: `Staff Member ${newStatus}`});
  };

  const handleVerification = async (action: 'approve' | 'reject') => {
      if (!staffMember) return;

      let updatedStaff: Staff | null = null;

      if (action === 'approve') {
          updatedStaff = await updateStaff({ ...staffMember, status: 'Active' });
          toast({ title: 'Staff Member Approved', description: `${staffMember.name} is now an active staff member.`});
      } else {
          updatedStaff = await updateStaff({ ...staffMember, status: 'Deactivated', rejectionReason });
           toast({ variant: 'destructive', title: 'Staff Member Rejected', description: `${staffMember.name}'s application has been rejected.`});
      }
      setStaffMember(updatedStaff);
  };
  
  const handleAssignOrder = async (orderId: string) => {
      if (!staffMember) return;
      const updatedOrder = await updateOrder(orderId, {
          assignedStaffId: staffMember.id,
          assignedStaffName: staffMember.name,
          status: 'Shipped',
      });
      setAllOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      toast({ title: "Order Assigned", description: `Order ${orderId} assigned to ${staffMember.name}.` });
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
  const hasDocuments = staffMember.verificationDocuments && staffMember.verificationDocuments.length > 0;
  const hasSchedule = staffMember.schedule && staffMember.schedule.length > 0;
  
  const assignedOrders = allOrders.filter(o => o.assignedStaffId === staffMember.id);
  const unassignedDeliveryOrders = allOrders.filter(o => o.status === 'Paid' && o.fulfillmentMethod === 'Delivery' && !o.assignedStaffId);
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
  
  const canEditStaff = user?.permissions.staff.edit;


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
            {canEditStaff && (
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/staff/${staffMember.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Activity Log</DropdownMenuItem>
                    {canEditStaff && staffMember.status !== 'Deactivated' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Deactivate Member</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to deactivate this member?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently revoke their access. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleStatusChange('Deactivated')} className="bg-destructive hover:bg-destructive/90">Deactivate</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {isPendingVerification && canEditStaff && (
         <Card className="border-yellow-400 bg-yellow-50">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-3">
                     <CheckCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                        <CardTitle className="text-base">Verification Required</CardTitle>
                        <CardDescription className="text-xs">Review documents and approve or reject this applicant.</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
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
                    <Button onClick={() => handleVerification('approve')} size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </div>
              </CardHeader>
          </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {(hasAttributes || staffMember.totalCommission) && <TabsTrigger value="performance">Performance &amp; Attributes</TabsTrigger>}
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="details">Documents &amp; Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
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
                          emptyState={{
                            icon: Truck,
                            title: `No Orders Assigned to ${staffMember.name.split(' ')[0]}`,
                            description: unassignedDeliveryOrders.length > 0 
                                ? "You can assign one of the pending orders below."
                                : "There are currently no unassigned orders ready for delivery.",
                            cta: unassignedDeliveryOrders.length > 0 && canEditStaff
                                ? <UnassignedOrders orders={unassignedDeliveryOrders} staffMember={staffMember} onAssign={handleAssignOrder} />
                                : undefined,
                          }}
                        />
                    </CardContent>
                </Card>
            )}
            
            {hasSchedule && (
                <StaffScheduleCard schedule={staffMember.schedule || []} />
            )}

            {!showAssignedOrders && !hasSchedule && (
                 <Card>
                    <CardContent>
                        <EmptyState 
                            icon={<Award className="h-12 w-12 text-primary" />}
                            title="No Tasks or Schedule"
                            description="This staff member currently has no assigned orders or schedule to display."
                            cta={( canEditStaff &&
                                <Button asChild>
                                    <Link href={`/dashboard/staff/${staffMember.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile &amp; Attributes
                                    </Link>
                                </Button>
                            )}
                        />
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        <TabsContent value="performance" className="mt-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary"/>
                        Performance Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                    {staffMember.totalCommission && staffMember.currency && (
                        <div className="text-sm py-3 flex justify-between items-center">
                            <span className="text-muted-foreground">Unpaid Commission: </span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(staffMember.totalCommission, staffMember.currency)}</span>
                        </div>
                    )}
                    {staffMember.payoutHistory && staffMember.payoutHistory.length > 0 && (
                        <div className="pt-4">
                            <h4 className="font-medium text-sm mb-2">Payout History</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffMember.payoutHistory.slice(-5).reverse().map((payout, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{format(new Date(payout.date), 'PPP')}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(payout.amount, payout.currency)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </TabsContent>
         <TabsContent value="activity" className="mt-6 space-y-6">
            <StaffActivityLog staffId={staffMember.id} />
        </TabsContent>
        <TabsContent value="details" className="mt-6 space-y-6">
             {hasDocuments && (
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                            {staffMember.verificationDocuments?.map(doc => (
                                <a href={doc.url} key={doc.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 border rounded-md bg-background hover:bg-muted">
                                    <FileText className="h-5 w-5 text-primary"/>
                                    <span className="text-sm font-medium">{doc.name}</span>
                                a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Email:</strong> {staffMember.email}</p>
                <p><strong>Phone:</strong> {staffMember.phone}</p>
                 <p className="pt-2"><strong>Last Login:</strong> {staffMember.lastLogin ? format(new Date(staffMember.lastLogin), 'PPP p') : 'Never'}</p>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    