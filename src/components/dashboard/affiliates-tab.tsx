
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Link as LinkIcon, UserPlus, MoreHorizontal, Edit, ArrowUpDown } from 'lucide-react';
import type { OnboardingFormData, Affiliate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { getAffiliates, updateAffiliate } from '@/services/affiliates';

const affiliateStatuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
];


const getAffiliateColumns = (canEdit: boolean, handleApprove: (id: string) => void): ColumnDef<Affiliate>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Affiliate
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
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
        cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'linkClicks',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Clicks
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: 'conversions',
        header: ({ column }) => (
             <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Sales
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div>
                <p>{row.original.conversions}</p>
                <p className="text-xs text-muted-foreground">
                    {row.original.linkClicks > 0 ? `${((row.original.conversions / row.original.linkClicks) * 100).toFixed(1)}%` : '0.0%'}
                </p>
            </div>
        )
    },
    {
        accessorKey: 'pendingCommission',
        header: ({ column }) => (
            <div className="text-right">
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Unpaid Commission
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            // In a real app, currency would be dynamic
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(row.original.pendingCommission)
        }
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const affiliate = row.original;
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {affiliate.status === 'Pending' && canEdit && (
                                <DropdownMenuItem onClick={() => handleApprove(affiliate.id)}>Approve</DropdownMenuItem>
                            )}
                            {affiliate.status === 'Active' && canEdit && (
                                 <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/finances/payouts/${affiliate.id}`}>
                                        <Edit className="mr-2 h-4 w-4" /> Review & Payout
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
];

export function AffiliatesTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const signupLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/affiliate-signup`;
    const { user } = useAuth();
    const canEdit = user?.permissions.marketing?.edit;

    const handleApproveAffiliate = async (id: string) => {
        try {
            await updateAffiliate(id, { status: 'Active' });
            setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: 'Active' } : a));
            toast({ title: "Affiliate Approved!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Approval Failed" });
        }
    };
    
    const affiliateColumns = getAffiliateColumns(!!canEdit, handleApproveAffiliate);

    
    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        async function loadAffiliates() {
            const data = await getAffiliates();
            setAffiliates(data);
        }
        loadAffiliates();
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
                    <CardDescription>Manage, track, and approve your registered affiliates. Payouts are handled in the Finances tab.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={affiliateColumns} 
                        data={affiliates} 
                        filters={[{
                            columnId: 'status',
                            title: 'Status',
                            options: affiliateStatuses
                        }]}
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
