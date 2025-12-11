
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { updatePurchaseOrder } from '@/services/procurement';
import type { PurchaseOrder, PurchaseOrderItem, OnboardingFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Edit, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface PurchaseOrderResponseFormProps {
    initialOrder: PurchaseOrder;
    settings: OnboardingFormData;
}

export function PurchaseOrderResponseForm({ initialOrder, settings }: PurchaseOrderResponseFormProps) {
    const [order, setOrder] = useState<PurchaseOrder>(initialOrder);
    const [editedItems, setEditedItems] = useState<PurchaseOrderItem[]>(initialOrder.items);
    const [supplierETA, setSupplierETA] = useState<Date | undefined>(
        initialOrder.supplierETA ? new Date(initialOrder.supplierETA) : undefined
    );
    const [supplierNotes, setSupplierNotes] = useState(initialOrder.supplierNotes || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [actionTaken, setActionTaken] = useState<'Accepted' | 'Rejected' | 'Changes Proposed' | null>(null);
    const { toast } = useToast();

    const handleItemChange = (index: number, field: 'quantity' | 'cost', value: string) => {
        const newItems = [...editedItems];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setEditedItems(newItems);
    }
    
    const totalCost = editedItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

    const handleAction = async (status: 'Accepted' | 'Rejected' | 'Changes Proposed') => {
        if (!order) return;
        setIsLoading(true);
        
        let updates: Partial<PurchaseOrder> = { status: status === 'Changes Proposed' ? 'Awaiting Approval' : status === 'Accepted' ? 'Approved' : 'Cancelled' };

        if (status === 'Changes Proposed') {
            updates.supplierProposedChanges = { items: editedItems };
            updates.supplierETA = supplierETA?.toISOString();
            updates.supplierNotes = supplierNotes;
        }

        await updatePurchaseOrder(order.id, updates);
        setActionTaken(status);
        setIsSubmitted(true);
        setIsLoading(false);
        toast({ title: 'Response Submitted', description: 'Your response has been sent to the merchant.' });
    };
    
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }
    
    if (isSubmitted) {
         return (
            <div className="flex items-center justify-center min-h-screen bg-muted">
                <Card className="w-full max-w-md m-4 text-center">
                    <CardHeader>
                        <CardTitle>Thank You!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Your response of <span className="font-bold">{actionTaken}</span> for Purchase Order #{order.id} has been recorded.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                         {settings.logoUrl && (
                            <Image src={settings.logoUrl} alt={settings.businessName} width={64} height={64} className="rounded-md object-contain" />
                         )}
                         <div>
                            <h1 className="text-2xl font-bold">{settings.businessName}</h1>
                            <p className="text-sm text-muted-foreground">{settings.delivery.address}</p>
                         </div>
                    </div>
                     <div className="text-right">
                        <p className="text-xs text-muted-foreground">Powered by</p>
                        <p className="font-bold text-lg text-primary">Paynze</p>
                     </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl">Purchase Order #{order.id}</CardTitle>
                        <CardDescription>
                            From: {settings.businessName} | Dated: {format(new Date(order.orderDate), 'PPP')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <Edit className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                            Please review the purchase order. You can edit quantities and costs, then propose changes or accept as is.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="mt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {editedItems.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="w-20"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    value={item.cost}
                                                    onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                                                    className="w-28"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.cost * item.quantity, order.currency)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end mt-4 font-bold text-lg">
                            Grand Total: {formatCurrency(totalCost, order.currency)}
                        </div>
                        
                        <div className="space-y-4 pt-6 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="eta" className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4"/>
                                    Estimated Delivery Date (ETA)
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full md:w-[280px] justify-start text-left font-normal", !supplierETA && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {supplierETA ? format(supplierETA, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={supplierETA} onSelect={setSupplierETA} /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4"/>
                                    Comments or Notes
                                </Label>
                                <Textarea id="notes" value={supplierNotes} onChange={(e) => setSupplierNotes(e.target.value)} placeholder="Add any comments about stock availability, delivery, etc." />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="destructive" size="lg" onClick={() => handleAction('Rejected')} disabled={isLoading}>
                            <X className="mr-2 h-4 w-4" />
                            Reject Order
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => handleAction('Changes Proposed')} disabled={isLoading}>
                            <Edit className="mr-2 h-4 w-4" />
                            Propose Changes
                        </Button>
                        <Button size="lg" onClick={() => handleAction('Accepted')} disabled={isLoading}>
                            <Check className="mr-2 h-4 w-4" />
                            Accept As Is
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
