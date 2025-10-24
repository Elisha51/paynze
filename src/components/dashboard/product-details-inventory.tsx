
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
import type { Product, InventoryItem } from '@/lib/types';
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
        : (product.variants[0]?.stockAdjustments || []);

    allStockAdjustments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalStock = product.variants.reduce((acc, v) => {
        v.stockByLocation.forEach(locStock => {
            acc.onHand += locStock.stock.onHand;
            acc.available += locStock.stock.available;
            acc.reserved += locStock.stock.reserved;
            acc.damaged += locStock.stock.damaged;
        });
        return acc;
    }, { onHand: 0, available: 0, reserved: 0, damaged: 0 });

    const stockByLocation = product.variants.reduce((acc, v) => {
        const variantName = product.hasVariants ? Object.values(v.optionValues).join(' / ') : 'Default';
        v.stockByLocation.forEach(locStock => {
            if (!acc[locStock.locationName]) {
                acc[locStock.locationName] = [];
            }
            acc[locStock.locationName].push({
                variantName,
                ...locStock.stock
            });
        });
        return acc;
    }, {} as Record<string, { variantName: string; onHand: number; available: number; reserved: number; damaged: number; }[]>);


    return (
        <div className="mt-4 space-y-6">
             <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Inventory Summary</CardTitle>
                        <CardDescription>Overall stock levels for "{product.name}" across all locations.</CardDescription>
                    </div>
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

            <Card>
                <CardHeader>
                    <CardTitle>Stock by Location</CardTitle>
                    <CardDescription>View inventory levels for each warehouse and store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.keys(stockByLocation).length > 0 ? Object.entries(stockByLocation).map(([locationName, stocks], index) => (
                        <div key={locationName}>
                            <h3 className="font-semibold mb-2">{locationName}</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Variant</TableHead>
                                        <TableHead className="text-right">On Hand</TableHead>
                                        <TableHead className="text-right">Available</TableHead>
                                        <TableHead className="text-right">Reserved</TableHead>
                                        <TableHead className="text-right">Damaged</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stocks.map(s => (
                                        <TableRow key={s.variantName}>
                                            <TableCell className="font-medium">{s.variantName}</TableCell>
                                            <TableCell className="text-right">{s.onHand}</TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">{s.available}</TableCell>
                                            <TableCell className="text-right text-orange-600">{s.reserved}</TableCell>
                                            <TableCell className="text-right text-red-600">{s.damaged}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {index < Object.keys(stockByLocation).length - 1 && <Separator className="my-4" />}
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No stock recorded at any location.</p>
                    )}
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
                                        <TableCell>{item.locationName || '-'}</TableCell>
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
                                    <TableHead>Channel</TableHead>
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
                                            <TableCell>{adj.channel || 'N/A'}</TableCell>
                                            <TableCell className={cn('font-mono font-medium', adj.quantity > 0 ? 'text-green-600' : 'text-red-600')}>{adj.quantity > 0 ? '+' : ''}{adj.quantity}</TableCell>
                                            <TableCell className="text-muted-foreground">{adj.reason || '–'}</TableCell>
                                        </TableRow>
                                   )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={product.hasVariants ? 6 : 5} className="text-center h-24">
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
