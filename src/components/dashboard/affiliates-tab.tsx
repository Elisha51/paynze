

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Copy, Users, Link as LinkIcon, UserPlus, CheckCircle } from 'lucide-react';
import type { OnboardingFormData, Affiliate, AffiliateProgramSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { getAffiliates, updateAffiliate } from '@/services/affiliates';

const getAffiliateColumns = (currency: string, onApprove: (id: string) => void): ColumnDef<Affiliate>[] => [
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
            const affiliate = row.original;
            const canPayout = affiliate.pendingCommission > 0 && affiliate.status === 'Active';
            const needsApproval = affiliate.status === 'Pending';

            if (needsApproval) {
                return (
                    <div className="text-right">
                        <Button size="sm" onClick={() => onApprove(affiliate.id)}><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>
                    </div>
                )
            }

            return (
                <div className="text-right">
                    <Button disabled={!canPayout} size="sm"><DollarSign className="mr-2 h-4 w-4" />Payout</Button>
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
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const signupLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/affiliate-signup`;
    
    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        // In real app, you'd fetch affiliate settings from a service
        async function loadAffiliates() {
            const fetchedAffiliates = await getAffiliates();
            setAffiliates(fetchedAffiliates);
        }
        loadAffiliates();
    }, []);

    const handleApproveAffiliate = async (id: string) => {
        const updated = await updateAffiliate(id, { status: 'Active' });
        setAffiliates(prev => prev.map(a => a.id === id ? updated : a));
        toast({ title: "Affiliate Approved", description: `${updated.name} is now an active affiliate.`});
    };
    
    const affiliateColumns = getAffiliateColumns(settings?.currency || 'UGX', handleApproveAffiliate);

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
