
'use client';

import { useState, useMemo } from 'react';
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
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { ShoppingBasket, PackageCheck, Ban, Truck, Calendar as CalendarIcon, ArrowRightLeft } from 'lucide-react';
import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';

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

const adjustmentTypeColors: { [key in StockAdjustment['type'] | 'Transfer']: string } = {
    'Initial Stock': 'text-blue-600',
    'Sale': 'text-red-600',
    'Return': 'text-green-600',
    'Manual Adjustment': 'text-purple-600',
    'Damage': 'text-yellow-600',
    'Reserve': 'text-orange-600',
    'Un-reserve': 'text-green-600',
    'Transfer': 'text-indigo-600',
};

type ProductDetailsInventoryProps = {
    product: Product;
    dateRange?: DateRange;
};

const getHistoryColumns = (productHasVariants: boolean): ColumnDef<StockAdjustment & {variantName: string}>[] => [
    { accessorKey: 'date', header: 'Date', cell: ({row}) => format(new Date(row.original.date), 'PP p') },
    ...(productHasVariants ? [{ id: 'variant', accessorKey: 'variantName', header: 'Variant' }] : []),
    { accessorKey: 'type', header: 'Type', cell: ({row}) => <span className={cn('font-medium', adjustmentTypeColors[row.original.type])}>{row.original.type}</span> },
    { accessorKey: 'details', header: 'Details' },
    { accessorKey: 'quantity', header: 'Quantity', cell: ({row}) => <span className={cn('font-mono font-medium', row.original.quantity > 0 ? 'text-green-600' : 'text-red-600')}>{row.original.quantity > 0 ? '+' : ''}{row.original.quantity}</span> },
    { accessorKey: 'reason', header: 'Reason' },
];

export function ProductDetailsInventory({ product, dateRange: date }: ProductDetailsInventoryProps) {
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

    const {
        allInventoryItems,
        allStockAdjustments,
        totalStock,
        stockByLocation
    } = useMemo(() => {
        const filteredStockAdjustments = (product.variants || []).flatMap(v => {
            const variantName = product.hasVariants ? Object.values(v.optionValues).join(' / ') : 'Default';
            return (v.stockAdjustments || []).map(adj => ({...adj, variantName, variant: v}))
        }
        ).filter(adj => {
            if (!date) return true; // Show all if no date range
            const adjDate = new Date(adj.date);
            return (!date?.from || adjDate >= date.from) && (!date?.to || adjDate <= date.to);
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const filteredInventoryItems = (product.variants || []).flatMap(v => 
            (v.inventoryItems || []).map(item => ({...item, variant: v}))
        ).filter(item => {
            if (item.status !== 'Sold' || !item.soldDate) return true; // always show non-sold items
            if (!date) return true; // show all if no date range
            const soldDate = new Date(item.soldDate);
            return (!date?.from || soldDate >= date.from) && (!date?.to || soldDate <= date.to);
        });

        const currentTotalStock = product.variants.reduce((acc, v) => {
            (v.stockByLocation || []).forEach(locStock => {
                acc.onHand += locStock.stock.onHand;
                acc.available += locStock.stock.available;
                acc.reserved += locStock.stock.reserved;
                acc.damaged += locStock.stock.damaged;
            });
            return acc;
        }, { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 });

        const soldInPeriod = filteredStockAdjustments
            .filter(adj => adj.type === 'Sale')
            .reduce((sum, adj) => sum + Math.abs(adj.quantity), 0);
            
        currentTotalStock.sold = soldInPeriod;
        
        const currentLocationStock = product.variants.reduce((acc, v) => {
            const variantName = product.hasVariants ? Object.values(v.optionValues).join(' / ') : 'Default';
            (v.stockByLocation || []).forEach(locStock => {
                if (!acc[locStock.locationName]) {
                    acc[locStock.locationName] = [];
                }
                const soldForVariantInLoc = filteredStockAdjustments
                    .filter(adj => adj.type === 'Sale' && adj.variant.id === v.id) // This is a simplification
                    .reduce((sum, adj) => sum + Math.abs(adj.quantity), 0);

                acc[locStock.locationName].push({
                    variantName,
                    ...locStock.stock,
                    sold: soldForVariantInLoc,
                });
            });
            return acc;
        }, {} as Record<string, ({ variantName: string; sold: number; } & Product['variants'][0]['stockByLocation'][0]['stock'])[]>);

        return {
            allInventoryItems: filteredInventoryItems,
            allStockAdjustments: filteredStockAdjustments,
            totalStock: currentTotalStock,
            stockByLocation: currentLocationStock
        }

    }, [product, date]);
    
    const historyColumns = useMemo(() => getHistoryColumns(product.hasVariants), [product.hasVariants]);
    
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Inventory Summary</CardTitle>
                        <CardDescription>Overall stock levels for "{product.name}" across all locations.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="text-center">
                            <CardHeader className="p-4"><PackageCheck className="mx-auto h-6 w-6 text-muted-foreground" /></CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">On Hand</p>
                                <p className="text-2xl font-bold">{totalStock.onHand}</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                             <CardHeader className="p-4"><ShoppingBasket className="mx-auto h-6 w-6 text-muted-foreground" /></CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">Available</p>
                                <p className="text-2xl font-bold text-green-600">{totalStock.available}</p>
                            </CardContent>
                        </Card>
                         <Card className="text-center">
                             <CardHeader className="p-4"><Truck className="mx-auto h-6 w-6 text-muted-foreground" /></CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">Reserved</p>
                                <p className="text-2xl font-bold text-orange-600">{totalStock.reserved}</p>
                            </CardContent>
                        </Card>
                         <Card className="text-center">
                             <CardHeader className="p-4"><Ban className="mx-auto h-6 w-6 text-muted-foreground" /></CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">Damaged</p>
                                <p className="text-2xl font-bold text-red-600">{totalStock.damaged}</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                             <CardHeader className="p-4"><CalendarIcon className="mx-auto h-6 w-6 text-muted-foreground" /></CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">Sold</p>
                                <p className="text-2xl font-bold text-blue-600">{totalStock.sold}</p>
                            </CardContent>
                        </Card>
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
                                        <TableHead className="text-right">Sold</TableHead>
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
                                            <TableCell className="text-right text-blue-600">{s.sold}</TableCell>
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
                        <CardDescription>Track each individual item by its serial number and status for the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Serial Number</TableHead>
                                    {product.hasVariants && <TableHead>Variant</TableHead>}
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allInventoryItems.length > 0 ? allInventoryItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono">{item.serialNumber || 'N/A'}</TableCell>
                                        {product.hasVariants && <TableCell>{item.variant ? Object.values(item.variant.optionValues).join(' / ') : 'Default'}</TableCell>}
                                        <TableCell><InventoryStatusBadge status={item.status} /></TableCell>
                                        <TableCell>{item.locationName || '-'}</TableCell>
                                        <TableCell>{item.soldDate ? new Date(item.soldDate).toLocaleDateString() : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={product.hasVariants ? 5 : 4} className="text-center h-24">
                                            No serialized items found for the selected period.
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
                        <CardDescription>A log of all inventory adjustments for this product for the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <DataTable
                            columns={historyColumns}
                            data={allStockAdjustments}
                            isLoading={false}
                       />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
