
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getPurchaseOrderById, receivePurchaseOrder } from '@/services/procurement';
import { getLocations } from '@/services/locations';
import type { PurchaseOrder, OnboardingFormData, Location } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  TableFooter
} from "@/components/ui/table"
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild>
                        <Button onClick={() => onConfirm(location)} disabled={!location}>Confirm & Add to Inventory</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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

  const loadData = async () => {
      setLoading(true);
      const [data, settingsData, locs] = await Promise.all([
          getPurchaseOrderById(id),
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
        loadData();
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
      Received: 'default',
      Partial: 'outline',
      Cancelled: 'destructive',
  }[order.status] as "secondary" | "default" | "outline" | "destructive" | null;
  
  const currency = order.currency || settings.currency;
  
  const cta = (
    <div className="flex items-center gap-2">
        <ReceiveStockDialog order={order} locations={locations} onConfirm={handleReceiveStock} />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-semibold text-lg">Grand Total</TableCell>
                                <TableCell className="text-right font-bold text-lg">{formatCurrency(order.totalCost, currency)}</TableCell>
                            </TableRow>
                        </TableFooter>
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
