

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, BarChart, ShoppingCart, DollarSign, Copy, Link as LinkIcon, MoreVertical, CheckCircle, XCircle, Ban, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import type { Affiliate, OnboardingFormData } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { getAffiliateById, updateAffiliate } from '@/services/affiliates';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

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

export default function ViewAffiliatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const id = params.id as string;
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [dialogAction, setDialogAction] = useState<'reject' | 'deactivate' | 'suspend' | null>(null);

  const canEdit = user?.permissions.marketing?.edit;

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const fetchedAffiliate = await getAffiliateById(id);
    setAffiliate(fetchedAffiliate || null);
    setLoading(false);
  }

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: Affiliate['status']) => {
    if (!affiliate) return;
    try {
        const updatedAffiliate = await updateAffiliate(id, { status: newStatus });
        setAffiliate(updatedAffiliate);
        toast({ title: `Affiliate ${newStatus}!` });
    } catch (error) {
        toast({ variant: 'destructive', title: "Action Failed" });
    }
  };
  
  const handleDialogConfirm = () => {
      if (!dialogAction) return;
      
      const statusMap = {
          reject: 'Rejected',
          deactivate: 'Deactivated',
          suspend: 'Suspended',
      };
      
      handleStatusChange(statusMap[dialogAction] as Affiliate['status']);
      setDialogAction(null);
  }

  const handleBack = () => {
    router.push('/dashboard/marketing?tab=affiliates');
  }

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Affiliate not found</h1>
            <p className="text-muted-foreground">The affiliate you are looking for does not exist.</p>
            <Button onClick={handleBack} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Affiliates</Button>
        </div>
    );
  }

  const referralLink = `https://${settings?.subdomain || 'your-store'}.paynze.app/?ref=${affiliate.uniqueId}`;
  const conversionRate = affiliate.linkClicks > 0 ? ((affiliate.conversions / affiliate.linkClicks) * 100).toFixed(1) : '0.0';

  const copyReferralLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast({ title: "Referral Link Copied!" });
    }
    
  const getDialogDescription = () => {
    switch (dialogAction) {
        case 'reject': return `This will reject the affiliate "${affiliate.name}". Their application will be denied.`;
        case 'suspend': return `This will suspend the affiliate "${affiliate.name}". Their link will be temporarily disabled.`;
        case 'deactivate': return `This will deactivate the affiliate "${affiliate.name}". Their account will be disabled permanently.`;
        default: return "Please confirm this action.";
    }
  }

  const renderActions = () => {
    if (!canEdit) return null;

    if (affiliate.status === 'Pending') {
        return (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('Active')}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => {setDialogAction('reject'); e.preventDefault()}} className="text-destructive focus:text-destructive">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </>
        )
    }

    if (affiliate.status === 'Active') {
        return (
            <>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => {setDialogAction('suspend'); e.preventDefault()}} className="text-orange-600 focus:text-orange-600">
                        <Ban className="mr-2 h-4 w-4" /> Suspend
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => {setDialogAction('deactivate'); e.preventDefault()}} className="text-destructive focus:text-destructive">
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
    }

    if (['Suspended', 'Rejected', 'Deactivated'].includes(affiliate.status)) {
        return (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('Active')}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Re-activate
                </DropdownMenuItem>
            </>
        );
    }
    return null;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{affiliate.name}</h1>
           {getStatusBadge(affiliate.status)}
        </div>
        <div className="ml-auto">
             <AlertDialog onOpenChange={() => setDialogAction(null)}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {renderActions()}
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           {getDialogDescription()}
                        </AlertDialogDescription>
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
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-2xl font-bold">{affiliate.linkClicks.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Sales</p>
                        <p className="text-2xl font-bold">{affiliate.conversions}</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{conversionRate}%</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold">{formatCurrency(affiliate.totalSales)}</p>
                    </div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Payout History</CardTitle>
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
                                affiliate.payoutHistory.map((payout, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{format(new Date(payout.date), 'PPP')}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(payout.amount)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center h-24">No payouts have been made yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Referral Link</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input readOnly value={referralLink} className="pl-10" />
                        </div>
                        <Button size="sm" onClick={copyReferralLink}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Commissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground flex items-center gap-2">Pending Commission</span>
                        <span className="text-lg">{formatCurrency(affiliate.pendingCommission)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">Total Paid</span>
                        <span>{formatCurrency(affiliate.paidCommission)}</span>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/dashboard/finances/payouts/${affiliate.id}`}>Review & Pay</Link>
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        <span className="font-semibold">Payout Contact:</span> {affiliate.contact}
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
