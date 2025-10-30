

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Link as LinkIcon, UserPlus } from 'lucide-react';
import type { OnboardingFormData, Affiliate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';

const affiliateColumns: ColumnDef<Affiliate>[] = [
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
        cell: ({ row }) => {
            // In a real app, currency would be dynamic
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(row.original.pendingCommission)
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const affiliate = row.original;
            return (
                <div className="flex gap-2">
                    {affiliate.status === 'Pending' && <Button size="sm">Approve</Button>}
                </div>
            )
        }
    }
];

export function AffiliatesTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const signupLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/affiliate-signup`;
    const mockAffiliates: Affiliate[] = [
        { id: 'aff-001', name: 'Fatuma Asha', status: 'Active', contact: '0772123456', uniqueId: 'FATUMA123', linkClicks: 1204, conversions: 82, totalSales: 4500000, pendingCommission: 225000, paidCommission: 980000 },
        { id: 'aff-002', name: 'David Odhiambo', status: 'Active', contact: '0712345678', uniqueId: 'DAVIDO', linkClicks: 850, conversions: 45, totalSales: 2800000, pendingCommission: 140000, paidCommission: 550000 },
        { id: 'aff-003', name: 'Brenda Wanjiku', status: 'Pending', contact: '0723456789', uniqueId: 'BRENDA24', linkClicks: 50, conversions: 2, totalSales: 150000, pendingCommission: 7500, paidCommission: 0 },
    ];
    
    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const copySignupLink = () => {
        navigator.clipboard.writeText(signupLink);
        toast({ title: "Link Copied!", description: "The sign-up link has been copied to your clipboard." });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Onboard Your Affiliates</CardTitle>
                    <CardDescription>Share this unique link to allow marketers and influencers to sign up for your program. Program settings can be configured in the main settings menu.</CardDescription>
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
                        data={mockAffiliates} 
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
