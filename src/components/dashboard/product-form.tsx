
'use client';

import { ArrowLeft, PlusCircle, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Product, WholesalePrice, ProductVariant, ProductImage } from '@/lib/types';
import { FileUploader } from '@/components/ui/file-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Checkbox } from '../ui/checkbox';
import { RichTextEditor } from '../ui/rich-text-editor';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleDescriptionChange = (value: string) => {
    setProduct(prev => ({ ...prev, longDescription: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: Number(value) || 0 }));
  };

  const handleStatusChange = (value: Product['status']) => {
    setProduct((prev) => ({ ...prev, status: value }));
  };

  const handleFilesChange = (newFiles: (File | ProductImage)[]) => {
    // Generate IDs for new File objects
    const processedFiles = newFiles.map(file => {
      if (file instanceof File && !(file as any).id) {
        // This is a new file, give it an ID
        const newFileWithId = file as any;
        newFileWithId.id = `new-${Math.random().toString(36).substr(2, 9)}`;
        return newFileWithId;
      }
      return file;
    });
    setProduct({ ...product, images: processedFiles as (ProductImage | File)[] });
  };
  
  const handleAddWholesalePrice = () => {
    setProduct(prev => ({
        ...prev,
        wholesalePricing: [...(prev.wholesalePricing || []), { customerGroup: '', price: 0, minOrderQuantity: 10 }]
    }))
  }

  const handleWholesalePriceChange = (index: number, field: keyof WholesalePrice, value: string | number) => {
    const updatedPricing = [...(product.wholesalePricing || [])];
    const tier = { ...updatedPricing[index] };

    if (field === 'price' || field === 'minOrderQuantity') {
        tier[field] = Number(value);
    } else {
        tier[field] = value as string;
    }
    updatedPricing[index] = tier;
    setProduct(prev => ({ ...prev, wholesalePricing: updatedPricing }));
  };

  const handleRemoveWholesalePrice = (index: number) => {
     setProduct(prev => ({
        ...prev,
        wholesalePricing: (prev.wholesalePricing || []).filter((_, i) => i !== index)
    }))
  }

  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: string | number) => {
    setProduct(prev => ({
        ...prev,
        variants: prev.variants.map(v => {
            if (v.id === variantId) {
                const updatedVariant = { ...v };
                if (field === 'price' || field === 'stock') {
                    updatedVariant[field] = Number(value);
                } else {
                    updatedVariant[field] = value as string;
                }
                return updatedVariant;
            }
            return v;
        })
    }));
  };
  
  const handleVariantImageSelect = (variantId: string, imageId: string, isSelected: boolean) => {
    setProduct(prev => ({
        ...prev,
        variants: prev.variants.map(v => {
            if (v.id === variantId) {
                const imageIds = v.imageIds || [];
                if (isSelected) {
                    return { ...v, imageIds: [...imageIds, imageId] };
                } else {
                    return { ...v, imageIds: imageIds.filter(id => id !== imageId) };
                }
            }
            return v;
        })
    }));
  };
  
  const handleGenerateDescription = async (field: 'short' | 'long') => {
    if (!product.name || !product.category) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a product name and category before generating a description.",
        });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await suggestProductDescription({
            productName: product.name,
            category: product.category,
        });
        if (result.description) {
            if (field === 'short') {
                setProduct(prev => ({...prev, shortDescription: result.description}));
            } else {
                setProduct(prev => ({...prev, longDescription: result.description}));
            }
            toast({
                title: "Description Generated",
                description: "The AI-powered description has been added.",
            });
        }
    } catch (error) {
        console.error("Failed to generate description:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Could not generate a description at this time.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Product Saved',
      description: `${product.name} has been updated successfully.`,
    });
    // In a real app, this would be a POST/PUT request to an API
    console.log('Saving product:', product);
  };
  
  const uploadedImages = useMemo(() => product.images.filter(img => 'url' in img || img instanceof File) as (ProductImage | File & { id: string, url?: string })[], [product.images]);


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
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" asChild><Link href="/dashboard/products">Cancel</Link></Button>
            <Button onClick={handleSave}>Save Product</Button>
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
                <div className="flex justify-between items-center">
                    <Label htmlFor="shortDescription">Short Description (max 160 characters)</Label>
                    <Button variant="ghost" size="sm" onClick={() => handleGenerateDescription('short')} disabled={isGenerating}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
                <Textarea 
                  id="shortDescription" 
                  value={product.shortDescription || ''} 
                  onChange={handleInputChange} 
                  placeholder="A brief summary for search results and category pages." 
                  maxLength={160}
                  className="min-h-[60px]"
                />
                 <p className="text-xs text-muted-foreground text-right">{product.shortDescription?.length || 0} / 160</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                     <Button variant="ghost" size="sm" onClick={() => handleGenerateDescription('long')} disabled={isGenerating}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
                 <RichTextEditor
                  id="longDescription"
                  value={product.longDescription || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Use this space for features, benefits, and care instructions."
                />
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
                        maxFiles={15}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                    <Input id="videoUrl" value={product.videoUrl || ''} onChange={handleInputChange} placeholder="e.g., https://www.youtube.com/watch?v=..."/>
                    <p className="text-xs text-muted-foreground">Embed a single video from YouTube or Vimeo.</p>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Manage your product's retail and wholesale prices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="retailPrice">Retail Price ({product.currency})</Label>
                        <Input id="retailPrice" type="number" value={product.retailPrice} onChange={handleNumberChange} placeholder="e.g. 35000"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Compare At Price ({product.currency})</Label>
                        <Input id="compareAtPrice" type="number" value={product.compareAtPrice || ''} onChange={handleNumberChange} placeholder="e.g. 40000"/>
                    </div>
                 </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-sm">Wholesale Pricing</h4>
                    {product.wholesalePricing && product.wholesalePricing.length > 0 && (
                        <div className="space-y-2">
                             <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                                <Label className="text-xs font-medium text-muted-foreground">Customer Group</Label>
                                <Label className="text-xs font-medium text-muted-foreground">Min. Quantity</Label>
                                <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                             </div>
                            {product.wholesalePricing.map((tier, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                                    <Input
                                        type="text"
                                        aria-label="Customer Group"
                                        value={tier.customerGroup}
                                        onChange={(e) => handleWholesalePriceChange(index, 'customerGroup', e.target.value)}
                                        placeholder="e.g. Wholesale"
                                    />
                                    <Input 
                                        type="number" 
                                        aria-label="Minimum Order Quantity"
                                        value={tier.minOrderQuantity} 
                                        onChange={(e) => handleWholesalePriceChange(index, 'minOrderQuantity', e.target.value)}
                                        placeholder="Min. Quantity"
                                    />
                                    <Input 
                                        type="number" 
                                        aria-label="Price per item"
                                        value={tier.price} 
                                        onChange={(e) => handleWholesalePriceChange(index, 'price', e.target.value)}
                                        placeholder="Price per item"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveWholesalePrice(index)} className="justify-self-end" aria-label="Remove wholesale tier">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleAddWholesalePrice}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add wholesale tier
                    </Button>
                </div>
            </CardContent>
          </Card>

           {product.hasVariants && (
            <Card>
                <CardHeader>
                    <CardTitle>Variants</CardTitle>
                    <CardDescription>Manage price, stock, and SKU for each product combination.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variant</TableHead>
                                <TableHead className="w-[120px]">Price</TableHead>
                                <TableHead className="w-[100px]">Stock</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-center">Images</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {product.variants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-medium">
                                        {Object.values(variant.optionValues).join(' / ')}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            aria-label="Variant Price"
                                            value={variant.price || ''}
                                            onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                                            placeholder={String(product.retailPrice)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            aria-label="Variant Stock"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            aria-label="Variant SKU"
                                            value={variant.sku || ''}
                                            onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                                            placeholder="Variant SKU"
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                       <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                    {variant.imageIds?.length || 0}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Manage Images for {Object.values(variant.optionValues).join(' / ')}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid grid-cols-4 gap-4 py-4 max-h-[50vh] overflow-y-auto">
                                                    {uploadedImages.map((image) => {
                                                        const imageId = 'id' in image ? image.id : '';
                                                        const imageUrl = image instanceof File ? URL.createObjectURL(image) : image.url;
                                                        const isSelected = variant.imageIds?.includes(imageId) ?? false;
                                                        return (
                                                            <div key={imageId} className="relative">
                                                                <label htmlFor={`img-${variant.id}-${imageId}`} className="cursor-pointer">
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt="Product image"
                                                                        width={150}
                                                                        height={150}
                                                                        className="rounded-md object-cover aspect-square"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                        <Checkbox
                                                                            id={`img-${variant.id}-${imageId}`}
                                                                            checked={isSelected}
                                                                            onCheckedChange={(checked) => handleVariantImageSelect(variant.id, imageId, !!checked)}
                                                                            className="h-6 w-6 border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                        />
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button>Done</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
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
                    <Label htmlFor="status" className="sr-only">Status</Label>
                    <Select value={product.status} onValueChange={handleStatusChange}>
                        <SelectTrigger id="status">
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
    </div>
  );

    