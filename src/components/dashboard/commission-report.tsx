

'use client';

import { useState, useMemo } from 'react';
import type { Payout, Staff, Role, Order, Bonus } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, DollarSign, MoreHorizontal, Gift } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateStaff } from '@/services/staff';
import { addTransaction } from '@/services/finances';
import { format } from 'date-fns';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

type CommissionRow = {
  staffId: string;
  name: string;
  role: string;
  commission: number;
  currency: string;
};

const getColumns = (
    openPayoutDialog: (staffId: string) => void
): ColumnDef<CommissionRow>[] => [
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
            const { staffId, commission } = row.original;
            const canPayout = commission > 0;
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
                            <DropdownMenuItem disabled={!canPayout} onSelect={() => openPayoutDialog(staffId)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Review &amp; Process Payout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export function CommissionReport({ staff, roles, orders, onPayout }: { staff: Staff[], roles: Role[], orders: Order[], onPayout: () => void }) {
    const { toast } = useToast();
    const [payoutStaff, setPayoutStaff] = useState<Staff | null>(null);

    const commissionData = useMemo(() => {
        return staff.filter(s => {
            const role = roles.find(r => r.name === s.role);
            return role?.commissionRules && role.commissionRules.length > 0 && s.totalCommission && s.totalCommission > 0;
        }).map(s => ({
            staffId: s.id,
            name: s.name,
            role: s.role,
            commission: s.totalCommission || 0,
            currency: s.currency || 'UGX',
        }));
    }, [staff, roles]);

    const { commissionBreakdown, totalBreakdownCommission } = useMemo(() => {
        if (!payoutStaff) return { commissionBreakdown: [], totalBreakdownCommission: 0 };

        // For simplicity, we're not re-calculating the breakdown here.
        // A real implementation would fetch historical commission records.
        // We'll just show the total and any bonuses.
        const bonusBreakdown = (payoutStaff.bonuses || []).map(bonus => ({
            ...bonus,
            isBonus: true,
        }));
        
        const total = (payoutStaff.totalCommission || 0);

        return { commissionBreakdown: bonusBreakdown, totalBreakdownCommission: total };

    }, [payoutStaff, orders, roles]);

    const handleOpenPayoutDialog = (staffId: string) => {
        const staffToPayout = staff.find(s => s.id === staffId);
        if (staffToPayout) {
            setPayoutStaff(staffToPayout);
        }
    }

    const handlePayout = async () => {
        if (!payoutStaff || !totalBreakdownCommission || !payoutStaff.currency) return;
        
        try {
            await addTransaction({
                date: format(new Date(), 'yyyy-MM-dd'),
                description: `Commission & Bonus payout to ${payoutStaff.name}`,
                amount: -totalBreakdownCommission,
                currency: payoutStaff.currency as 'UGX' | 'KES',
                type: 'Expense',
                category: 'Salaries',
                status: 'Cleared',
                paymentMethod: 'Bank Transfer'
            });

            const newPayout: Payout = {
                date: new Date().toISOString(),
                amount: totalBreakdownCommission,
                currency: payoutStaff.currency,
            };

            await updateStaff({ 
                ...payoutStaff, 
                totalCommission: 0, 
                bonuses: [],
                payoutHistory: [...(payoutStaff.payoutHistory || []), newPayout]
            });

            toast({
                title: 'Payout Successful',
                description: `${payoutStaff.name}'s commission has been paid out.`,
            });
            
            setPayoutStaff(null);
            onPayout();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Payout Failed',
                description: 'Could not process the payout. Please try again.',
            });
        }
    };
    
    const columns = useMemo(() => getColumns(handleOpenPayoutDialog), [staff, roles, orders]);
    
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Commission &amp; Bonus Payouts</CardTitle>
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

            <Dialog open={!!payoutStaff} onOpenChange={(isOpen) => !isOpen && setPayoutStaff(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Payout for {payoutStaff?.name}</DialogTitle>
                        <DialogDescription>
                            Total unpaid earnings of <span className="font-bold text-primary">{formatCurrency(totalBreakdownCommission, payoutStaff?.currency || 'UGX')}</span>. Review the sources below before confirming.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">This total includes commissions earned from sales and deliveries, plus any manually awarded bonuses.</p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button>Process Payout</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Commission Payout</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This will mark all unpaid earnings for {payoutStaff?.name} as paid and create an expense record. Are you sure?
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handlePayout}>
                                      Confirm Payout
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

    