
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStaff, updateStaff } from '@/services/staff';
import { addTransaction } from '@/services/finances';
import type { Staff, Payout } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, DollarSign, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';

type EarningItem = {
    date: string;
    description: string;
    amount: number;
    link?: string;
};

export default function PayoutReviewPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        async function loadStaff() {
            setLoading(true);
            const staffList = await getStaff();
            const member = staffList.find(s => s.id === id);
            setStaffMember(member || null);
            setLoading(false);
        }
        loadStaff();
    }, [id]);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const earningItems: EarningItem[] = useMemo(() => {
        if (!staffMember) return [];
        // This is a simplified calculation. In a real app, this data would come from a more structured source.
        const saleCommissions: EarningItem[] = (staffMember.totalSales ? [{
            date: new Date().toISOString(),
            description: `Commission from sales`,
            amount: (staffMember.totalCommission || 0) - (staffMember.bonuses?.reduce((sum, b) => sum + b.amount, 0) || 0)
        }] : []);

        const bonusItems: EarningItem[] = (staffMember.bonuses || []).map(bonus => ({
            date: bonus.date,
            description: `Bonus: ${bonus.reason}`,
            amount: bonus.amount,
        }));
        
        return [...saleCommissions, ...bonusItems].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [staffMember]);
    
    const handleProcessPayout = async () => {
        if (!staffMember || !staffMember.totalCommission || staffMember.totalCommission <= 0) {
            toast({ variant: 'destructive', title: 'No commission to pay out.' });
            return;
        }

        const payoutAmount = staffMember.totalCommission;
        const payoutCurrency = staffMember.currency || 'UGX';

        const newPayout: Payout = { date: new Date().toISOString(), amount: payoutAmount, currency: payoutCurrency };
        const updatedStaff: Staff = {
            ...staffMember,
            totalCommission: 0,
            payoutHistory: [...(staffMember.payoutHistory || []), newPayout],
            bonuses: [],
        };
        await updateStaff(updatedStaff);
        await addTransaction({
            date: new Date().toISOString(),
            description: `Commission payout for ${staffMember.name}`,
            amount: -payoutAmount,
            currency: payoutCurrency,
            type: 'Expense',
            category: 'Salaries',
            status: 'Cleared',
            paymentMethod: 'Mobile Money',
        });

        toast({
            title: 'Payout Processed',
            description: `${staffMember.name} has been paid ${formatCurrency(payoutAmount, payoutCurrency)}.`,
        });
        
        router.push('/dashboard/finances?tab=payouts');
    };

    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
             </div>
        );
    }

    if (!staffMember) {
        return <div>Staff member not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/finances?tab=payouts">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Review Payout for {staffMember.name}</h1>
                    <p className="text-muted-foreground">Confirm earnings and process payment for this staff member.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Unpaid Earnings Breakdown</CardTitle>
                            <CardDescription>A list of all commissions and bonuses contributing to the unpaid total.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earningItems.length > 0 ? earningItems.map(item => (
                                        <TableRow key={item.date + item.description}>
                                            <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.amount, staffMember.currency || 'UGX')}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">No unpaid earnings.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
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
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex justify-between text-lg">
                                <span className="text-muted-foreground">Total Payout:</span>
                                <span className="font-bold text-primary">{formatCurrency(staffMember.totalCommission || 0, staffMember.currency || 'UGX')}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full" disabled={!staffMember.totalCommission || staffMember.totalCommission <= 0}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Process Payout
                                    </Button>
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
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
