
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStaff, updateStaff } from '@/services/staff';
import { addTransaction } from '@/services/finances';
import type { Staff, Payout, Order, CommissionRule, Bonus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle, Gift, DollarSign, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { getOrders } from '@/services/orders';
import { getRoles } from '@/services/roles';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EarningItem = {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'approved' | 'rejected' | 'pending';
    type: 'Commission' | 'Bonus';
    original: Order | Bonus;
};

export default function PayoutReviewPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [earningItems, setEarningItems] = useState<EarningItem[]>([]);
    const [payoutAmount, setPayoutAmount] = useState(0);

    const calculateCommissions = (staff: Staff, orders: Order[], roles: any[]): EarningItem[] => {
        const staffRole = roles.find(r => r.name === staff.role);
        if (!staffRole?.commissionRules && !staff.bonuses) return [];

        let commissionItems: EarningItem[] = [];

        if (staffRole?.commissionRules) {
            orders.forEach(order => {
                staffRole.commissionRules.forEach((rule: CommissionRule) => {
                    let isTriggered = false;
                    if (rule.trigger === 'On Order Paid' && order.paymentStatus === 'Paid' && order.salesAgentId === staff.id) {
                        isTriggered = true;
                    }
                    if (rule.trigger === 'On Order Delivered' && (order.status === 'Delivered' || order.status === 'Picked Up') && order.fulfilledByStaffId === staff.id) {
                        isTriggered = true;
                    }

                    if (isTriggered) {
                        let amount = 0;
                        if (rule.type === 'Fixed Amount') {
                            amount = rule.rate;
                        } else if (rule.type === 'Percentage of Sale') {
                            amount = order.total * (rule.rate / 100);
                        }
                        
                        commissionItems.push({
                            id: `comm-${order.id}-${rule.id}`,
                            date: order.date,
                            description: `${rule.name} on Order #${order.id}`,
                            amount,
                            status: 'pending',
                            type: 'Commission',
                            original: order
                        });
                    }
                });
            });
        }

        const bonusItems: EarningItem[] = (staff.bonuses || []).map(bonus => ({
            id: bonus.id,
            date: bonus.date,
            description: bonus.reason,
            amount: bonus.amount,
            status: 'pending',
            type: 'Bonus',
            original: bonus
        }));

        const paidItemIds = new Set(staff.payoutHistory?.flatMap(p => (p as any).paidItemIds || []) || []);
        
        return [...commissionItems, ...bonusItems]
            .filter(item => !paidItemIds.has(item.id))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };


    useEffect(() => {
        if (!id) return;
        async function loadData() {
            setLoading(true);
            const [staffList, ordersData, rolesData] = await Promise.all([getStaff(), getOrders(), getRoles()]);
            const member = staffList.find(s => s.id === id);
            
            if (member) {
                setStaffMember(member);
                const calculatedItems = calculateCommissions(member, ordersData, rolesData);
                const approvedItems = calculatedItems.map(item => ({ ...item, status: 'approved' as const }));
                setEarningItems(approvedItems);
                const total = approvedItems.reduce((sum, item) => sum + item.amount, 0);
                setPayoutAmount(total);

            } else {
                setStaffMember(null);
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    const handleItemToggle = (itemId: string, checked: boolean) => {
        const newItems = earningItems.map(item => 
            item.id === itemId ? { ...item, status: checked ? 'approved' : 'rejected' } : item
        );
        setEarningItems(newItems);
    };

    const handleItemAmountChange = (itemId: string, newAmount: number) => {
        const newItems = earningItems.map(item =>
            item.id === itemId ? { ...item, amount: newAmount } : item
        );
        setEarningItems(newItems);
    };
    
    useEffect(() => {
        const total = earningItems
            .filter(item => item.status === 'approved')
            .reduce((sum, item) => sum + item.amount, 0);
        setPayoutAmount(total);
    }, [earningItems]);
    
    const handleProcessPayout = async () => {
        if (!staffMember || payoutAmount <= 0) {
            toast({ variant: 'destructive', title: 'No approved earnings to pay out.' });
            return;
        }

        const approvedItems = earningItems.filter(item => item.status === 'approved');
        const approvedItemIds = approvedItems.map(item => item.id);

        const newPayout: Payout & { paidItemIds?: string[] } = {
            date: new Date().toISOString(),
            amount: payoutAmount,
            currency: staffMember.currency || 'UGX',
            paidItemIds: approvedItemIds,
        };
        
        const totalUnpaidEarnings = earningItems.reduce((sum, item) => sum + item.amount, 0);
        const remainingBalance = totalUnpaidEarnings - payoutAmount;

        const updatedStaff: Staff = {
            ...staffMember,
            totalCommission: remainingBalance > 0 ? remainingBalance : 0,
            payoutHistory: [...(staffMember.payoutHistory || []), newPayout],
        };

        await updateStaff(updatedStaff);

        await addTransaction({
            date: new Date().toISOString(),
            description: `Payout to ${staffMember.name}`,
            amount: -payoutAmount,
            currency: staffMember.currency || 'UGX',
            type: 'Expense',
            category: 'Salaries',
            status: 'Cleared',
            paymentMethod: 'Mobile Money',
        });

        toast({
            title: 'Payout Processed',
            description: `${staffMember.name} has been paid ${formatCurrency(payoutAmount, staffMember.currency || 'UGX')}.`,
        });
        
        router.push('/dashboard/finances?tab=payouts');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
             </div>
        );
    }

    if (!staffMember) {
        return <div>Staff member not found.</div>;
    }
    
    const approvedTotal = earningItems.filter(i => i.status === 'approved').reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/finances?tab=payouts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Payout Worksheet for {staffMember.name}</h1>
                    <p className="text-muted-foreground">Approve earnings and process payment for this staff member.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Unpaid Earnings</CardTitle>
                            <CardDescription>Select items to include in this payout. You can adjust the amount for each item before finalizing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                             <Checkbox 
                                                checked={earningItems.length > 0 && earningItems.every(i => i.status === 'approved')}
                                                onCheckedChange={(checked) => {
                                                    const newStatus = checked ? 'approved' : 'rejected';
                                                    const newItems = earningItems.map(i => ({...i, status: newStatus as 'approved' | 'rejected' }));
                                                    setEarningItems(newItems);
                                                }}
                                             />
                                        </TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="text-right w-40">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earningItems.length > 0 ? earningItems.map(item => (
                                        <TableRow key={item.id} className={item.status === 'rejected' ? 'bg-muted/50' : ''}>
                                            <TableCell>
                                                <Checkbox checked={item.status === 'approved'} onCheckedChange={(c) => handleItemToggle(item.id, !!c)} />
                                            </TableCell>
                                            <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {item.type === 'Bonus' && <Gift className="h-4 w-4 text-yellow-500" />}
                                                    {item.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {item.type === 'Bonus' ? `Awarded by ${(item.original as Bonus).awardedBy}` : `Order #${(item.original as Order).id}`}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                <Input 
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => handleItemAmountChange(item.id, Number(e.target.value))}
                                                    className="h-8 text-right"
                                                    disabled={item.status === 'rejected'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No unpaid earnings found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6 sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Approved Earnings:</span>
                                <span className="font-semibold">{formatCurrency(approvedTotal, staffMember.currency || 'UGX')}</span>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payoutAmount">Payment Amount</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="payoutAmount" type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(Number(e.target.value))} className="pl-8" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full" disabled={payoutAmount <= 0}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Review & Confirm Payout
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Payout</AlertDialogTitle>
                                        <AlertDialogDescription>
                                           You are about to process a payment of <strong className="text-foreground">{formatCurrency(payoutAmount, staffMember.currency || 'UGX')}</strong> to {staffMember.name}. This will create an expense record and update their unpaid balance. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleProcessPayout}>Confirm & Pay</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Recent Payout History</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                        <TableRow><TableCell colSpan={2} className="h-24 text-center">No payout history.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
