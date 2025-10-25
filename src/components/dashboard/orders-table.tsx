

'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, User, PackageCheck } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';

function AssignOrderDialog({ order }: { order: Order }) {
    const { toast } = useToast();
    const [staff, setStaff] = React.useState<Staff[]>([]);
    const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStaff() {
            const allStaff = await getStaff();
            // Filter for roles that can be assigned orders, e.g., Delivery Rider
            const assignableStaff = allStaff.filter(s => s.role === 'Delivery Rider');
            setStaff(assignableStaff);
        }
        loadStaff();
    }, []);

    const handleAssign = () => {
        if (!selectedStaffId) {
            toast({ variant: 'destructive', title: 'Please select a staff member.' });
            return;
        }
        // Simulate assignment
        console.log(`Assigning order ${order.id} to staff ${selectedStaffId}`);
        toast({ title: 'Order Assigned', description: `Order ${order.id} has been assigned.` });
    }

    return (
         <Dialog>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    Assign
                </div>
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
  Pending: 'secondary',
  Paid: 'secondary',
  'Ready for Pickup': 'outline',
  Shipped: 'outline',
  Delivered: 'default',
  'Picked Up': 'default',
  Cancelled: 'destructive',
};


const columns: ColumnDef<Order>[] = [
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
        <Badge variant={statusVariantMap[status] || 'secondary'}>
          {status}
        </Badge>
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
                {isPickup && <PackageCheck className="h-4 w-4 text-muted-foreground" title="Pickup" />}
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
    enableHiding: false,
    cell: ({ row }) => {
      return (
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
                <Link href={`/dashboard/orders/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Mark as Shipped</DropdownMenuItem>
            <AssignOrderDialog order={row.original} />
          </DropdownMenuContent>
        </DropdownMenu>
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
    if (filter) {
      let filteredData = orders;

      if (filter.secondaryColumn && filter.secondaryValue) {
          filteredData = filteredData.filter(item => (item as any)[filter.secondaryColumn!] === filter.secondaryValue);
      }

      if (filter.value) {
        if (Array.isArray(filter.value)) {
            filteredData = filteredData.filter(item => (filter.value as string[]).includes((item as any)[filter.column]));
        } else {
            filteredData = filteredData.filter(item => (item as any)[filter.column] === filter.value);
        }
      } else if (filter.exists === true) {
        filteredData = filteredData.filter(item => !!(item as any)[filter.column]);
      } else if (filter.exists === false) {
        filteredData = filteredData.filter(item => !(item as any)[filter.column]);
      }
      setData(filteredData);
    } else {
      setData(orders);
    }
  }, [orders, filter]);

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}
