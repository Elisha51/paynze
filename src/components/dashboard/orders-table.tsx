
'use client';
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
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
import type { Order, OnboardingFormData, Staff } from '@/lib/types';
import { DataTable } from './data-table';
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
import { getInitials } from '@/lib/utils';
import { updateOrder } from '@/services/orders';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AssignOrderDialog } from './assign-order-dialog';
import { FulfillOrderDialog } from './fulfill-order-dialog';
import { ConfirmPickupDialog } from './confirm-pickup-dialog';
import { format } from 'date-fns';

const statusVariantMap: { [key in Order['status']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  'Awaiting Payment': 'secondary',
  'Paid': 'default',
  'Ready for Pickup': 'outline',
  'Shipped': 'outline',
  'Attempted Delivery': 'outline',
  'Delivered': 'default',
  'Picked Up': 'default',
  'Cancelled': 'destructive',
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
  staff: Staff[],
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
      cell: ({ row }) => format(new Date(row.original.date), 'PPP')
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
    id: 'paymentMethod',
    accessorFn: row => row.payment.method,
    header: 'Payment',
    cell: ({ row }) => {
      const payment = row.original.payment;
      return (
        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
          {payment.method || 'N/A'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
        const method = row.original.payment.method;
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
    accessorKey: 'fulfillmentMethod',
    header: 'Fulfillment',
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
    accessorKey: 'assignedStaffName',
    header: 'Assigned To',
    cell: ({ row }) => {
        const order = row.original;
        const staffName = order.fulfilledByStaffName || order.assignedStaffName;
        const staffId = order.fulfilledByStaffId || order.assignedStaffId;
        
        if (!staffId || !staffName) {
            if (canEdit && order.status === 'Paid' && order.fulfillmentMethod === 'Delivery') {
                return (
                     <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate}>
                        <Button variant="outline" size="sm">Assign Agent</Button>
                    </AssignOrderDialog>
                );
            }
            return <span className="text-muted-foreground">—</span>;
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
      const canBeCancelled = order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Picked Up';
      
      const handleCancel = async () => {
        await updateOrder(order.id, { status: 'Cancelled' });
        onUpdate({ ...order, status: 'Cancelled' });
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

                        <DropdownMenuSeparator />

                        {canEdit && order.status === 'Awaiting Payment' && (
                          <FulfillOrderDialog order={order} action="paid" onUpdate={onUpdate}>
                            <DropdownMenuItem onSelect={e => e.preventDefault()}>Mark as Paid</DropdownMenuItem>
                          </FulfillOrderDialog>
                        )}

                        {canEdit && order.status === 'Paid' && order.fulfillmentMethod === 'Delivery' && (
                            <AssignOrderDialog order={order} staff={staff} onUpdate={onUpdate}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    {order.assignedStaffId ? 'Re-assign Agent' : 'Assign Agent'}
                                </DropdownMenuItem>
                            </AssignOrderDialog>
                        )}

                        {canEdit && order.status === 'Paid' && order.fulfillmentMethod === 'Pickup' && (
                           <FulfillOrderDialog order={order} action="ready" onUpdate={onUpdate}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Mark Ready for Pickup</DropdownMenuItem>
                           </FulfillOrderDialog>
                        )}

                        {canEdit && order.status === 'Ready for Pickup' && (
                           <ConfirmPickupDialog order={order} onUpdate={onUpdate}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Confirm Pickup</DropdownMenuItem>
                           </ConfirmPickupDialog>
                        )}
                        
                        {canEdit && canBeCancelled && (
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
  staff: Staff[];
  isLoading: boolean;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
};

export function OrdersTable({ orders, staff, isLoading, columnFilters, setColumnFilters }: OrdersTableProps) {
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
  
  const columns = React.useMemo(() => getColumns(handleUpdate, settings?.currency || 'UGX', staff, !!canEdit), [handleUpdate, settings?.currency, staff, canEdit]);
  
  const columnVisibility = React.useMemo(() => {
    const hasAnyAssignments = data.some(o => !!o.assignedStaffName || !!o.fulfilledByStaffName);
    return { assignedStaffName: hasAnyAssignments };
  }, [data]);

  return (
    <DataTable
      columns={columns}
      initialState={{ columnVisibility }}
      data={data}
      isLoading={isLoading}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
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
        cta: ( user?.permissions.orders.create &&
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
