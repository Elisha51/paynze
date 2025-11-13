'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Truck, Store } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order, Staff } from '@/lib/types';
import { DataTable } from './data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { updateOrder } from '@/services/orders';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { useAuth } from '@/context/auth-context';
import { User } from 'lucide-react';


const deliveryStatusMap: { [key in Order['status']]: { label: string; color: string; } } = {
  'Awaiting Payment': { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  'Paid': { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  'Ready for Pickup': { label: 'In Store', color: 'bg-blue-100 text-blue-800' },
  'Shipped': { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
  'Attempted Delivery': { label: 'Attempted', color: 'bg-orange-100 text-orange-800' },
  'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  'Picked Up': { label: 'Completed', color: 'bg-green-100 text-green-800' },
  'Cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

const paymentMethods = [
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery' },
];

const fulfillmentMethods = [
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Pickup', label: 'Pickup' },
];


function AssignOrderDialog({ order, staff, onUpdate, children, asChild }: { order: Order, staff: Staff[], onUpdate: (updatedOrder: Order) => void, children: React.ReactNode, asChild?: boolean }) {
    const { toast } = useToast();
    const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);

    const deliveryRiders = staff.filter(s => s.role === 'Agent');
    
    const suggestedRiders = React.useMemo(() => {
        return deliveryRiders
            .filter(rider => {
                const isOnline = rider.onlineStatus === 'Online';
                const deliveryZones = rider.attributes?.deliveryZones as string[] | undefined;
                if (!deliveryZones || deliveryZones.length === 0) return isOnline; // Available if online and no zones set
                return isOnline && deliveryZones.includes(order.shippingAddress.city);
            })
            .sort((a,b) => (a.assignedOrders?.length || 0) - (b.assignedOrders?.length || 0)); // Prioritize riders with fewer orders
    }, [deliveryRiders, order.shippingAddress.city]);
    
    const otherRiders = deliveryRiders.filter(r => !suggestedRiders.find(s => s.id === r.id));


    const handleAssign = async () => {
        if (!selectedStaffId) {
            toast({ variant: 'destructive', title: 'Please select a rider.' });
            return;
        }
        const selectedStaffMember = staff.find(s => s.id === selectedStaffId);
        if (!selectedStaffMember) return;
        
        const updatedOrder = await updateOrder(order.id, { 
            assignedStaffId: selectedStaffId, 
            assignedStaffName: selectedStaffMember.name,
            status: 'Shipped',
        });

        onUpdate(updatedOrder);
        toast({ title: 'Order Assigned', description: `Order ${order.id} has been assigned to ${selectedStaffMember.name}.` });
    }

    return (
         <Dialog>
            <DialogTrigger asChild={asChild}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Order #{order.id} for Delivery</DialogTitle>
                    <DialogDescription>To: {order.customerName} at {order.shippingAddress.street}, {order.shippingAddress.city}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedStaffId}>
                        <SelectTrigger><SelectValue placeholder="Select a rider..." /></SelectTrigger>
                        <SelectContent>
                             {suggestedRiders.length > 0 && <SelectValue>Suggested Riders</SelectValue>}
                             {suggestedRiders.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.assignedOrders?.length || 0} orders)</SelectItem>
                            ))}
                            {otherRiders.length > 0 && <SelectValue>Other Riders</SelectValue>}
                            {otherRiders.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.assignedOrders?.length || 0} orders)</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleAssign}>Assign Rider</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const getColumns = (
  onUpdate: (updatedOrder: Order) => void,
  staff: Staff[],
  canEdit: boolean
): ColumnDef<Order>[] => [
  {
    accessorKey: 'id',
    header: 'Order #',
    cell: ({ row }) => (
        <Link href={`/dashboard/orders/${row.original.id}`} className="font-mono text-xs hover:underline">
            {row.getValue('id')}
        </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: 'Customer',
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const order = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'paymentMethod',
    accessorFn: row => row.payment?.method,
    header: 'Payment Method',
    cell: ({ row }) => {
      const payment = row.original.payment;
      return <span>{payment.method}</span>;
    },
    filterFn: (row, id, value) => {
      const method = row.original.payment?.method;
      if (!method) return false;
      return value.includes(method);
    },
  },
  {
    accessorKey: 'fulfillmentMethod',
    header: 'Delivery Type',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.fulfillmentMethod === 'Delivery' ? <Truck className="h-4 w-4 text-muted-foreground"/> : <Store className="h-4 w-4 text-muted-foreground"/>}
        {row.original.fulfillmentMethod}
      </div>
    ),
     filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'status',
    header: 'Fulfillment Status',
    cell: ({ row }) => {
      const statusInfo = deliveryStatusMap[row.original.status];
      return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
    },
  },
    {
    accessorKey: 'assignedStaffName',
    header: 'Assigned To',
    cell: ({ row }) => {
        const order = row.original;
        const staffName = order.fulfilledByStaffName || order.assignedStaffName;
        const staffId = order.fulfilledByStaffId || order.assignedStaffId;
        
        if (order.status === 'Cancelled') {
            return <span className="text-muted-foreground">—</span>;
        }

        if (!staffId || !staffName) {
            if (canEdit && order.fulfillmentMethod === 'Delivery' && (order.status === 'Paid' || order.status === 'Awaiting Payment')) {
                return (
                    <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate} asChild>
                        <Button variant="outline" size="sm">
                            <User className="mr-2 h-4 w-4" />
                            Assign
                        </Button>
                    </AssignOrderDialog>
                )
            }
            return <Badge variant="destructive">Unassigned</Badge>
        }
        return (
            <Link href={`/dashboard/staff/${staffId}`} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://picsum.photos/seed/${staffId}/24/24`} />
                    <AvatarFallback>{getInitials(staffName)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-xs">{staffName}</span>
            </Link>
        )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link href={`/dashboard/orders/${order.id}`}>View Details</Link></DropdownMenuItem>
                    {canEdit && 
                    <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate} asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Re-assign Agent</DropdownMenuItem>
                    </AssignOrderDialog>
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

type OrdersDeliveriesTableProps = {
  orders: Order[];
  staff: Staff[];
};

export function OrdersDeliveriesTable({ orders, staff }: OrdersDeliveriesTableProps) {
  const [data, setData] = React.useState<Order[]>(orders);
  const { user } = useAuth();
  const canEdit = user?.permissions.orders.edit;

  React.useEffect(() => {
    setData(orders);
  }, [orders]);

  const handleUpdate = (updatedOrder: Order) => {
    setData(currentData => currentData.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };
  
  const columns = React.useMemo(() => getColumns(handleUpdate, staff, !!canEdit), [handleUpdate, staff, canEdit]);

  const deliveryWorklist = data
    .filter(o => {
        const isPaid = o.payment?.status === 'completed';
        const isReadyForFulfillment = ['Paid', 'Ready for Pickup', 'Shipped', 'Attempted Delivery'].includes(o.status);
        return isPaid && isReadyForFulfillment;
    })
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const staffOptions = React.useMemo(() => 
    staff
      .filter(s => s.role === 'Agent')
      .map(s => ({ value: s.name, label: s.name }))
  , [staff]);


  return (
    <Card>
        <CardHeader>
            <CardTitle>Delivery Worklist</CardTitle>
            <CardDescription>A summary of paid orders that are ready for fulfillment or are in transit.</CardDescription>
        </CardHeader>
        <CardContent>
             <DataTable
                columns={columns}
                data={deliveryWorklist}
                isLoading={!orders || !staff}
                filters={[
                    {
                        columnId: 'fulfillmentMethod',
                        title: 'Delivery Type',
                        options: fulfillmentMethods
                    },
                    {
                        columnId: 'assignedStaffName',
                        title: 'Assigned To',
                        options: staffOptions
                    },
                ]}
            />
        </CardContent>
    </Card>
  );
}
