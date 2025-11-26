
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Link as LinkIcon, MoreHorizontal, ArrowUpDown, Info, XCircle, CheckCircle, RotateCcw, DollarSign, UserPlus, Ban } from 'lucide-react';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/auth-context';
import { getAffiliates, updateAffiliate } from '@/services/affiliates';
import { Checkbox } from '../ui/checkbox';

const affiliateStatuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Deactivated', label: 'Deactivated' },
];

const getStatusBadge = (status: Affiliate['status']) => {
    const colors: Partial<Record<Affiliate['status'], string>> = {
        Active: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100/80',
        Pending: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80',
        Suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100/80',
        Rejected: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80',
        Deactivated: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100/80',
    }
    return <Badge variant={'outline'} className={colors[status]}>{status}</Badge>;
}


const getAffiliateColumns = (canEdit: boolean, handleStatusChange: (id: string, status: Affiliate['status']) => void): ColumnDef<Affiliate>[] => [
    {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Affiliate
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <Link href={`/dashboard/marketing/affiliates/${row.original.id}`} className="hover:underline">
                <p className="font-medium">{row.original.name}</p>
                <p className="text-xs text-muted-foreground">{row.original.uniqueId}</p>
            </Link>
        )
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
        filterFn: (row, id, value) => {
            return (value as string[]).includes(row.getValue(id))
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
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            </div>
        ),
        cell: ({ row }) => {
            const currency = 'UGX'; // Simplified, in a real app this would be dynamic
            return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(row.original.pendingCommission)
        }
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const affiliate = row.original;
            const [dialogAction, setDialogAction] = useState<'reject' | 'deactivate' | 'suspend' | null>(null);

            const getDialogDescription = () => {
                switch(dialogAction) {
                    case 'reject': return `This will reject the affiliate "${affiliate.name}". Their application will be denied.`;
                    case 'suspend': return `This will suspend the affiliate "${affiliate.name}". Their link will be temporarily disabled.`;
                    case 'deactivate': return `This will deactivate the affiliate "${affiliate.name}". Their account will be disabled permanently.`;
                    default: return "Are you sure you want to proceed?";
                }
            }

            const handleDialogConfirm = () => {
                if (!dialogAction) return;
                const statusMap = {
                    reject: 'Rejected',
                    deactivate: 'Deactivated',
                    suspend: 'Suspended',
                };
                handleStatusChange(affiliate.id, statusMap[dialogAction] as Affiliate['status']);
                setDialogAction(null);
            };

            const renderActions = () => {
                if (!canEdit) return null;
                
                switch (affiliate.status) {
                    case 'Pending':
                        return (
                             <>
                                <DropdownMenuItem onClick={() => handleStatusChange(affiliate.id, 'Active')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDialogAction('reject'); }} className="text-destructive focus:text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </>
                        );
                    case 'Active':
                         return (
                            <>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDialogAction('suspend'); }} className="text-orange-600 focus:text-orange-600">
                                        <Ban className="mr-2 h-4 w-4" /> Suspend
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDialogAction('deactivate'); }} className="text-destructive focus:text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" /> Deactivate
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/finances/payouts/${affiliate.id}`}>
                                        <DollarSign className="mr-2 h-4 w-4" /> Review & Payout
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        );
                    case 'Suspended':
                    case 'Rejected':
                    case 'Deactivated':
                        return (
                            <DropdownMenuItem onClick={() => handleStatusChange(affiliate.id, 'Active')}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Re-activate
                            </DropdownMenuItem>
                        );
                    default:
                        return null;
                }
            };

            return (
                <div className="text-right">
                    <AlertDialog onOpenChange={() => setDialogAction(null)}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/marketing/affiliates/${affiliate.id}`}>
                                        <Info className="mr-2 h-4 w-4" /> View Details
                                    </Link>
                                </DropdownMenuItem>
                                {canEdit && <DropdownMenuSeparator />}
                                {renderActions()}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>{getDialogDescription()}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDialogConfirm} className={dialogAction === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-destructive hover:bg-destructive/90'}>
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
];

export function AffiliatesTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const signupLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/store/affiliate-signup`;
    const { user } = useAuth();
    const canEdit = user?.permissions.marketing?.edit;

    const handleStatusChange = async (id: string, status: Affiliate['status']) => {
        try {
            await updateAffiliate(id, { status });
            setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            toast({ title: `Affiliate ${status}!` });
        } catch (error) {
            toast({ variant: 'destructive', title: "Action Failed" });
        }
    };
    
    const affiliateColumns = getAffiliateColumns(!!canEdit, handleStatusChange);
    
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
                        isLoading={!affiliates}
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
