
'use client';

import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Product, WholesalePrice } from '@/lib/types';
import { FileUploader } from '@/components/ui/file-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Link from 'next/link';

const emptyProduct: Product = {
  productType: 'Physical',
  name: '',
  status: 'draft',
  images: [],
  trackStock: true,
  stockQuantity: 0,
  requiresShipping: true,
  retailPrice: 0,
  currency: 'UGX',
  isTaxable: false,
  hasVariants: false,
  variants: [],
  wholesalePricing: [],
};

export function ProductForm({ product: initialProduct }: { product?: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct || emptyProduct);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: Number(value) || 0 }));
  };

  const handleStatusChange = (value: Product['status']) => {
    setProduct((prev) => ({ ...prev, status: value }));
  };

  const handleFilesChange = (newFiles: (File | { url: string; id: string })[]) => {
    setProduct({ ...product, images: newFiles });
  };
  
  const handleAddWholesalePrice = () => {
    setProduct(prev => ({
        ...prev,
        wholesalePricing: [...prev.wholesalePricing, { customerGroup: 'wholesale', price: 0 }]
    }))
  }

  const handleWholesalePriceChange = (index: number, field: keyof WholesalePrice, value: string | number) => {
    const updatedPricing = [...product.wholesalePricing];
    if (field === 'price' || field === 'minOrderQuantity') {
      updatedPricing[index][field] = Number(value);
    } else {
      updatedPricing[index][field] = value as string;
    }
    setProduct(prev => ({ ...prev, wholesalePricing: updatedPricing }));
  };

  const handleRemoveWholesalePrice = (index: number) => {
     setProduct(prev => ({
        ...prev,
        wholesalePricing: prev.wholesalePricing.filter((_, i) => i !== index)
    }))
  }


  const handleSave = () => {
    toast({
      title: 'Product Saved',
      description: `${product.name} has been updated successfully.`,
    });
    // In a real app, this would be a POST/PUT request to an API
    console.log('Saving product:', product);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Products</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialProduct ? `Edit Product` : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            {initialProduct ? `Editing "${initialProduct.name}"` : 'Fill in the details below to create a new product.'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={product.name} onChange={handleInputChange} placeholder="e.g., Kitenge Fabric"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longDescription">Description</Label>
                <Textarea id="longDescription" value={product.longDescription} onChange={handleInputChange} placeholder="A detailed description of the product." />
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Images</Label>
                    <FileUploader
                        files={product.images}
                        onFilesChange={handleFilesChange}
                        maxFiles={5}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input id="videoUrl" value={product.videoUrl || ''} onChange={handleInputChange} placeholder="e.g., https://www.youtube.com/watch?v=..."/>
                    <p className="text-xs text-muted-foreground">Embed a single video from YouTube or Vimeo.</p>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="retailPrice">Retail Price ({product.currency})</Label>
                    <Input id="retailPrice" type="number" value={product.retailPrice} onChange={handleNumberChange} placeholder="e.g. 35000"/>
                </div>
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Wholesale Pricing</h4>
                    {product.wholesalePricing.length > 0 && (
                        <div className="space-y-2">
                            {product.wholesalePricing.map((tier, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <Select value={tier.customerGroup} onValueChange={(value) => handleWholesalePriceChange(index, 'customerGroup', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="wholesale">Wholesale</SelectItem>
                                            <SelectItem value="retailer">Retailer</SelectItem>
                                            <SelectItem value="vip">VIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input 
                                        type="number" 
                                        value={tier.price} 
                                        onChange={(e) => handleWholesalePriceChange(index, 'price', e.target.value)}
                                        placeholder="Price"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveWholesalePrice(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleAddWholesalePrice}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add price tier
                    </Button>
                </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={product.status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
           <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={product.category || ''} onChange={handleInputChange} placeholder="e.g., Fabrics"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                        <Input id="sku" value={product.sku || ''} onChange={handleInputChange}/>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild><Link href="/dashboard/products">Cancel</Link></Button>
        <Button onClick={handleSave}>Save Product</Button>
      </div>
    </div>
  );
}
