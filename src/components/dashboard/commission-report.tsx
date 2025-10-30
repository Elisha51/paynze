
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Payout, Staff, Role, Order, Bonus, OnboardingFormData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, DollarSign, MoreHorizontal, Gift, FileText, Award } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '../ui/dropdown-menu';

type CommissionRow = {
  staffId: string;
  name: string;
  role: string;
  commission: number;
};

const getColumns = (currency: string, canEdit: boolean): ColumnDef<CommissionRow>[] => [
    {
        accessorKey: 'name',
        header: 'Staff Member',
        cell: ({ row }) => (
            <Link href={`/dashboard/staff/${row.original.staffId}`} className="font-medium hover:underline">
                {row.getValue('name')}
            </Link>
        )
    },
    {
        accessorKey: 'role',
        header: 'Role',
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
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
            return <div className="text-right font-bold text-primary">{formatted}</div>;
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const { staffId, commission } = row.original;
            const canPayout = commission > 0 && canEdit;

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

export function CommissionReport({ staff, roles, orders, onPayout, onAwardBonus }: { staff: Staff[], roles: Role[], orders: Order[], onPayout: () => void, onAwardBonus: () => void }) {
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const { user } = useAuth();

    const canEditFinances = user?.permissions.finances.edit;

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);
    
    const commissionData = useMemo(() => {
        return staff.filter(s => {
            const role = roles.find(r => r.name === s.role);
            const hasCommissionRules = role?.commissionRules && role.commissionRules.length > 0;
            const hasUnpaidBalance = s.totalCommission && s.totalCommission > 0;
            // Also include affiliates in the payout report
            const isAffiliate = s.role === 'Affiliate';
            return (hasCommissionRules || hasUnpaidBalance || isAffiliate);
        }).map(s => ({
            staffId: s.id,
            name: s.name,
            role: s.role,
            commission: s.totalCommission || 0,
        }));
    }, [staff, roles]);
    
    const columns = useMemo(() => getColumns(settings?.currency || 'UGX', !!canEditFinances), [settings?.currency, canEditFinances]);

    return (
        <>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Commission & Bonus Payouts</CardTitle>
                        <CardDescription>View unpaid earnings and process payouts for your staff and affiliates.</CardDescription>
                    </div>
                    {canEditFinances && (
                        <Button variant="outline" onClick={onAwardBonus}>
                            <Award className="mr-2 h-4 w-4" />
                            Award Bonus / Adjustment
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={commissionData}
                        emptyState={{
                            icon: DollarSign,
                            title: 'No Unpaid Commissions',
                            description: 'There are currently no staff members or affiliates with pending commission payouts.',
                        }}
                    />
                </CardContent>
            </Card>
        </>
    );
}
