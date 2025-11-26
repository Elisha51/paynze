'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import Image from 'next/image';
import type { Product, Supplier, ProductVariant } from '@/lib/types';
import { Remarkable } from 'remarkable';
import { Laptop, Store, PackageCheck, ShoppingBasket } from 'lucide-react';
import { useMemo } from 'react';
import { getSuppliers } from '@/services/procurement';
import Link from 'next/link';

const md = new Remarkable();

const getAvailableStock = (product: Product) => {
    if (product.inventoryTracking === "Don't Track") return Infinity;
    return product.variants.reduce((sum, v) => 
        sum + (v.stockByLocation?.reduce((locSum, loc) => locSum + loc.stock.available, 0) || 0), 0);
}

const getOnHandStock = (product: Product) => {
    if (product.inventoryTracking === "Don't Track") return Infinity;
    return product.variants.reduce((sum, v) => 
        sum + (v.stockByLocation?.reduce((locSum, loc) => locSum + loc.stock.onHand, 0) || 0), 0);
}


export function ProductDetailsOverview({ product }: { product: Product }) {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);

  React.useEffect(() => {
    async function loadSuppliers() {
      const fetchedSuppliers = await getSuppliers();
      setSuppliers(fetchedSuppliers);
    }
    loadSuppliers();
  }, []);

  const productSuppliers = useMemo(() => {
    return (product.supplierIds || []).map(id => suppliers.find(s => s.id === id)).filter(Boolean) as Supplier[];
  }, [product.supplierIds, suppliers]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
  
  const uploadedImages = product.images.filter(img => ('url' in img && img.url) || (img instanceof File));

  const getVariantStatusBadge = (status: ProductVariant['status']) => {
    switch (status) {
        case 'In Stock': return <Badge variant="default">In Stock</Badge>;
        case 'Low Stock': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
        case 'Out of Stock': return <Badge variant="destructive">Out of Stock</Badge>;
        case 'Pre-Order': return <Badge variant="outline" className="text-blue-600 border-blue-600">Pre-Order</Badge>;
        case 'Backordered': return <Badge variant="outline" className="text-orange-600 border-orange-600">Backordered</Badge>;
        case 'Discontinued': return <Badge variant="outline">Discontinued</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  const totalAvailableStock = (variant: Product['variants'][0]) => {
      return variant.stockByLocation?.reduce((sum, loc) => sum + loc.stock.available, 0) || 0;
  }
  const totalOnHandStock = (variant: Product['variants'][0]) => {
      return variant.stockByLocation?.reduce((sum, loc) => sum + loc.stock.onHand, 0) || 0;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Product Type</h3>
                    <p>{product.productType}</p>
                </div>
                <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Short Description</h3>
                    <p>{product.shortDescription}</p>
                </div>
                <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Detailed Description</h3>
                    <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: md.render(product.longDescription || '') }}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {uploadedImages.map((image, index) => {
                        const imageUrl = image instanceof File ? URL.createObjectURL(image) : image.url;
                        return (
                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                                <Image src={imageUrl} alt={`Product image ${index+1}`} fill className="object-cover" />
                            </div>
                        )
                    })}
                </div>
                {product.videoUrl && (
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Video</h3>
                        <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{product.videoUrl}</a>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Retail Price</h3>
                        <p>{formatCurrency(product.retailPrice, product.currency)}</p>
                    </div>
                    {product.compareAtPrice && (
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Compare At Price</h3>
                            <p className="line-through">{formatCurrency(product.compareAtPrice, product.currency)}</p>
                        </div>
                    )}
                </div>
                {product.wholesalePricing && product.wholesalePricing.length > 0 && (
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Wholesale Pricing</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer Group</TableHead>
                                    <TableHead>Min. Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product.wholesalePricing.map((tier, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{tier.customerGroup}</TableCell>
                                        <TableCell>{tier.minOrderQuantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(tier.price, product.currency)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>

        {product.hasVariants && product.variants && product.variants.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">On Hand</TableHead>
                                <TableHead className="text-right">Available</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {product.variants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-medium">
                                        {Object.values(variant.optionValues).join(' / ')}
                                    </TableCell>
                                    <TableCell>
                                        {getVariantStatusBadge(variant.status)}
                                    </TableCell>
                                    <TableCell>
                                    {variant.price ? formatCurrency(variant.price, product.currency) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {variant.sku || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {totalOnHandStock(variant)}
                                    </TableCell>
                                    <TableCell className="text-right text-primary font-bold">
                                        {totalAvailableStock(variant)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                </Table>
                </CardContent>
            </Card>
        )}

        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Status & Visibility</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Listing Status</h3>
                        <Badge variant={product.status === 'draft' ? 'secondary' : product.status === 'archived' ? 'outline' : 'default'}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </Badge>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Channels</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {product.productVisibility?.includes('Online Store') && <Badge variant="outline" className="flex items-center gap-2"><Laptop /> Online Store</Badge>}
                            {product.productVisibility?.includes('POS') && <Badge variant="outline" className="flex items-center gap-2"><Store /> Point of Sale</Badge>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PackageCheck className="h-5 w-5" />
                            <span>On Hand</span>
                        </div>
                        <span className="font-bold">{getOnHandStock(product)}</span>
                     </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                             <ShoppingBasket className="h-5 w-5" />
                            <span>Available</span>
                        </div>
                        <span className="font-bold text-green-600">{getAvailableStock(product)}</span>
                     </div>
                </CardContent>
            </Card>
        <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                        <p>{product.category || '-'}</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Suppliers</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {productSuppliers.length > 0 ? productSuppliers.map(sup => (
                                <Badge key={sup.id} variant="secondary" asChild>
                                    <Link href={`/dashboard/procurement/suppliers/${sup.id}`}>{sup.name}</Link>
                                </Badge>
                            )) : <p>-</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Tags</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                             {(product.tags || []).length > 0 ? product.tags?.map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                            )) : <p>-</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {product.productType === 'Physical' && (
            <Card>
                <CardHeader>
                    <CardTitle>Inventory & Shipping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">SKU</h3>
                        <p>{product.sku || '-'}</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Barcode</h3>
                        <p>{product.barcode || '-'}</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Inventory Tracking</h3>
                        <p>{product.inventoryTracking}</p>
                    </div>
                    {product.inventoryTracking !== 'Don\'t Track' && product.variants.length > 0 && !product.hasVariants && (
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Stock On Hand</h3>
                            <p>{totalOnHandStock(product.variants[0])} {product.unitOfMeasure || 'units'}</p>
                        </div>
                    )}
                    {product.requiresShipping && (
                        <>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Weight</h3>
                                <p>{product.weight ? `${product.weight} kg` : '-'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Dimensions</h3>
                                <p>{product.dimensions && product.dimensions.length ? `${product.dimensions.length}L x ${product.dimensions.width}W x ${product.dimensions.height}H cm` : '-'}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        )}

        </div>
    </div>
  );
}
