
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Copy, DollarSign, Link as LinkIcon, BarChart, ShoppingCart, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Affiliate, OnboardingFormData, Order, AffiliateProgramSettings, Notification } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getOrdersByAffiliate } from '@/services/orders';
import { format } from 'date-fns';
import { AffiliateHeader } from './_components/affiliate-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationList } from '@/components/shared/notification-list';
import { getAffiliateById } from '@/services/affiliates';
import { addNotification } from '@/services/notifications';

const mockInitialAffiliateNotifications: Notification[] = [
    { id: 'aff-notif-1', type: 'new-order', title: 'New Commission Earned!', description: 'You earned UGX 1,200 from order #ORD-008.', timestamp: new Date().toISOString(), read: false, link: '#', archived: false },
    { id: 'aff-notif-2', type: 'payout-sent', title: 'Payout Sent', description: 'A payout of UGX 980,000 has been sent to your account.', timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), read: true, link: '#', archived: false },
];


export default function AffiliateDashboardPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [affiliateSettings, setAffiliateSettings] = useState<AffiliateProgramSettings | null>(null);
    const [referredOrders, setReferredOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState(mockInitialAffiliateNotifications);
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [payoutRequested, setPayoutRequested] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        const affSettingsData = localStorage.getItem('affiliateSettings');
        if (affSettingsData) {
            setAffiliateSettings(JSON.parse(affSettingsData));
        }
        
        async function loadAffiliateData() {
            const affiliateId = localStorage.getItem('loggedInAffiliateId');
            if (affiliateId) {
                const affData = await getAffiliateById(affiliateId);
                setAffiliate(affData || null);
                if (affData) {
                    const orders = await getOrdersByAffiliate(affData.id);
                    setReferredOrders(orders.filter(o => o.payment.status === 'completed'));
                }
            }
        }
        loadAffiliateData();

    }, []);

    const referralLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/?ref=${affiliate?.uniqueId}`;
    const currency = settings?.currency || 'UGX';
    
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
    
    const handleRequestPayout = async () => {
        if (!affiliate) return;
        setPayoutRequested(true);
        await addNotification({
            type: 'payout-request',
            title: 'Affiliate Payout Request',
            description: `${affiliate.name} has requested a payout of ${formatCurrency(affiliate.pendingCommission)}.`,
            link: `/dashboard/finances/payouts/${affiliate.id}`,
        });
        toast({ title: "Payout Requested", description: "The store owner has been notified of your request." });
    }

    // Notification State Management
    const activeNotifications = useMemo(() => notifications.filter(n => !n.archived), [notifications]);
    const filteredNotifications = useMemo(() => {
        if (notificationFilter === 'unread') return activeNotifications.filter(n => !n.read);
        return activeNotifications;
    }, [activeNotifications, notificationFilter]);
    const unreadCount = useMemo(() => activeNotifications.filter(n => !n.read).length, [activeNotifications]);
    const markAsRead = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
    const markAllAsRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
    const archiveNotification = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n)), []);
    const archiveAllRead = useCallback(() => setNotifications(prev => prev.map(n => n.read ? { ...n, archived: true } : n)), []);


    if (!affiliate) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <Card className="mx-auto max-w-sm text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }
    
    if (affiliate.status === 'Pending') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="mx-auto max-w-sm text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Application Pending</CardTitle>
                        <CardDescription>
                            Your application is being reviewed. You will have access to your dashboard once approved.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const conversionRate = affiliate.linkClicks > 0 ? ((affiliate.conversions / affiliate.linkClicks) * 100).toFixed(2) : '0.00';
    const meetsPayoutThreshold = affiliate.pendingCommission >= (affiliateSettings?.payoutThreshold || 0);

    return (
        <div className="flex flex-col min-h-screen">
            <AffiliateHeader notificationCount={unreadCount} />
            <main className="flex-1 bg-muted/40 p-4 md:p-8">
                <Tabs defaultValue="dashboard" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 md:w-1/2 md:mx-auto">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="notifications">
                            Notifications {unreadCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-xs h-5 w-5 rounded-full flex items-center justify-center">{unreadCount}</span>}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="dashboard" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Referral Link</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <div className="relative flex-1">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input readOnly value={referralLink} className="pl-10" />
                                    </div>
                                    <Button onClick={copyReferralLink} className="w-full sm:w-auto"><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
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
                                <CardFooter>
                                    <Button 
                                        className="w-full" 
                                        disabled={!meetsPayoutThreshold || payoutRequested}
                                        onClick={handleRequestPayout}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {payoutRequested ? 'Request Sent' : 'Request Payout'}
                                    </Button>
                                </CardFooter>
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
                                <CardTitle>Your Referred Sales</CardTitle>
                                <CardDescription>A list of completed sales you have referred.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Date</TableHead>
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
                                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                                    <TableCell className="text-right font-semibold text-primary">{formatCurrency(calculateCommission(order.total))}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">No referred sales found yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

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
                                        {affiliate.payoutHistory && affiliate.payoutHistory.length > 0 ? (
                                            affiliate.payoutHistory.map((payout, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{format(new Date(payout.date), 'PPP')}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(payout.amount)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center">No payouts have been made yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="notifications" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Your Notifications</CardTitle>
                                <CardDescription>Updates on your referrals and payouts.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <NotificationList
                                    notifications={filteredNotifications}
                                    filter={notificationFilter}
                                    onFilterChange={setNotificationFilter}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                    onArchive={archiveNotification}
                                    onArchiveAllRead={archiveAllRead}
                                    unreadCount={unreadCount}
                                    isSheet={false}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

    