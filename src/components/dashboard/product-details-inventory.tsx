
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Product, InventoryItem, StockAdjustment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

function InventoryStatusBadge({ status }: { status: InventoryItem['status'] }) {
    const variant = {
        Available: 'default',
        Sold: 'secondary',
        Reserved: 'outline',
        Damaged: 'destructive',
        Returned: 'outline',
    }[status] as 'default' | 'secondary' | 'outline' | 'destructive';
    
    const color = {
        Returned: 'text-blue-600 border-blue-600',
        Reserved: 'text-orange-600 border-orange-600'
    }[status]

    return <Badge variant={variant} className={cn(color)}>{status}</Badge>
}

const adjustmentTypeColors = {
    'Initial Stock': 'text-blue-600',
    'Sale': 'text-red-600',
    'Return': 'text-green-600',
    'Manual Adjustment': 'text-purple-600',
    'Damage': 'text-yellow-600',
};

function StockAdjustmentRow({ adjustment }: { adjustment: StockAdjustment }) {
    const quantityColor = adjustment.quantity > 0 ? 'text-green-600' : 'text-red-600';
    const quantitySign = adjustment.quantity > 0 ? '+' : '';

    return (
        <TableRow>
            <TableCell>{new Date(adjustment.date).toLocaleDateString()}</TableCell>
            <TableCell>
                <span className={cn('font-medium', adjustmentTypeColors[adjustment.type])}>
                    {adjustment.type}
                </span>
            </TableCell>
            <TableCell className={cn('font-mono font-medium', quantityColor)}>
                {quantitySign}{adjustment.quantity}
            </TableCell>
            <TableCell className="text-muted-foreground">{adjustment.reason || '–'}</TableCell>
        </TableRow>
    );
}


export function ProductDetailsInventory({ product }: { product: Product }) {
    const isSerialized = product.inventoryTracking === 'Track with Serial Numbers';

    if (product.inventoryTracking === "Don't Track") {
        return (
            <Card className="mt-4">
                <CardContent className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Inventory tracking is not enabled for this product.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        To manage stock, please edit the product and enable inventory tracking.
                    </p>
                </CardContent>
            </Card>
        );
    }
    
    // Aggregate inventory items and adjustments from all variants
    const allInventoryItems = product.variants.flatMap(v => 
        (v.inventoryItems || []).map(item => ({...item, variant: v}))
    );
    
    const allStockAdjustments = product.hasVariants 
        ? product.variants.flatMap(v => (v.stockAdjustments || []).map(adj => ({ ...adj, variant: v }))) 
        : product.variants[0]?.stockAdjustments || [];

    allStockAdjustments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalStock = product.variants.reduce((acc, v) => {
        acc.onHand += v.stock.onHand;
        acc.available += v.stock.available;
        acc.reserved += v.stock.reserved;
        acc.damaged += v.stock.damaged;
        return acc;
    }, { onHand: 0, available: 0, reserved: 0, damaged: 0 });

    return (
        <div className="mt-4 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Inventory Summary</CardTitle>
                    <CardDescription>Overall stock levels for "{product.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">On Hand</p>
                            <p className="text-2xl font-bold">{totalStock.onHand}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="text-2xl font-bold text-green-600">{totalStock.available}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Reserved</p>
                            <p className="text-2xl font-bold text-orange-600">{totalStock.reserved}</p>
                        </div>
                         <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Damaged</p>
                            <p className="text-2xl font-bold text-red-600">{totalStock.damaged}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isSerialized ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Serialized Items</CardTitle>
                        <CardDescription>Track each individual item by its serial number and status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Serial Number</TableHead>
                                    {product.hasVariants && <TableHead>Variant</TableHead>}
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allInventoryItems.length > 0 ? allInventoryItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono">{item.serialNumber || 'N/A'}</TableCell>
                                        {product.hasVariants && <TableCell>{item.variant ? Object.values(item.variant.optionValues).join(' / ') : 'Default'}</TableCell>}
                                        <TableCell><InventoryStatusBadge status={item.status} /></TableCell>
                                        <TableCell>{item.location || '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={product.hasVariants ? 4 : 3} className="text-center h-24">
                                            No serialized items for this product yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle>Stock History</CardTitle>
                        <CardDescription>A log of all inventory adjustments for this product.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    {product.hasVariants && <TableHead>Variant</TableHead>}
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allStockAdjustments.length > 0 ? allStockAdjustments.map(adj => {
                                   const variant = product.variants.find(v => v.stockAdjustments?.some(a => a.id === adj.id));
                                   return (
                                        <TableRow key={adj.id}>
                                            <TableCell>{new Date(adj.date).toLocaleDateString()}</TableCell>
                                            {product.hasVariants && <TableCell>{variant ? Object.values(variant.optionValues).join(' / ') : 'Default'}</TableCell>}
                                            <TableCell><span className={cn('font-medium', adjustmentTypeColors[adj.type])}>{adj.type}</span></TableCell>
                                            <TableCell className={cn('font-mono font-medium', adj.quantity > 0 ? 'text-green-600' : 'text-red-600')}>{adj.quantity > 0 ? '+' : ''}{adj.quantity}</TableCell>
                                            <TableCell className="text-muted-foreground">{adj.reason || '–'}</TableCell>
                                        </TableRow>
                                   )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={product.hasVariants ? 5 : 4} className="text-center h-24">
                                            No stock history available for this product.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

