'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, DollarSign, UserCheck, UserX, UserPlus } from 'lucide-react';
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
import type { Staff, OnboardingFormData, Role } from '@/lib/types';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { getRoles } from '@/services/roles';

type PayoutRow = {
  staffId: string;
  name: string;
  role: string;
  unpaidCommission: number;
  totalPaid: number;
  currency: string;
  status: 'Unpaid' | 'Paid' | 'Requesting Payout' | 'None';
};

const getColumns = (
  canEdit: boolean,
  currency: string
): ColumnDef<PayoutRow>[] => [
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
    enableSorting: false,
    enableHiding: false,
  },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Staff Member / Affiliate
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isAffiliate = row.original.role === 'Affiliate';
            const link = isAffiliate 
                ? `/dashboard/marketing/affiliates/${row.original.staffId}`
                : `/dashboard/staff/${row.original.staffId}`;
            return (
                <Link href={link} className="font-medium hover:underline">
                    {row.getValue('name')}
                </Link>
            )
        }
    },
    {
        accessorKey: 'role',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Role
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
    },
     {
        accessorKey: 'status',
        header: 'Payout Status',
        cell: ({ row }) => {
            const status = row.original.status;
            let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";
            if (status === 'Unpaid') variant = 'destructive';
            if (status === 'Paid') variant = 'default';
            if (status === 'Requesting Payout') variant = 'outline';
            
            return <Badge variant={variant}>{status}</Badge>
        },
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
    },
    {
        accessorKey: 'unpaidCommission',
        header: ({ column }) => (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Unpaid
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('unpaidCommission'));
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
            return <div className="text-right font-bold text-primary">{formatted}</div>;
        },
    },
    {
        accessorKey: 'totalPaid',
        header: ({ column }) => (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Total Paid
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('totalPaid'));
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const { staffId, unpaidCommission } = row.original;
            const canPayout = unpaidCommission > 0 && canEdit;

            return (
                <div className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={!canPayout}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild disabled={!canPayout}>
                                <Link href={`/dashboard/finances/payouts/${staffId}`}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Review & Payout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

type PayoutsTableProps = {
  staff: Staff[];
  roles: Role[];
};

const payoutStatuses = [
    { value: 'Unpaid', label: 'Unpaid' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Requesting Payout', label: 'Requesting Payout' },
    { value: 'None', label: 'None' },
];

export function PayoutsTable({ staff, roles }: PayoutsTableProps) {
  const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);
  const { user } = useAuth();
  const canEdit = user?.permissions.finances.edit;
  const currency = settings?.currency || 'UGX';
  const [activeTab, setActiveTab] = React.useState('all');

  React.useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
  }, []);
  
  const payoutData = React.useMemo(() => {
    return staff.map(s => {
        const unpaid = s.totalCommission || 0;
        const paid = s.paidCommission || 0;
        let status: PayoutRow['status'] = 'None';
        if (unpaid > 0) status = 'Unpaid';
        if (unpaid === 0 && paid > 0) status = 'Paid';

        return {
            staffId: s.id,
            name: s.name,
            role: s.role,
            unpaidCommission: unpaid,
            totalPaid: paid,
            currency: s.currency || currency,
            status,
        };
    });
  }, [staff, currency]);

  const filteredData = React.useMemo(() => {
    if (activeTab === 'all') return payoutData;
    if (activeTab === 'unpaid') return payoutData.filter(p => p.status === 'Unpaid');
    if (activeTab === 'paid') return payoutData.filter(p => p.status === 'Paid');
    return [];
  }, [payoutData, activeTab]);
  
  const columns = React.useMemo(() => getColumns(!!canEdit, currency), [canEdit, currency]);

  const roleOptions = roles.map(r => ({ value: r.name, label: r.name }));

  return (
    <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
        </Tabs>
        <DataTable
            columns={columns}
            data={filteredData}
            isLoading={!staff || !roles}
            filters={[
                {
                    columnId: 'role',
                    title: 'Role',
                    options: roleOptions
                },
                {
                    columnId: 'status',
                    title: 'Payout Status',
                    options: payoutStatuses
                },
            ]}
            emptyState={{
                icon: UserPlus,
                title: "No Payouts",
                description: "No staff or affiliates match the current filters.",
            }}
        />
    </div>
  );
}
