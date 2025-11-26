
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import type { Staff, OnboardingFormData } from '@/lib/types';
import { getStaff, updateStaff } from '@/services/staff';
import { useToast } from '@/hooks/use-toast';
import { addTransaction } from '@/services/finances';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function PayoutPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [staffData, settingsData] = await Promise.all([
                getStaff().then(all => all.find(s => s.id === id)),
                localStorage.getItem('onboardingData')
            ]);
            setStaffMember(staffData || null);
            if (settingsData) {
                setSettings(JSON.parse(settingsData));
            }
            setIsLoading(false);
        }
        loadData();
    }, [id]);

    const handleConfirmPayout = async () => {
        if (!staffMember || !staffMember.totalCommission) return;

        // 1. Create a payout record for the staff member
        const newPayout = {
            date: new Date().toISOString(),
            amount: staffMember.totalCommission,
            currency: staffMember.currency || 'UGX'
        };

        const updatedStaff: Staff = {
            ...staffMember,
            payoutHistory: [...(staffMember.payoutHistory || []), newPayout],
            paidCommission: (staffMember.paidCommission || 0) + staffMember.totalCommission,
            totalCommission: 0 // Reset pending commission
        };
        await updateStaff(updatedStaff.id, updatedStaff);

        // 2. Create a corresponding expense transaction in the finance ledger
        await addTransaction({
            date: new Date().toISOString(),
            description: `Payout to ${staffMember.name} for commission`,
            amount: -staffMember.totalCommission,
            currency: staffMember.currency || 'UGX',
            type: 'Expense',
            category: 'Salaries', // Or a dedicated 'Commissions' category
            status: 'Cleared',
            paymentMethod: 'Mobile Money' // Or ask for this
        });

        toast({
            title: 'Payout Successful',
            description: `A payment of ${formatCurrency(staffMember.totalCommission)} has been recorded for ${staffMember.name}.`
        });

        router.push('/dashboard/finances?tab=commissions');
    };
    
    const formatCurrency = (amount: number) => {
        const currencyCode = staffMember?.currency || settings?.currency || 'UGX';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
    };

    if (isLoading) {
        return (
            <DashboardPageLayout title="Confirm Payout">
                 <Skeleton className="h-[400px] w-full max-w-2xl" />
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
        <DashboardPageLayout title="Confirm Payout" backHref="/dashboard/finances?tab=commissions">
             <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Review & Confirm Payout</CardTitle>
                    <CardDescription>You are about to record a payout for the following staff member.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <p className="font-semibold text-lg">{staffMember.name}</p>
                            <p className="text-sm text-muted-foreground">{staffMember.role}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-muted-foreground">Unpaid Commission</p>
                             <p className="text-2xl font-bold text-primary">{formatCurrency(staffMember.totalCommission || 0)}</p>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <p className="text-sm font-medium">This action will:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Reset the unpaid commission for {staffMember.name} to zero.</li>
                            <li>Add this amount to their payout history.</li>
                            <li>Create a corresponding "Expense" transaction in your financial ledger.</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button className="w-full" onClick={handleConfirmPayout} disabled={(staffMember.totalCommission || 0) <= 0}>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm and Record Payout
                    </Button>
                </CardFooter>
             </Card>
        </DashboardPageLayout>
    )
}
