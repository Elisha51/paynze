

'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Copy, DollarSign, Link as LinkIcon, BarChart, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Affiliate, OnboardingFormData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

// Mock data for a logged-in affiliate
const mockAffiliateData: Affiliate = { id: 'aff-001', name: 'Fatuma Asha', status: 'Active', contact: '0772123456', uniqueId: 'FATUMA123', linkClicks: 1204, conversions: 82, totalSales: 4500000, pendingCommission: 225000, paidCommission: 980000 };
const mockPayouts = [
    { date: '2024-07-01', amount: 500000 },
    { date: '2024-06-01', amount: 480000 },
];

export default function AffiliateDashboardPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const affiliate = mockAffiliateData; // In a real app, this would be fetched based on auth

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const referralLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/?ref=${affiliate.uniqueId}`;
    const currency = settings?.currency || 'UGX';
    const conversionRate = affiliate.linkClicks > 0 ? ((affiliate.conversions / affiliate.linkClicks) * 100).toFixed(2) : '0.00';
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast({ title: "Referral Link Copied!" });
    }

    if (affiliate.status === 'Pending') {
        return (
            <AuthLayout>
                <Card className="mx-auto max-w-sm text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Application Pending</CardTitle>
                        <CardDescription>
                            Your application is being reviewed. You will have access to your dashboard once approved.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </AuthLayout>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <h1 className="text-xl font-bold font-headline">Affiliate Dashboard</h1>
                    <nav className="ml-auto">
                        <Button variant="ghost">Log Out</Button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                 <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Referral Link</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex w-full items-center space-x-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input readOnly value={referralLink} className="pl-10" />
                                </div>
                                <Button onClick={copyReferralLink}><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(affiliate.pendingCommission)}</div>
                                <p className="text-xs text-muted-foreground">Available for next payout</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{affiliate.linkClicks}</div>
                                <p className="text-xs text-muted-foreground">Total clicks on your link</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{affiliate.conversions}</div>
                                <p className="text-xs text-muted-foreground">{conversionRate}% conversion rate</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
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
                                    {mockPayouts.map(payout => (
                                        <TableRow key={payout.date}>
                                            <TableCell>{payout.date}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(payout.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    );
}
