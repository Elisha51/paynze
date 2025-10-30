

'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Link as LinkIcon, UserPlus, CheckCircle, MoreHorizontal, DollarSign } from 'lucide-react';
import type { OnboardingFormData, Affiliate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { getAffiliates, updateAffiliate } from '@/services/affiliates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

const getAffiliateColumns = (onApprove: (id: string) => void): ColumnDef<Affiliate>[] => [
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
          const affiliate = row.original;
          const needsApproval = affiliate.status === 'Pending';

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
                          {needsApproval && (
                              <DropdownMenuItem onClick={() => onApprove(affiliate.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                              </DropdownMenuItem>
                          )}
                           <DropdownMenuItem asChild>
                                <Link href={`/dashboard/finances/payouts/${affiliate.id}`}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    View Payouts
                                </Link>
                            </DropdownMenuItem>
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
    
    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
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
    
    const affiliateColumns = getAffiliateColumns(handleApproveAffiliate);

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
