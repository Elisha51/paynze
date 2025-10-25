

'use client';

import { useState, useMemo } from 'react';
import type { Payout, Staff, Role } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, DollarSign, MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateStaff } from '@/services/staff';
import { addTransaction } from '@/services/finances';
import { format } from 'date-fns';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

type CommissionRow = {
  staffId: string;
  name: string;
  role: string;
  commission: number;
  currency: string;
};

const getColumns = (handlePayout: (staffId: string, amount: number, currency: string) => void): ColumnDef<CommissionRow>[] => [
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
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(amount);
            return <div className="text-right font-bold text-primary">{formatted}</div>;
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const { staffId, commission, currency, name } = row.original;
            const canPayout = commission > 0;
            return (
                <div className="text-right">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={!canPayout}>
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem disabled={!canPayout} onSelect={(e) => e.preventDefault()}>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Process Payout
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Commission Payout</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will mark all unpaid commissions for {name} as paid and create an expense record. Are you sure?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handlePayout(staffId, commission, currency)}>
                                    Confirm Payout
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
    },
];

export function CommissionReport({ staff, roles, onPayout }: { staff: Staff[], roles: Role[], onPayout: () => void }) {
    const { toast } = useToast();

    const commissionData = useMemo(() => {
        return staff.filter(s => {
            const role = roles.find(r => r.name === s.role);
            return role?.commission && role.commission.rate > 0 && s.totalCommission && s.totalCommission > 0;
        }).map(s => ({
            staffId: s.id,
            name: s.name,
            role: s.role,
            commission: s.totalCommission || 0,
            currency: s.currency || 'UGX',
        }));
    }, [staff, roles]);

    const handlePayout = async (staffId: string, amount: number, currency: string) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (!staffMember) return;
        
        try {
            // 1. Record an expense transaction
            await addTransaction({
                date: format(new Date(), 'yyyy-MM-dd'),
                description: `Commission payout to ${staffMember.name}`,
                amount: -amount,
                currency: currency as 'UGX' | 'KES',
                type: 'Expense',
                category: 'Salaries',
                status: 'Cleared',
            });

            // 2. Create a payout history record
            const newPayout: Payout = {
                date: new Date().toISOString(),
                amount: amount,
                currency: currency,
            };
            const updatedPayoutHistory = [...(staffMember.payoutHistory || []), newPayout];

            // 3. Reset the staff member's commission balance and add to history
            await updateStaff({ ...staffMember, totalCommission: 0, payoutHistory: updatedPayoutHistory });

            toast({
                title: 'Payout Successful',
                description: `${staffMember.name}'s commission has been paid out.`,
            });
            
            // 4. Refresh the data in the parent component
            onPayout();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Payout Failed',
                description: 'Could not process the payout. Please try again.',
            });
        }
    };
    
    const columns = useMemo(() => getColumns(handlePayout), [staff, roles]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Commission Payout Report</CardTitle>
                <CardDescription>View unpaid commissions and process payouts for your staff.</CardDescription>
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
    );
}
