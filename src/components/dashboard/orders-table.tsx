

'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, User, Truck, Store, PackageCheck } from 'lucide-react';
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
import type { Order } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { updateOrder, updateProductStock } from '@/services/orders';


function FulfillOrderDialog({ order, action, onUpdate, children, asChild }: { order: Order, action: 'deliver' | 'pickup' | 'ship' | 'ready', onUpdate: (updatedOrder: Order) => void, children: React.ReactNode, asChild?: boolean }) {
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
        const newStatus = newStatusMap[action];
        const updatedOrder = await updateOrder(order.id, { status: newStatus });
        
        if (action === 'deliver' || action === 'pickup') {
            await Promise.all(order.items.map(item => 
                updateProductStock(item.sku, -item.quantity, 'Sale', `Order #${order.id}`)
            ));
        }

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
            const assignableStaff = allStaff.filter(s => s.role === 'Delivery Rider');
            setStaff(assignableStaff);
        }
        loadStaff();
    }, []);

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
                            {staff.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
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
  Delivered: 'default',
  'Picked Up': 'default',
  Cancelled: 'destructive',
};


const getColumns = (onUpdate: (updatedOrder: Order) => void): ColumnDef<Order>[] => [
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
    accessorKey: 'channel',
    header: 'Channel',
    cell: ({ row }) => {
        const channel = row.getValue('channel') as Order['channel'];
        return <Badge variant={channel === 'Online' ? 'outline' : 'secondary'}>{channel}</Badge>
    }
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
  },
    {
    accessorKey: 'assignedStaffName',
    header: 'Fulfilled By',
    cell: ({ row }) => {
        const order = row.original;
        const staffName = order.fulfilledByStaffName || order.assignedStaffName;
        const staffId = order.fulfilledByStaffId || order.assignedStaffId;
        const isPickup = order.fulfillmentMethod === 'Pickup';

        if (!staffName || !staffId) {
            return <span className="text-muted-foreground">Unassigned</span>
        }
        return (
            <Link href={`/dashboard/staff/${staffId}`} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://picsum.photos/seed/${staffId}/24/24`} />
                    <AvatarFallback>{getInitials(staffName)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{staffName}</span>
                {isPickup ? <Store className="h-4 w-4 text-muted-foreground" title="Pickup" /> : <Truck className="h-4 w-4 text-muted-foreground" title="Delivery" />}
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
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right sticky right-0">Actions</div>,
    cell: ({ row }) => {
      const order = row.original;
      const isAwaitingPayment = order.status === 'Awaiting Payment';
      const isPaid = order.status === 'Paid';
      const canBeCancelled = order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Picked Up';
      const { toast } = useToast();

      const handleUpdateStatus = async (status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
        const updates: Partial<Order> = { status };
        if (paymentStatus) {
            updates.paymentStatus = paymentStatus;
        }
        const updatedOrder = await updateOrder(order.id, updates);
        onUpdate(updatedOrder);
        toast({ title: `Order #${order.id} Updated`, description: `Status changed to ${status}.`});
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

                         {isAwaitingPayment && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus('Paid', 'Paid')}>Mark as Paid</DropdownMenuItem>
                        )}
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
                        onClick={() => handleUpdateStatus('Cancelled')}
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
  filter?: {
    column: string;
    value?: string | string[];
    exists?: boolean;
    secondaryColumn?: string;
    secondaryValue?: string;
  };
};

export function OrdersTable({ orders, isLoading, filter }: OrdersTableProps) {
  const [data, setData] = React.useState<Order[]>([]);

  React.useEffect(() => {
    let filteredData = orders;

    if (filter) {
      if (filter.secondaryColumn && filter.secondaryValue) {
          filteredData = filteredData.filter(item => (item as any)[filter.secondaryColumn!] === filter.secondaryValue);
      }
      
      if (filter.value) {
        if (Array.isArray(filter.value)) {
            filteredData = filteredData.filter(item => (filter.value as string[]).includes((item as any)[filter.column]));
        } else {
            filteredData = filteredData.filter(item => (item as any)[filter.column] === filter.value);
        }
      } else if (typeof filter.exists !== 'undefined') {
        filteredData = filteredData.filter(item => {
          const hasProperty = Object.prototype.hasOwnProperty.call(item, filter.column) && (item as any)[filter.column] !== null && (item as any)[filter.column] !== undefined;
          return filter.exists ? hasProperty : !hasProperty;
        });
      }
    }
    
    setData(filteredData);
  }, [orders, filter]);

  const handleUpdate = (updatedOrder: Order) => {
    const updateFunc = (d: Order[]) => d.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setData(updateFunc);
    // You might want to bubble this up to the parent component as well
    // to update the main `orders` state if this component doesn't re-fetch.
  };
  
  const columns = React.useMemo(() => getColumns(handleUpdate), []);

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
