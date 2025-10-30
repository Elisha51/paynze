

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Copy, Users, Link as LinkIcon, UserPlus } from 'lucide-react';
import type { OnboardingFormData, Affiliate, AffiliateProgramSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';

const mockAffiliates: Affiliate[] = [
    { id: 'aff-001', name: 'Fatuma Asha', status: 'Active', contact: '07..', uniqueId: 'FATUMA123', linkClicks: 1204, conversions: 82, totalSales: 4500000, pendingCommission: 225000, paidCommission: 980000 },
    { id: 'aff-002', name: 'David Odhiambo', status: 'Active', contact: '07..', uniqueId: 'DAVIDO', linkClicks: 850, conversions: 45, totalSales: 2800000, pendingCommission: 140000, paidCommission: 550000 },
    { id: 'aff-003', name: 'Brenda Wanjiku', status: 'Pending', contact: '07..', uniqueId: 'BRENDA24', linkClicks: 50, conversions: 2, totalSales: 150000, pendingCommission: 7500, paidCommission: 0 },
];

const getAffiliateColumns = (currency: string): ColumnDef<Affiliate>[] => [
    {
        accessorKey: 'name',
        header: 'Affiliate',
        cell: ({ row }) => (
            <div>
                <p className="font-medium">{row.original.name}</p>
                <p className="text-xs text-muted-foreground">{row.original.uniqueId}</p>
            </div>
        )
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge>
    },
    {
        accessorKey: 'linkClicks',
        header: 'Clicks',
    },
    {
        accessorKey: 'conversions',
        header: 'Sales',
        cell: ({ row }) => (
            <div>
                <p>{row.original.conversions}</p>
                <p className="text-xs text-muted-foreground">{((row.original.conversions / row.original.linkClicks) * 100).toFixed(1)}%</p>
            </div>
        )
    },
    {
        accessorKey: 'pendingCommission',
        header: 'Pending Commission',
        cell: ({ row }) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(row.original.pendingCommission)
    },
    {
        accessorKey: 'totalSales',
        header: 'Total Sales',
        cell: ({ row }) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(row.original.totalSales)
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const canPayout = row.original.pendingCommission > 0 && row.original.status === 'Active';
            return (
                <div className="text-right">
                    <Button disabled={!canPayout}><DollarSign className="mr-2 h-4 w-4" />Payout</Button>
                </div>
            )
        }
    }
];

export function AffiliatesTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [affiliateSettings, setAffiliateSettings] = useState<AffiliateProgramSettings>({
        programStatus: 'Inactive',
        commissionType: 'Percentage',
        commissionRate: 10,
        payoutThreshold: 50000,
        cookieDuration: 30,
    });
    const [affiliates, setAffiliates] = useState<Affiliate[]>(mockAffiliates);
    const affiliateColumns = getAffiliateColumns(settings?.currency || 'UGX');
    const signupLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/affiliate-signup`;

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        // In real app, you'd fetch affiliate settings from a service
    }, []);

    const handleSettingChange = (field: keyof AffiliateProgramSettings, value: any) => {
        setAffiliateSettings(prev => ({...prev, [field]: value}));
    };

    const handleSaveSettings = () => {
        // Mock save
        toast({ title: "Settings Saved", description: "Your affiliate program settings have been updated." });
    };

    const copySignupLink = () => {
        navigator.clipboard.writeText(signupLink);
        toast({ title: "Link Copied!", description: "The sign-up link has been copied to your clipboard." });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Affiliate Program Status</CardTitle>
                            <CardDescription>Enable or disable your entire affiliate program.</CardDescription>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch 
                                id="programStatus" 
                                checked={affiliateSettings.programStatus === 'Active'}
                                onCheckedChange={(checked) => handleSettingChange('programStatus', checked ? 'Active' : 'Inactive')}
                            />
                            <Label htmlFor="programStatus" className={affiliateSettings.programStatus === 'Active' ? 'text-green-600' : 'text-red-600'}>
                                {affiliateSettings.programStatus}
                            </Label>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Commission & Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>Commission Type & Rate</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={affiliateSettings.commissionType}
                                    onValueChange={(v) => handleSettingChange('commissionType', v)}
                                >
                                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Percentage">Percentage</SelectItem>
                                        <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    type="number" 
                                    value={affiliateSettings.commissionRate}
                                    onChange={(e) => handleSettingChange('commissionRate', Number(e.target.value))}
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cookieDuration">Cookie Duration</Label>
                            <Select
                                value={String(affiliateSettings.cookieDuration)}
                                onValueChange={(v) => handleSettingChange('cookieDuration', Number(v))}
                            >
                                <SelectTrigger id="cookieDuration"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 Days</SelectItem>
                                    <SelectItem value="30">30 Days (Recommended)</SelectItem>
                                    <SelectItem value="60">60 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payout Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="payoutThreshold">Minimum Payout Threshold ({settings?.currency})</Label>
                            <Input 
                                id="payoutThreshold" 
                                type="number"
                                value={affiliateSettings.payoutThreshold}
                                onChange={(e) => handleSettingChange('payoutThreshold', Number(e.target.value))}
                            />
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button onClick={handleSaveSettings}>Save Settings</Button>
                    </CardFooter>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Onboard Your Affiliates</CardTitle>
                    <CardDescription>Share this unique link to allow marketers and influencers to sign up for your program.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-lg items-center space-x-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input readOnly value={signupLink} className="pl-10" />
                        </div>
                        <Button onClick={copySignupLink}><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Your Affiliates</CardTitle>
                    <CardDescription>Manage, track, and pay your registered affiliates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={affiliateColumns} 
                        data={affiliates} 
                        emptyState={{
                            icon: UserPlus,
                            title: "No Affiliates Yet",
                            description: "Share your sign-up link to start building your affiliate network.",
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
