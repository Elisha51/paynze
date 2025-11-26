'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Staff, Role, Order, OnboardingFormData, AffiliateProgramSettings } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, FileText, Award, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { EmptyState } from '../ui/empty-state';

type CommissionRow = {
  staffId: string;
  name: string;
  role: string;
  commission: number;
  currency: string;
};

const getColumns = (canEdit: boolean, payoutThreshold?: number): ColumnDef<CommissionRow>[] => [
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
    },
    {
        accessorKey: 'commission',
        header: ({ column }) => (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Unpaid Commission
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('commission'));
            const currency = row.original.currency;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
            return <div className="text-right font-bold text-primary">{formatted}</div>;
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const { staffId, commission } = row.original;
            const meetsThreshold = payoutThreshold !== undefined ? commission >= payoutThreshold : true;
            const canPayout = commission > 0 && canEdit && meetsThreshold;

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
                                    <FileText className="mr-2 h-4 w-4" />
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

type CommissionReportProps = {
    type: 'staff' | 'affiliate';
    title: string;
    description: string;
    staff: Staff[];
    roles: Role[];
    orders: Order[];
    onPayout: () => void;
    onAwardBonus: () => void;
    cta?: React.ReactNode;
}

export function CommissionReport({ type, title, description, staff, roles, orders, onPayout, onAwardBonus, cta }: CommissionReportProps) {
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [affiliateSettings, setAffiliateSettings] = useState<AffiliateProgramSettings | null>(null);
    const { user } = useAuth();

    const canEditFinances = user?.permissions.finances.edit;
    const currency = settings?.currency || 'UGX';

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        const affData = localStorage.getItem('affiliateSettings');
        if (affData) {
            setAffiliateSettings(JSON.parse(affData));
        }
    }, []);
    
    const commissionData = useMemo(() => {
        return staff.map(s => {
            let totalUnpaid = s.totalCommission || 0;
            // The totalCommission is now pre-calculated in the service, so we just use it.
            return {
                staffId: s.id,
                name: s.name,
                role: s.role,
                commission: totalUnpaid,
                currency: s.currency || currency,
            }
        }).filter(s => s.commission > 0);
    }, [staff, orders, roles, affiliateSettings, currency]);
    
    const payoutThreshold = type === 'affiliate' ? affiliateSettings?.payoutThreshold : undefined;
    const columns = useMemo(() => getColumns(!!canEditFinances, payoutThreshold), [canEditFinances, payoutThreshold]);

    const Icon = type === 'staff' ? User : Users;

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="bg-muted p-3 rounded-md">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    {cta}
                    {canEditFinances && type === 'staff' && (
                        <Button variant="outline" onClick={onAwardBonus}>
                            <Award className="mr-2 h-4 w-4" />
                            Award Bonus / Adjustment
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={commissionData}
                    isLoading={!staff || !orders}
                    emptyState={{
                        icon: Users,
                        title: `No Unpaid ${type === 'staff' ? 'Commissions' : 'Payouts'}`,
                        description: `There are currently no ${type === 'staff' ? 'staff members' : 'affiliates'} with pending payouts.`,
                    }}
                />
            </CardContent>
        </Card>
    );
}
