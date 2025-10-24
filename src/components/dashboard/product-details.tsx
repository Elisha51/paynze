
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image';
import type { Product, InventoryItem } from '@/lib/types';
import { Remarkable } from 'remarkable';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const md = new Remarkable();

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

export function ProductDetails({ product }: { product: Product }) {

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
  
  const uploadedImages = product.images.filter(img => ('url' in img && img.url) || (img instanceof File));

  const inventoryItems = product.variants.flatMap(v => v.inventoryItems || []);
  const isSerialized = product.inventoryTracking === 'Track with Serial Numbers';

  return (
    <TooltipProvider>
      <Tabs defaultValue="overview">
          <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
               <Tooltip>
                    <TooltipTrigger asChild>
                        <TabsTrigger value="inventory" disabled={!isSerialized} className="disabled:cursor-not-allowed">
                            Inventory
                        </TabsTrigger>
                    </TooltipTrigger>
                    {!isSerialized && (
                        <TooltipContent>
                            <p>Detailed inventory is only available for products tracked with serial numbers.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
          </TabsList>
          <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
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
                              <CardDescription>Price, stock, and SKU for each product combination.</CardDescription>
                          </CardHeader>
                          <CardContent className="overflow-x-auto">
                          <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Variant</TableHead>
                                          <TableHead>Price</TableHead>
                                          <TableHead>Stock</TableHead>
                                          <TableHead>SKU</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {product.variants.map((variant) => (
                                          <TableRow key={variant.id}>
                                              <TableCell className="font-medium">
                                                  {Object.values(variant.optionValues).join(' / ')}
                                              </TableCell>
                                              <TableCell>
                                              {variant.price ? formatCurrency(variant.price, product.currency) : '-'}
                                              </TableCell>
                                              <TableCell>
                                                  {variant.stockQuantity}
                                              </TableCell>
                                              <TableCell>
                                                  {variant.sku || '-'}
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
                              <CardTitle>Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <Badge variant={product.status === 'draft' ? 'secondary' : product.status === 'archived' ? 'outline' : 'default'}>
                                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                              </Badge>
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
                              {product.inventoryTracking !== 'Don\'t Track' && product.variants.length === 0 && (
                              <div>
                                      <h3 className="font-medium text-sm text-muted-foreground">Stock</h3>
                                      <p>{product.variants[0]?.stockQuantity || 0} {product.unitOfMeasure || 'units'}</p>
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
          </TabsContent>
          <TabsContent value="inventory">
               <Card className="mt-4">
                  <CardHeader>
                      <CardTitle>Detailed Inventory</CardTitle>
                      <CardDescription>
                          {isSerialized
                              ? 'Track each individual item by its serial number and status.'
                              : 'Detailed inventory is only available for products tracked with serial numbers.'
                          }
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isSerialized ? (
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Serial Number</TableHead>
                                      <TableHead>Variant</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Location</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {inventoryItems.length > 0 ? inventoryItems.map(item => {
                                     const variant = product.variants.find(v => v.inventoryItems?.some(i => i.id === item.id));
                                     return (
                                          <TableRow key={item.id}>
                                              <TableCell className="font-mono">{item.serialNumber || 'N/A'}</TableCell>
                                              <TableCell>{variant ? Object.values(variant.optionValues).join(' / ') : 'Default'}</TableCell>
                                              <TableCell><InventoryStatusBadge status={item.status} /></TableCell>
                                              <TableCell>{item.location || '-'}</TableCell>
                                          </TableRow>
                                     )
                                  }) : (
                                      <TableRow>
                                          <TableCell colSpan={4} className="text-center h-24">
                                              No serialized items for this product yet.
                                          </TableCell>
                                      </TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      ) : (
                           <p className="text-sm text-muted-foreground p-8 text-center bg-muted rounded-md">
                             To track individual items, please edit this product and set Inventory Tracking to "Track with Serial Numbers".
                           </p>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
