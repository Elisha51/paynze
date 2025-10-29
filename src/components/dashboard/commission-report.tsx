
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Payout, Staff, Role, Order, Bonus, OnboardingFormData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, DollarSign, MoreHorizontal, Gift, FileText } from 'lucide-react';
import Link from 'next/link';

type CommissionRow = {
  staffId: string;
  name: string;
  role: string;
  commission: number;
};

const getColumns = (currency: string): ColumnDef<CommissionRow>[] => [
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
            const canPayout = commission > 0;

            return (
                <div className="text-right">
                    <Button asChild disabled={!canPayout}>
                        <Link href={`/dashboard/finances/payouts/${staffId}`}>
                         <FileText className="mr-2 h-4 w-4" />
                         Review & Payout
                       </Link>
                    </Button>
                </div>
            );
        },
    },
];

export function CommissionReport({ staff, roles, orders, onPayout }: { staff: Staff[], roles: Role[], orders: Order[], onPayout: () => void }) {
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);
    
    const commissionData = useMemo(() => {
        return staff.filter(s => {
            const role = roles.find(r => r.name === s.role);
            return role?.commissionRules && role.commissionRules.length > 0 && s.totalCommission && s.totalCommission > 0;
        }).map(s => ({
            staffId: s.id,
            name: s.name,
            role: s.role,
            commission: s.totalCommission || 0,
        }));
    }, [staff, roles]);
    
    const columns = useMemo(() => getColumns(settings?.currency || 'UGX'), [settings?.currency]);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Commission & Bonus Payouts</CardTitle>
                    <CardDescription>View unpaid earnings and process payouts for your staff.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={commissionData}
                        emptyState={{
                            icon: DollarSign,
                            title: 'No Unpaid Commissions',
                            description: 'There are currently no staff members with pending commission payouts.',
                        }}
                    />
                </CardContent>
            </Card>
        </>
    );
}
