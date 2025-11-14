
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPurchaseOrderById, updatePurchaseOrder } from '@/services/procurement';
import type { PurchaseOrder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function PurchaseOrderResponsePage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [actionTaken, setActionTaken] = useState<'Accepted' | 'Rejected' | null>(null);

    useEffect(() => {
        async function loadOrder() {
            if (!id) return;
            const fetchedOrder = await getPurchaseOrderById(id);
            setOrder(fetchedOrder || null);
            setIsLoading(false);
        }
        loadOrder();
    }, [id]);

    const handleAction = async (status: 'Accepted' | 'Rejected') => {
        if (!order) return;
        setIsLoading(true);
        await updatePurchaseOrder(order.id, { status });
        setActionTaken(status);
        setIsSubmitted(true);
        setIsLoading(false);
    };
    
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted">
                <Card className="w-full max-w-4xl m-4">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted">
                <Card className="w-full max-w-md m-4 text-center">
                    <CardHeader>
                        <CardTitle>Purchase Order Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The link may have expired or the order was cancelled.</p>
                    </CardContent>
                </Card>
            </div>
        );
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
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Purchase Order #{order.id}</CardTitle>
                    <CardDescription>
                        From: {order.supplierName} | Dated: {order.orderDate}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Send className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>
                            Please review the purchase order below and either accept or reject it.
                        </AlertDescription>
                    </Alert>
                    
                     <div className="mt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Product</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Cost</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{formatCurrency(item.cost, order.currency)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.cost * item.quantity, order.currency)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end mt-4 font-bold text-lg">
                        Grand Total: {formatCurrency(order.totalCost, order.currency)}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="destructive" size="lg" onClick={() => handleAction('Rejected')}>
                        <X className="mr-2 h-4 w-4" />
                        Reject Order
                    </Button>
                    <Button size="lg" onClick={() => handleAction('Accepted')}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept Order
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

