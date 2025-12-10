

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, CheckCircle, Send, AlertTriangle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { getPurchaseOrderById, receivePurchaseOrder, updatePurchaseOrder } from '@/services/procurement';
import { addTransaction } from '@/services/finances';
import { getLocations } from '@/services/locations';
import type { PurchaseOrder, OnboardingFormData, Location } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as TableFooterComponent
} from "@/components/ui/table"
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter as DialogFooterComponent,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

function ReceiveStockDialog({ order, locations, onConfirm }: { order: PurchaseOrder, locations: Location[], onConfirm: (locationName: string) => void }) {
    const [location, setLocation] = useState<string>('');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={order.status === 'Received'}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {order.status === 'Received' ? 'Already Received' : 'Mark as Received'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Receive Stock for PO #{order.id}</DialogTitle>
                    <DialogDescription>
                        Select the location where you are receiving this inventory. This will update the stock levels for all items in this purchase order.
                    </DialogDescription>
                </DialogHeader>
                 <div className="py-4 space-y-2">
                    <Label htmlFor="location">Receiving Location</Label>
                    <Select onValueChange={setLocation}>
                        <SelectTrigger id="location">
                            <SelectValue placeholder="Select a location..." />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map(loc => (
                                <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooterComponent>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild>
                        <Button onClick={() => onConfirm(location)} disabled={!location}>Confirm & Add to Inventory</Button>
                    </DialogClose>
                </DialogFooterComponent>
            </DialogContent>
        </Dialog>
    )
}

function SupplierChangesCard({ order, onApprove }: { order: PurchaseOrder; onApprove: () => void }) {
    const changes = order.supplierProposedChanges;
    if (!changes) return null;

    const originalTotal = order.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const proposedTotal = changes.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    return (
        <Card className="border-amber-400 bg-amber-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="text-amber-600" />
                    Supplier Proposed Changes
                </CardTitle>
                <CardDescription>The supplier has proposed changes to this order. Review them below and approve or reject.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {order.supplierNotes && (
                    <blockquote className="border-l-2 pl-4 italic text-sm">"{order.supplierNotes}"</blockquote>
                )}
                {order.supplierETA && (
                    <p className="text-sm"><strong>New ETA:</strong> {format(new Date(order.supplierETA), 'PPP')}</p>
                )}
                <Table>
                     <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Original</TableHead>
                            <TableHead>Proposed</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {changes.items.map(proposedItem => {
                            const originalItem = order.items.find(i => i.productId === proposedItem.productId);
                            return (
                                <TableRow key={proposedItem.productId}>
                                    <TableCell className="font-medium">{proposedItem.productName}</TableCell>
                                    <TableCell>
                                        <p>{originalItem?.quantity || 'N/A'} @ {formatCurrency(originalItem?.cost || 0, order.currency)}</p>
                                    </TableCell>
                                     <TableCell>
                                        <p className="font-semibold text-amber-700">{proposedItem.quantity} @ {formatCurrency(proposedItem.cost, order.currency)}</p>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                     <TableFooterComponent>
                        <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell>{formatCurrency(originalTotal, order.currency)}</TableCell>
                            <TableCell className="font-bold text-amber-700">{formatCurrency(proposedTotal, order.currency)}</TableCell>
                        </TableRow>
                    </TableFooterComponent>
                </Table>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost">Reject Changes</Button>
                <Button onClick={onApprove}>Approve & Update PO</Button>
            </CardFooter>
        </Card>
    )
}

export default function ViewPurchaseOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const { toast } = useToast();

  const loadData = async (orderId: string) => {
      setLoading(true);
      const [data, settingsData, locs] = await Promise.all([
          getPurchaseOrderById(orderId),
          localStorage.getItem('onboardingData'),
          getLocations()
      ]);
      setOrder(data || null);
      if (settingsData) {
          setSettings(JSON.parse(settingsData));
      }
      setLocations(locs);
      setLoading(false);
  }

  useEffect(() => {
    if (id) {
        loadData(id);
    }
  }, [id]);
  
  const handleReceiveStock = async (locationName: string) => {
    if (!order) return;
    try {
        const updatedOrder = await receivePurchaseOrder(order.id, locationName);
        setOrder(updatedOrder);
        toast({
            title: 'Stock Received!',
            description: `Inventory levels have been updated at ${locationName}.`
        });
    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Failed to Receive Stock',
            description: 'There was an error updating your inventory. Please try again.'
        });
    }
  }
  
  const handleMarkAsPaid = async () => {
    if (!order) return;
    try {
        await addTransaction({
            date: new Date().toISOString(),
            description: `Payment for Purchase Order #${order.id}`,
            amount: -order.totalCost,
            currency: order.currency,
            type: 'Expense',
            category: 'Inventory',
            status: 'Cleared',
            paymentMethod: 'Bank Transfer' // Assumption for mock
        });

        const updatedOrder = await updatePurchaseOrder(order.id, { status: 'Paid' });
        setOrder(updatedOrder);
        toast({
            title: 'PO Marked as Paid',
            description: `An expense of ${formatCurrency(order.totalCost, order.currency)} has been recorded.`
        });

    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Failed to Mark as Paid',
            description: 'There was an error creating the expense transaction.'
        });
    }
  }

  const handleApproveChanges = async () => {
    if (!order || !order.supplierProposedChanges) return;
    const updatedOrder = await updatePurchaseOrder(order.id, {
        items: order.supplierProposedChanges.items,
        totalCost: order.supplierProposedChanges.items.reduce((sum, item) => sum + item.cost * item.quantity, 0),
        expectedDelivery: order.supplierETA || order.expectedDelivery,
        status: 'Accepted',
        supplierProposedChanges: undefined, // Clear the proposed changes
    });
    setOrder(updatedOrder);
    toast({ title: 'Changes Approved', description: 'The purchase order has been updated.' });
  }

  if (loading || !settings) {
    return (
     <DashboardPageLayout title="Loading Purchase Order...">
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-80 w-full" />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            </div>
        </div>
      </DashboardPageLayout>
    );
  }


  if (!order) {
    return (
       <DashboardPageLayout title="Error">
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">Purchase Order not found</h1>
                <p className="text-muted-foreground">The PO you are looking for does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/procurement">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Procurement
                    </Link>
                </Button>
            </div>
       </DashboardPageLayout>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const statusVariant = {
      Draft: 'secondary',
      Sent: 'outline',
      Accepted: 'default',
      Rejected: 'destructive',
      Paid: 'default',
      Received: 'default',
      Partial: 'outline',
      Cancelled: 'destructive',
      'Awaiting Approval': 'outline'
  }[order.status] as "secondary" | "default" | "outline" | "destructive" | null;
  
  const currency = order.currency || settings.currency;
  
  const cta = (
    <div className="flex items-center gap-2">
        {order.status === 'Sent' && (
            <Button size="sm" onClick={handleMarkAsPaid}>
                <DollarSign className="mr-2 h-4 w-4" />
                Mark as Paid
            </Button>
        )}
        <ReceiveStockDialog order={order} locations={locations} onConfirm={handleReceiveStock} />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                    <Link href={`/supplier/po-response/${order.id}`} target="_blank">
                        <Send className="mr-2 h-4 w-4" />
                        Send to Supplier
                    </Link>
                 </DropdownMenuItem>
                <DropdownMenuItem>Edit PO</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Cancel PO</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );

  return (
    <DashboardPageLayout title={`Purchase Order #${order.id}`} cta={cta} backHref="/dashboard/procurement?tab=purchase-orders">
      {order.status === 'Awaiting Approval' && <SupplierChangesCard order={order} onApprove={handleApproveChanges} />}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", order.status === 'Awaiting Approval' && 'mt-6')}>
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Cost per Item</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.cost, currency)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.cost * item.quantity, currency)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooterComponent>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-semibold text-lg">Grand Total</TableCell>
                                <TableCell className="text-right font-bold text-lg">{formatCurrency(order.totalCost, currency)}</TableCell>
                            </TableRow>
                        </TableFooterComponent>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/dashboard/procurement/suppliers/${order.supplierId}`} className="font-medium text-primary hover:underline">
                        {order.supplierName}
                    </Link>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date</span>
                        <span>{order.orderDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Delivery</span>
                        <span>{order.expectedDelivery}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariant}>{order.status}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
