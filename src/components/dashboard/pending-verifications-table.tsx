
'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { XCircle, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Staff } from '@/lib/types';
import { DataTable } from './data-table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const getColumns = (
  onStatusUpdate: (staffId: string, status: 'Active' | 'Rejected', reason?: string) => void
): ColumnDef<Staff>[] => {
    
    return [
    {
        id: 'select',
        header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
            const staff = row.original;
            return (
                <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={staff.avatarUrl} />
                    <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{staff.name}</span>
                    <span className="text-xs text-muted-foreground">{staff.email}</span>
                </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'role',
        header: 'Applied Role',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const staff = row.original;
            const [rejectionReason, setRejectionReason] = React.useState('');
            
            const handleReject = () => {
                if (!rejectionReason) return;
                onStatusUpdate(staff.id, 'Rejected', rejectionReason);
            }
            
            return (
                <div className="text-right">
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
                                <DropdownMenuItem onClick={() => onStatusUpdate(staff.id, 'Active')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Approve
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reject Staff Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Please provide a reason for rejecting {staff.name}. This will be recorded for administrative purposes.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                <Textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReject} disabled={!rejectionReason}>Confirm Rejection</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
    },
    ];
};

interface PendingVerificationsTableProps {
  pendingStaff: Staff[];
  onStatusUpdate: (staffId: string, status: 'Active' | 'Rejected', reason?: string) => void;
  isLoading: boolean;
}

export function PendingVerificationsTable({
  pendingStaff,
  onStatusUpdate,
  isLoading
}: PendingVerificationsTableProps) {
  
  const columns = React.useMemo(() => getColumns(onStatusUpdate), [onStatusUpdate]);

  return (
    <DataTable
      columns={columns}
      data={pendingStaff}
      isLoading={isLoading}
      emptyState={{
        icon: CheckCircle,
        title: 'No Pending Verifications',
        description: "There are no new staff members awaiting approval.",
      }}
    />
  );
}
