
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAffiliateById } from '@/services/affiliates';
import type { Affiliate, Order, AffiliateProgramSettings } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, DollarSign, Link as LinkIcon, BarChart, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getOrdersByAffiliate } from '@/services/orders';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AffiliateDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [settings, setSettings] = useState<{ subdomain: string, currency: string } | null>(null);
    const [affiliateSettings, setAffiliateSettings] = useState<AffiliateProgramSettings | null>(null);
    const [referredOrders, setReferredOrders] = useState<Order[]>([]);

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            const [affData, ordersData] = await Promise.all([
                getAffiliateById(id),
                getOrdersByAffiliate(id)
            ]);
            setAffiliate(affData || null);
            setReferredOrders(ordersData);

            const storedSettings = localStorage.getItem('onboardingData');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
             const affSettingsData = localStorage.getItem('affiliateSettings');
            if (affSettingsData) {
                setAffiliateSettings(JSON.parse(affSettingsData));
            }
        }
        loadData();
    }, [id]);

    if (!affiliate || !settings) {
        return <div>Loading...</div>; // Or a skeleton loader
    }

    const referralLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/?ref=${affiliate.uniqueId}`;
    const currency = settings?.currency || 'UGX';
    const conversionRate = affiliate.linkClicks > 0 ? ((affiliate.conversions / affiliate.linkClicks) * 100).toFixed(2) : '0.00';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    const calculateCommission = (orderTotal: number) => {
        if (!affiliateSettings) return 0;
        if (affiliateSettings.commissionType === 'Percentage') {
            return orderTotal * (affiliateSettings.commissionRate / 100);
        }
        return affiliateSettings.commissionRate;
    }

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast({ title: "Referral Link Copied!" });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/marketing?tab=affiliates">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">
                    {affiliate.name}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Referral Link</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-lg items-center space-x-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input readOnly value={referralLink} className="pl-10" />
                        </div>
                        <Button onClick={copyReferralLink}><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Unpaid Commission</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(affiliate.pendingCommission)}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{affiliate.linkClicks}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{affiliate.conversions}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Referred Sales</CardTitle>
                    <CardDescription>A list of completed sales referred by {affiliate.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Sale Amount</TableHead>
                                <TableHead className="text-right">Commission Earned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referredOrders.length > 0 ? (
                                referredOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono">{order.id}</TableCell>
                                        <TableCell>{format(new Date(order.date), 'PPP')}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                        <TableCell className="text-right font-semibold text-primary">{formatCurrency(calculateCommission(order.total))}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No referred sales found yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
