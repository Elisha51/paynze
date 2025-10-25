

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
import type { Product, InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ShoppingBasket, PackageCheck, Ban, Truck } from 'lucide-react';
import { Calendar } from '../ui/calendar';

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

const adjustmentTypeColors: { [key in Product['variants'][0]['stockAdjustments'][0]['type']]: string } = {
    'Initial Stock': 'text-blue-600',
    'Sale': 'text-red-600',
    'Return': 'text-green-600',
    'Manual Adjustment': 'text-purple-600',
    'Damage': 'text-yellow-600',
};


export function ProductDetailsInventory({ product }: { product: Product }) {
    const isSerialized = product.inventoryTracking === 'Track with Serial Numbers';
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -29),
        to: new Date(),
    });

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
        const filteredStockAdjustments = (product.variants || []).flatMap(v => 
            (v.stockAdjustments || []).map(adj => ({...adj, variant: v}))
        ).filter(adj => {
            const adjDate = new Date(adj.date);
            return (!date?.from || adjDate >= date.from) && (!date?.to || adjDate <= date.to);
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const filteredInventoryItems = (product.variants || []).flatMap(v => 
            (v.inventoryItems || []).map(item => ({...item, variant: v}))
        ).filter(item => {
            if (item.status !== 'Sold' || !item.soldDate) return true; // always show non-sold items
            const soldDate = new Date(item.soldDate);
            return (!date?.from || soldDate >= date.from) && (!date?.to || soldDate <= date.to);
        });

        const currentTotalStock = product.variants.reduce((acc, v) => {
            v.stockByLocation.forEach(locStock => {
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
            v.stockByLocation.forEach(locStock => {
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
    
    const handlePresetChange = (value: string) => {
        const now = new Date();
        switch (value) {
          case 'today':
            setDate({ from: now, to: now });
            break;
          case 'last-7':
            setDate({ from: addDays(now, -6), to: now });
            break;
          case 'last-30':
            setDate({ from: addDays(now, -29), to: now });
            break;
          case 'ytd':
            setDate({ from: new Date(now.getFullYear(), 0, 1), to: now });
            break;
          default:
            setDate(undefined);
        }
    };


    return (
        <div className="mt-4 space-y-6">
             <div className="flex justify-end items-center gap-2">
                <Select onValueChange={handlePresetChange} defaultValue="last-30">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last-7">Last 7 days</SelectItem>
                        <SelectItem value="last-30">Last 30 days</SelectItem>
                        <SelectItem value="ytd">Year to date</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
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
                                <p className="text-sm text-muted-foreground">Sold ({date?.from ? `${format(date.from, 'LLL d')} - ${date.to ? format(date.to, 'LLL d') : '...'}` : 'All Time'})</p>
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
                                            No stock history available for the selected period.
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
