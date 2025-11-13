
'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, User, Truck, Store, PackageCheck, ShoppingCart, PlusCircle, Edit } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Order, OnboardingFormData } from '@/lib/types';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { updateOrder } from '@/services/orders';
import { useAuth } from '@/context/auth-context';


function FulfillOrderDialog({ order, action, onUpdate, children, asChild }: { order: Order, action: 'deliver' | 'pickup' | 'ship' | 'ready', onUpdate: (updatedOrder: Order) => void, children: React.ReactNode, asChild?: boolean }) {
    const { user } = useAuth();
    const { toast } = useToast();

    const titles = {
        deliver: 'Mark as Delivered',
        pickup: 'Mark as Picked Up',
        ship: 'Mark as Shipped',
        ready: 'Mark as Ready for Pickup'
    };

    const descriptions = {
        deliver: `This will mark order #${order.id} as 'Delivered' and update inventory. This action cannot be undone.`,
        pickup: `This will mark order #${order.id} as 'Picked Up' and update inventory. This action cannot be undone.`,
        ship: `This will mark order #${order.id} as 'Shipped'. Inventory will not be adjusted until the order is delivered.`,
        ready: `This will mark order #${order.id} as 'Ready for Pickup'.`
    };
    
    const newStatusMap = {
        deliver: 'Delivered',
        pickup: 'Picked Up',
        ship: 'Shipped',
        ready: 'Ready for Pickup',
    } as const;

    const handleFulfill = async () => {
        if (!user) return;
        const newStatus = newStatusMap[action];
        const updates: Partial<Order> = { status: newStatus };

        if (action === 'deliver' || action === 'pickup') {
            updates.fulfilledByStaffId = user.id;
            updates.fulfilledByStaffName = user.name;
        }
        
        const updatedOrder = await updateOrder(order.id, updates);

        onUpdate(updatedOrder);
        toast({ title: `Order #${order.id} Updated`, description: `Status changed to ${newStatus}.`});
    }

    return (
        <Dialog>
            <DialogTrigger asChild={asChild}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titles[action]}</DialogTitle>
                    <DialogDescription>{descriptions[action]}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleFulfill}>Confirm</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AssignOrderDialog({ order, onUpdate, children, asChild }: { order: Order, onUpdate: (updatedOrder: Order) => void, children: React.ReactNode, asChild?: boolean }) {
    const { toast } = useToast();
    const [staff, setStaff] = React.useState<Staff[]>([]);
    const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStaff() {
            const allStaff = await getStaff();
            const assignableStaff = allStaff.filter(s => s.role === 'Agent');
            setStaff(assignableStaff);
        }
        loadStaff();
    }, []);
    
    const suggestedRiders = React.useMemo(() => {
        return staff
            .filter(rider => {
                const isOnline = rider.onlineStatus === 'Online';
                const deliveryZones = rider.attributes?.deliveryZones as string[] | undefined;
                if (!deliveryZones || deliveryZones.length === 0) return isOnline; // Available if online and no zones set
                return isOnline && deliveryZones.includes(order.shippingAddress.city);
            })
            .sort((a,b) => (a.assignedOrders?.length || 0) - (b.assignedOrders?.length || 0)); // Prioritize riders with fewer orders
    }, [staff, order.shippingAddress.city]);
    
    const otherRiders = staff.filter(r => !suggestedRiders.find(s => s.id === r.id));

    const handleAssign = async () => {
        if (!selectedStaffId) {
            toast({ variant: 'destructive', title: 'Please select a staff member.' });
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
                    <DialogTitle>Assign Order #{order.id}</DialogTitle>
                    <DialogDescription>Select a staff member to assign this order to for delivery.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedStaffId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a staff member..." />
                        </SelectTrigger>
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
                    <DialogClose asChild>
                        <Button onClick={handleAssign}>Assign Order</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  'Awaiting Payment': 'secondary',
  Paid: 'default',
  'Ready for Pickup': 'outline',
  Shipped: 'outline',
  'Attempted Delivery': 'outline',
  Delivered: 'default',
  'Picked Up': 'default',
  Cancelled: 'destructive',
};

const orderStatuses = [
    { value: 'Awaiting Payment', label: 'Awaiting Payment' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Ready for Pickup', label: 'Ready for Pickup' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Attempted Delivery', label: 'Attempted Delivery' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Picked Up', label: 'Picked Up' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const fulfillmentMethods = [
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Pickup', label: 'Pickup' },
];

const paymentMethods = [
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery' },
];

const channels = [
    { value: 'Online', label: 'Online' },
    { value: 'Manual', label: 'Manual' },
    { value: 'POS', label: 'POS' },
];


const getColumns = (
  onUpdate: (updatedOrder: Order) => void,
  currency: string,
  canEdit: boolean
): ColumnDef<Order>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => (
        <Link href={`/dashboard/orders/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue('id')}
        </Link>
    ),
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => {
        const order = row.original;
        return (
             <Link href={`/dashboard/customers/${order.customerId}`} className="font-medium hover:underline">
                {order.customerName}
            </Link>
        )
    }
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    id: 'paymentMethod',
    accessorFn: row => row.payment?.method,
    header: 'Payment',
    cell: ({ row }) => {
      const payment = row.original.payment;
      return (
        <Badge variant={payment?.status === 'completed' ? 'default' : 'secondary'}>
          {payment?.method || 'N/A'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
        const method = row.original.payment?.method;
        if (!method) return false;
        return value.includes(method)
    },
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) => {
        const channel = row.getValue('channel') as string;
        return <Badge variant="outline">{channel}</Badge>
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Order['status'];
      return (
        <div className="whitespace-nowrap">
          <Badge variant={statusVariantMap[status] || 'secondary'}>
            {status}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
    {
    accessorKey: 'fulfillmentMethod',
    header: 'Fulfillment',
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
    {
    accessorKey: 'assignedStaffName',
    header: 'Assigned To',
    cell: ({ row }) => {
        const order = row.original;
        const staffName = order.fulfilledByStaffName || order.assignedStaffName;
        const staffId = order.fulfilledByStaffId || order.assignedStaffId;
        
        if (!staffName) {
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
    accessorKey: 'total',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
    cell: ({ row }) => {
      const order = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(order.total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <div className="text-right sticky right-0">Actions</div>,
    cell: ({ row }) => {
      const order = row.original;
      const isPaid = order.status === 'Paid';
      const canBeCancelled = order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Picked Up';
      
      const handleCancel = async () => {
        const updatedOrder = await updateOrder(order.id, { status: 'Cancelled' });
        onUpdate(updatedOrder);
      }

      return (
        <div className="relative bg-background text-right sticky right-0 flex items-center justify-end gap-2">
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        
                        {canEdit && order.channel === 'Manual' && (
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/orders/${order.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Order</Link>
                            </DropdownMenuItem>
                        )}

                        {canEdit && (
                          <>
                            {isPaid && order.fulfillmentMethod === 'Delivery' && (
                                <AssignOrderDialog order={order} onUpdate={onUpdate} asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Assign for Delivery</DropdownMenuItem>
                                </AssignOrderDialog>
                            )}
                            {isPaid && order.fulfillmentMethod === 'Pickup' && (
                                <FulfillOrderDialog order={order} action="ready" onUpdate={onUpdate} asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Mark as Ready for Pickup</DropdownMenuItem>
                                </FulfillOrderDialog>
                            )}
                            {order.status === 'Ready for Pickup' && (
                                <FulfillOrderDialog order={order} action="pickup" onUpdate={onUpdate} asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Mark as Picked Up</DropdownMenuItem>
                                </FulfillOrderDialog>
                            )}
                            {order.status === 'Shipped' && (
                                <FulfillOrderDialog order={order} action="deliver" onUpdate={onUpdate} asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Mark as Delivered</DropdownMenuItem>
                                </FulfillOrderDialog>
                            )}
                            
                            {canBeCancelled && (
                              <>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        Cancel Order
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </>
                            )}
                          </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will cancel order #{order.id}. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Back</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={handleCancel}
                    >
                        Cancel Order
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      );
    },
  },
];

type OrdersTableProps = {
  orders: Order[];
  isLoading: boolean;
};

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const [data, setData] = React.useState<Order[]>(orders);
  const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);
  const { user } = useAuth();
  const canEdit = user?.permissions.orders.edit;

  React.useEffect(() => {
    setData(orders);
    const storedSettings = localStorage.getItem('onboardingData');
    if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
    }
  }, [orders]);

  const handleUpdate = (updatedOrder: Order) => {
    setData(currentData => currentData.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };
  
  const columns = React.useMemo(() => getColumns(handleUpdate, settings?.currency || 'UGX', !!canEdit), [handleUpdate, settings?.currency, canEdit]);
  
  const columnVisibility = React.useMemo(() => {
    // Hide 'Assigned To' column if no orders have an assigned staff member
    const hasAnyAssignments = data.some(o => !!o.assignedStaffName || !!o.fulfilledByStaffName);
    return { assignedStaffName: hasAnyAssignments };
  }, [data]);

  return (
    <DataTable
      columns={columns}
      data={data}
      columnVisibility={columnVisibility}
      isLoading={isLoading}
      filters={[
          { columnId: 'status', title: 'Status', options: orderStatuses },
          { columnId: 'fulfillmentMethod', title: 'Fulfillment', options: fulfillmentMethods },
          { columnId: 'paymentMethod', title: 'Payment', options: paymentMethods },
          { columnId: 'channel', title: 'Channel', options: channels },
      ]}
      emptyState={{
        icon: ShoppingCart,
        title: "No Orders Found",
        description: "You haven't received any orders matching these filters. When you do, they will appear here.",
        cta: (
            <Button asChild>
                <Link href="/dashboard/orders/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create an Order
                </Link>
            </Button>
        )
      }}
    />
  );
}
