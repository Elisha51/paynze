
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Check, DollarSign, FileText } from 'lucide-react';
import type { Staff, OnboardingFormData, Order, Role, AffiliateProgramSettings, Payout } from '@/lib/types';
import { getStaff, updateStaff } from '@/services/staff';
import { useToast } from '@/hooks/use-toast';
import { addTransaction } from '@/services/finances';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { getOrders } from '@/services/orders';
import { getRoles } from '@/services/roles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/data-table';
import { calculateCommissionForOrder } from '@/services/commissions';
import { useAuth } from '@/context/auth-context';

const payoutHistoryColumns: ColumnDef<Payout>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP')
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
            const payout = row.original;
            const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: payout.currency }).format(payout.amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
];

type CommissionableOrder = Order & { commission: number };

const commissionBreakdownColumns = (currency: string): ColumnDef<CommissionableOrder>[] => [
    {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => (
            <Link href={`/dashboard/orders/${row.original.id}`} className="font-medium hover:underline text-primary">
                {row.getValue('id')}
            </Link>
        )
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.getValue('date')), 'PPP')
    },
    {
        accessorKey: 'total',
        header: 'Order Total',
        cell: ({ row }) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(row.original.total)
    },
    {
        accessorKey: 'commission',
        header: 'Commission Earned',
        cell: ({ row }) => {
             const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(row.original.commission);
             return <div className="font-semibold text-green-600">{formatted}</div>
        }
    }
];

export default function PayoutPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;
    const { user: currentUser } = useAuth();

    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [affiliateSettings, setAffiliateSettings] = useState<AffiliateProgramSettings | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [staffData, settingsData, ordersData, rolesData, affSettingsData] = await Promise.all([
                getStaff().then(all => all.find(s => s.id === id)),
                localStorage.getItem('onboardingData'),
                getOrders(),
                getRoles(),
                localStorage.getItem('affiliateSettings'),
            ]);
            setStaffMember(staffData || null);
            if (settingsData) setSettings(JSON.parse(settingsData));
            if (affSettingsData) setAffiliateSettings(JSON.parse(affSettingsData));
            setAllOrders(ordersData);
            setRoles(rolesData);
            setIsLoading(false);
        }
        loadData();
    }, [id]);

    const { unpaidCommissionableOrders, totalUnpaidCommission } = useMemo(() => {
        if (!staffMember || allOrders.length === 0 || roles.length === 0) {
            return { unpaidCommissionableOrders: [], totalUnpaidCommission: 0 };
        }

        const paidOutOrderIds = new Set((staffMember.payoutHistory || []).flatMap(p => p.paidItemIds || []));

        const commissionableOrders: CommissionableOrder[] = allOrders
            .filter(order => !paidOutOrderIds.has(order.id)) // Filter out already paid orders
            .map(order => {
                const commission = calculateCommissionForOrder(order, staffMember, roles, affiliateSettings);
                return commission > 0 ? { ...order, commission } : null;
            })
            .filter((o): o is CommissionableOrder => o !== null);

        const total = commissionableOrders.reduce((sum, order) => sum + order.commission, 0);

        return { unpaidCommissionableOrders: commissionableOrders, totalUnpaidCommission: total };

    }, [staffMember, allOrders, roles, affiliateSettings]);

    const handleConfirmPayout = async () => {
        if (!staffMember || totalUnpaidCommission <= 0 || !currentUser) return;

        const newPayout: Payout = {
            date: new Date().toISOString(),
            amount: totalUnpaidCommission,
            currency: staffMember.currency || 'UGX',
            paidItemIds: unpaidCommissionableOrders.map(o => o.id),
            paidByStaffId: currentUser.id,
            paidByStaffName: currentUser.name,
        };

        const updatedStaff: Staff = {
            ...staffMember,
            payoutHistory: [...(staffMember.payoutHistory || []), newPayout],
            paidCommission: (staffMember.paidCommission || 0) + totalUnpaidCommission,
            totalCommission: 0 // Reset pending commission
        };
        await updateStaff(updatedStaff.id, updatedStaff);

        await addTransaction({
            date: new Date().toISOString(),
            description: `Payout to ${staffMember.name} for commission`,
            amount: -totalUnpaidCommission,
            currency: staffMember.currency || 'UGX',
            type: 'Expense',
            category: 'Salaries',
            status: 'Cleared',
            paymentMethod: 'Mobile Money'
        });

        toast({
            title: 'Payout Successful',
            description: `A payment of ${formatCurrency(totalUnpaidCommission)} has been recorded for ${staffMember.name}.`
        });

        router.push('/dashboard/finances?tab=commissions');
    };
    
    const formatCurrency = (amount: number) => {
        const currencyCode = staffMember?.currency || settings?.currency || 'UGX';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
    };

    if (isLoading) {
        return (
            <DashboardPageLayout title="Loading Payout Details...">
                 <Skeleton className="h-[600px] w-full" />
            </DashboardPageLayout>
        )
    }
    
    if (!staffMember) {
        return (
            <DashboardPageLayout title="Error">
                <Card>
                    <CardHeader><CardTitle>Staff Member Not Found</CardTitle></CardHeader>
                    <CardContent>
                        <p>The requested staff member could not be found.</p>
                        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
                    </CardContent>
                </Card>
            </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title={`Review Payout for ${staffMember.name}`} backHref="/dashboard/finances?tab=commissions">
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12">
                                <AvatarImage src={staffMember.avatarUrl} />
                                <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{staffMember.name}</CardTitle>
                                <CardDescription>{staffMember.role}</CardDescription>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-muted-foreground">Total Unpaid Commission</p>
                             <p className="text-3xl font-bold text-primary">{formatCurrency(totalUnpaidCommission)}</p>
                        </div>
                    </CardHeader>
                    <CardFooter>
                         <Button className="w-full sm:w-auto ml-auto" onClick={handleConfirmPayout} disabled={totalUnpaidCommission <= 0}>
                            <Check className="mr-2 h-4 w-4" />
                            Confirm and Record Payout
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Unpaid Commission Breakdown</CardTitle>
                        <CardDescription>A list of all sales and events contributing to the unpaid balance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <DataTable
                            columns={commissionBreakdownColumns(staffMember.currency || 'UGX')}
                            data={unpaidCommissionableOrders}
                            isLoading={isLoading}
                            emptyState={{
                                icon: DollarSign,
                                title: 'No Unpaid Commissions',
                                description: "This member has no pending commissions to be paid out.",
                            }}
                         />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Payout History</CardTitle>
                        <CardDescription>A record of all past payouts made to {staffMember.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={payoutHistoryColumns}
                            data={staffMember.payoutHistory || []}
                            isLoading={isLoading}
                            emptyState={{
                                icon: FileText,
                                title: 'No Payout History',
                                description: "No payouts have been recorded for this member yet.",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardPageLayout>
    )
}
