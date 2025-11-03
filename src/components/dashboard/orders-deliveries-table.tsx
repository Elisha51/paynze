
'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Truck, Store, PackageCheck, User } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

const deliveryStatusMap: { [key in Order['status']]: { label: string; color: string; } } = {
  'Awaiting Payment': { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  'Paid': { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  'Ready for Pickup': { label: 'In Store', color: 'bg-blue-100 text-blue-800' },
  'Shipped': { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
  'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  'Picked Up': { label: 'Completed', color: 'bg-green-100 text-green-800' },
  'Cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

function AssignOrderDialog({ order, staff, onUpdate, children, asChild }: { order: Order, staff: Staff[], onUpdate: (updatedOrder: Order) => void, children: React.ReactNode, asChild?: boolean }) {
    const { toast } = useToast();
    const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);

    const deliveryRiders = staff.filter(s => s.role === 'Delivery Rider');

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
            <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Order #{order.id} for Delivery</DialogTitle>
                    <DialogDescription>Select a delivery rider for this order.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedStaffId}>
                        <SelectTrigger><SelectValue placeholder="Select a rider..." /></SelectTrigger>
                        <SelectContent>
                            {deliveryRiders.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
    accessorKey: 'paymentMethod',
    header: 'Payment',
    cell: ({ row }) => {
      const payment = row.original.payment;
      if (!payment) {
        return <Badge variant="secondary">N/A</Badge>;
      }
      return (
        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
          {payment.method}
        </Badge>
      );
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
    )
  },
  {
    accessorKey: 'status',
    header: 'Delivery Status',
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
                    <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate}>
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
    }
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
                    {canEdit && <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate} asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>Re-assign Agent</DropdownMenuItem></AssignOrderDialog>}
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

  const recentOrders = data
    .filter(o => o.status === 'Paid' || o.status === 'Awaiting Payment' || o.status === 'Shipped' || o.status === 'Ready for Pickup')
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  return (
    <Card>
        <CardHeader>
            <CardTitle>Orders & Deliveries</CardTitle>
            <CardDescription>A summary of recent orders and their delivery status.</CardDescription>
        </CardHeader>
        <CardContent>
             <DataTable
                columns={columns}
                data={recentOrders}
            />
        </CardContent>
    </Card>
  );
}
