'use client';

import { useState, useMemo } from 'react';
import type { Payout, Staff, Role, Order, Bonus } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, DollarSign, MoreHorizontal, Gift, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
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

type PayoutReviewDialogProps = {
    staffMember: Staff;
    onPayout: () => void;
    children: React.ReactNode;
}

function PayoutReviewDialog({ staffMember, onPayout, children }: PayoutReviewDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleProcessPayout = async () => {
        if (!staffMember.totalCommission || staffMember.totalCommission <= 0) {
            toast({ variant: 'destructive', title: 'No commission to pay out.' });
            return;
        }

        const payoutAmount = staffMember.totalCommission;
        const payoutCurrency = staffMember.currency || 'UGX';

        // 1. Create a payout record
        const newPayout: Payout = {
            date: new Date().toISOString(),
            amount: payoutAmount,
            currency: payoutCurrency,
        };

        // 2. Update the staff member
        const updatedStaffMember: Staff = {
            ...staffMember,
            totalCommission: 0, // Reset commission
            payoutHistory: [...(staffMember.payoutHistory || []), newPayout],
            bonuses: [], // Clear bonuses after they've been paid out
        };
        await updateStaff(updatedStaffMember);

        // 3. Create a corresponding expense transaction
        await addTransaction({
            date: new Date().toISOString(),
            description: `Commission payout for ${staffMember.name}`,
            amount: -payoutAmount,
            currency: payoutCurrency,
            type: 'Expense',
            category: 'Salaries',
            status: 'Cleared',
            paymentMethod: 'Mobile Money', // Or a configurable default
        });

        toast({
            title: 'Payout Processed',
            description: `${staffMember.name} has been paid ${formatCurrency(payoutAmount, payoutCurrency)}.`,
        });
        
        onPayout(); // This will trigger a data reload in the parent
        setIsOpen(false);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const totalBonuses = staffMember.bonuses?.reduce((sum, bonus) => sum + bonus.amount, 0) || 0;
    const commissionFromSales = (staffMember.totalCommission || 0) - totalBonuses;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Review Payout for {staffMember.name}</DialogTitle>
                    <DialogDescription>
                        Confirm the earnings breakdown before processing the payment.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold">Earnings Breakdown</h4>
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Commission from Sales</span>
                                    <span>{formatCurrency(commissionFromSales, staffMember.currency || 'UGX')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bonuses</span>
                                    <span>{formatCurrency(totalBonuses, staffMember.currency || 'UGX')}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>Total Payout</span>
                                    <span>{formatCurrency(staffMember.totalCommission || 0, staffMember.currency || 'UGX')}</span>
                                </div>
                            </CardContent>
                        </Card>
                        {staffMember.bonuses && staffMember.bonuses.length > 0 && (
                             <div className="space-y-2">
                                <h5 className="font-medium text-sm">Included Bonuses</h5>
                                <div className="border rounded-md p-2 space-y-2">
                                    {staffMember.bonuses.map(bonus => (
                                        <div key={bonus.id} className="text-xs flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{bonus.reason}</p>
                                                <p className="text-muted-foreground">Awarded on {format(new Date(bonus.date), 'PP')}</p>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(bonus.amount, staffMember.currency || 'UGX')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold">Recent Payout History</h4>
                        <Card>
                            <CardContent className="p-0">
                                <ScrollArea className="h-64">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staffMember.payoutHistory && staffMember.payoutHistory.length > 0 ? (
                                            staffMember.payoutHistory.slice().reverse().slice(0, 5).map((payout, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{format(new Date(payout.date), 'PPP')}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(payout.amount, payout.currency)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center">No previous payouts.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button disabled={!staffMember.totalCommission || staffMember.totalCommission <= 0}>Process Payout</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Payout</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will create an expense of {formatCurrency(staffMember.totalCommission || 0, staffMember.currency || 'UGX')} and reset {staffMember.name}'s unpaid commission balance. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleProcessPayout}>Confirm & Pay</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type CommissionRow = {
  staffId: string;
  name: string;
  role: string;
  commission: number;
  currency: string;
};

const getColumns = (staffList: Staff[], onPayout: () => void): ColumnDef<CommissionRow>[] => [
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
            const staffMember = staffList.find(s => s.id === staffId);
            const canPayout = commission > 0;

            if (!staffMember) return null;

            return (
                <div className="text-right">
                    <PayoutReviewDialog staffMember={staffMember} onPayout={onPayout}>
                        <Button disabled={!canPayout}>
                         <FileText className="mr-2 h-4 w-4" />
                         Review &amp; Payout
                       </Button>
                    </PayoutReviewDialog>
                </div>
            );
        },
    },
];

export function CommissionReport({ staff, roles, orders, onPayout }: { staff: Staff[], roles: Role[], orders: Order[], onPayout: () => void }) {
    
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
    
    const columns = useMemo(() => getColumns(staff, onPayout), [staff, onPayout]);

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
        </>
    );
}
