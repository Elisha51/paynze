

'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, UserPlus } from 'lucide-react';
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
import type { Staff } from '@/lib/types';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { updateStaff } from '@/services/staff';

const getStatusBadge = (status: Staff['status']) => {
    const colors: Partial<Record<Staff['status'], string>> = {
        Active: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80',
        'Pending Verification': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80',
        Suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80',
        Deactivated: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80',
    }
    return <Badge variant={'outline'} className={colors[status]}>{status}</Badge>;
}

const getColumns = (
  onUpdate: (updatedStaff: Staff) => void
): ColumnDef<Staff>[] => [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={staff.avatarUrl} />
            <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link href={`/dashboard/staff/${staff.id}`} className="font-medium hover:underline">
              {staff.name}
            </Link>
            <span className="text-xs text-muted-foreground">{staff.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Role <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original.status),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'onlineStatus',
    header: 'Online Status',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className={cn(
          "h-2 w-2 rounded-full",
          row.original.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'
        )}></span>
        {row.original.onlineStatus}
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="relative bg-background text-right sticky right-0">
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
                <Link href={`/dashboard/staff/${staff.id}`}>View Details</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

type StaffTableProps = {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  isLoading: boolean;
};

export function StaffTable({ staff, setStaff, isLoading }: StaffTableProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = user?.permissions.staff.edit ?? false;

  const handleStatusUpdate = async (id: string, status: Staff['status']) => {
    const updated = await updateStaff(id, { status });
    setStaff(prev => prev.map(s => s.id === id ? updated : s));
  };
  
  const columns = React.useMemo(() => getColumns(handleStatusUpdate), [handleStatusUpdate]);

  const roleOptions = React.useMemo(() => {
    const roles = new Set(staff.map(s => s.role));
    return Array.from(roles).map(role => ({ value: role, label: role }));
  }, [staff]);

  const statusOptions = React.useMemo(() => {
    const statuses = new Set(staff.map(s => s.status));
    return Array.from(statuses).map(status => ({ value: status, label: status }));
  }, [staff]);

  return (
    <DataTable
      columns={columns}
      data={staff}
      isLoading={isLoading}
      filters={[
        { columnId: 'role', title: 'Role', options: roleOptions },
        { columnId: 'status', title: 'Status', options: statusOptions },
      ]}
      emptyState={{
        icon: UserPlus,
        title: "No Staff Members Yet",
        description: "Add your first team member or affiliate to get started.",
        cta: user?.permissions.staff.create && (
            <Button asChild>
                <Link href="/dashboard/staff/add">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff Member
                </Link>
            </Button>
        )
      }}
    />
  );
}
