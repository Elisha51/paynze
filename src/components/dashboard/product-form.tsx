
'use client';

import { ArrowLeft, PlusCircle, Trash2, Image as ImageIcon, Sparkles, Save, Package, Download, Clock, X } from 'lucide-react';
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
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Product, WholesalePrice, ProductVariant, ProductImage, ProductOption } from '@/lib/types';
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
  DialogClose,
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
  inventoryTracking: 'Track Quantity',
  requiresShipping: true,
  retailPrice: 0,
  currency: 'UGX',
  isTaxable: false,
  hasVariants: false,
  options: [{ name: '', values: [] }],
  variants: [],
  wholesalePricing: [],
};

// Helper function to generate variants from options
const generateVariants = (options: ProductOption[]): ProductVariant[] => {
    if (options.length === 0 || options.every(opt => opt.values.length === 0)) {
        return [];
    }

    let variants: Record<string, string>[] = [{}];

    for (const option of options) {
        if(option.name && option.values.length > 0) {
            const newVariants: Record<string, string>[] = [];
            for (const variant of variants) {
                for (const value of option.values) {
                    newVariants.push({
                        ...variant,
                        [option.name]: value,
                    });
                }
            }
            variants = newVariants;
        }
    }
    
    return variants.map((optionValues, index) => ({
        id: `variant-${Date.now()}-${index}`,
        optionValues,
        price: undefined,
        stockQuantity: 0,
        sku: '',
        imageIds: []
    }));
};


export function ProductForm({ initialProduct }: { initialProduct?: Partial<Product> | null }) {
  const [product, setProduct] = useState<Product>({ ...emptyProduct, ...initialProduct });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // When initialProduct changes, reset the form state
    setProduct({ ...emptyProduct, ...initialProduct });
  }, [initialProduct]);
  
  useEffect(() => {
    if (product.hasVariants) {
        const newVariants = generateVariants(product.options);
        // Preserve existing variant data where possible
        const mergedVariants = newVariants.map(newVariant => {
            const existingVariant = product.variants.find(oldVariant => {
                return JSON.stringify(oldVariant.optionValues) === JSON.stringify(newVariant.optionValues);
            });
            return existingVariant ? { ...newVariant, ...existingVariant, id: newVariant.id } : newVariant;
        });
        setProduct(prev => ({ ...prev, variants: mergedVariants }));
    } else {
        // If not using variants, ensure there is a single default variant for stock tracking
        if (product.variants.length === 0) {
            setProduct(prev => ({
                ...prev,
                variants: [{ id: 'default-variant', optionValues: {}, stockQuantity: 0, price: prev.retailPrice }]
            }));
        }
    }
  }, [product.options, product.hasVariants]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: keyof Product, checked: boolean) => {
    setProduct((prev) => ({...prev, [id]: checked }));
  }
  
  const handleDescriptionChange = (value: string) => {
    setProduct(prev => ({ ...prev, longDescription: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: Number(value) || 0 }));
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: string) => {
      setProduct(prev => ({
          ...prev,
          dimensions: {
              ...prev.dimensions,
              [dimension]: Number(value) || 0,
          }
      }));
  }
  
  const handleSelectChange = (id: keyof Product, value: string) => {
    setProduct(prev => ({ ...prev, [id]: value }));
    if (id === 'productType') {
        const isPhysical = value === 'Physical';
        setProduct(prev => ({ 
            ...prev, 
            requiresShipping: isPhysical,
            inventoryTracking: isPhysical ? 'Track Quantity' : 'Don\'t Track'
        }));
    }
     if (id === 'inventoryTracking' && value === "Don't Track") {
        setProduct(prev => ({ 
            ...prev, 
            lowStockThreshold: undefined, 
            variants: prev.variants.map(v => ({...v, stockQuantity: 0})) 
        }));
    }
  }

  const handleStatusChange = (value: Product['status']) => {
    setProduct((prev) => ({ ...prev, status: value }));
  };

  const handleFilesChange = (newFiles: (File | ProductImage)[]) => {
    const processedFiles = newFiles.map(file => {
      if (file instanceof File && !(file as any).id) {
        const newFileWithId = file as any;
        newFileWithId.id = `new-${Math.random().toString(36).substr(2, 9)}`;
        return newFileWithId;
      }
      return file;
    });
    setProduct({ ...product, images: processedFiles as (ProductImage | File)[] });
  };

  const handleDigitalFileChange = (files: File[]) => {
      if (files.length > 0) {
          setProduct(prev => ({ ...prev, digitalFile: files[0] }));
      } else {
          setProduct(prev => ({ ...prev, digitalFile: undefined }));
      }
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

  const handleOptionChange = (optionIndex: number, field: 'name' | 'value', value: string) => {
      const updatedOptions = [...product.options];
      if (field === 'name') {
          updatedOptions[optionIndex].name = value;
      } else {
          updatedOptions[optionIndex].values = value.split(',').map(v => v.trim()).filter(Boolean);
      }
      setProduct(prev => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    if (product.options.length < 3) {
      setProduct(prev => ({ ...prev, options: [...prev.options, { name: '', values: [] }] }));
    }
  };

  const removeOption = (optionIndex: number) => {
    const updatedOptions = product.options.filter((_, i) => i !== optionIndex);
    setProduct(prev => ({ ...prev, options: updatedOptions }));
  };


  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: string | number) => {
    setProduct(prev => ({
        ...prev,
        variants: prev.variants.map(v => {
            if (v.id === variantId) {
                const updatedVariant = { ...v };
                if (field === 'price' || field === 'stockQuantity') {
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
    console.log('Saving product:', product);
  };
  
  const uploadedImages = product.images.filter(img => ('url' in img && img.url) || (img instanceof File)) as (ProductImage | File & { id: string, url?: string })[];


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="hidden md:inline-flex">
          <Link href={initialProduct?.sku ? `/dashboard/products/${initialProduct.sku}` : "/dashboard/products"}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialProduct?.sku ? `Edit Product` : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {initialProduct?.sku ? `Editing "${initialProduct.name}"` : 'Fill in the details below.'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Product
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={product.name} onChange={handleInputChange} placeholder="e.g., Kitenge Fabric"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="productType">Product Type</Label>
                    <Select value={product.productType} onValueChange={(v) => handleSelectChange('productType', v)}>
                        <SelectTrigger id="productType">
                            <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Physical"><div className="flex items-center gap-2"><Package className="h-4 w-4"/> Physical</div></SelectItem>
                            <SelectItem value="Digital"><div className="flex items-center gap-2"><Download className="h-4 w-4"/> Digital</div></SelectItem>
                            <SelectItem value="Service"><div className="flex items-center gap-2"><Clock className="h-4 w-4"/> Service</div></SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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

          {product.productType === 'Digital' && (
            <Card>
                <CardHeader>
                    <CardTitle>Digital Asset</CardTitle>
                    <CardDescription>Upload the file for your digital product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Digital File</Label>
                        <FileUploader
                            files={product.digitalFile ? [product.digitalFile] : []}
                            onFilesChange={handleDigitalFileChange}
                            maxFiles={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="downloadLimit">Download Limit</Label>
                        <Input id="downloadLimit" type="number" value={product.downloadLimit || ''} onChange={handleNumberChange} placeholder="e.g., 5" />
                        <p className="text-xs text-muted-foreground">Leave blank for unlimited downloads.</p>
                    </div>
                </CardContent>
            </Card>
          )}
          
          {product.productType === 'Service' && (
             <Card>
                <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                    <CardDescription>Specify the details of the service you are providing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="serviceDuration">Service Duration</Label>
                        <Input id="serviceDuration" value={product.serviceDuration || ''} onChange={handleInputChange} placeholder="e.g., 1 hour, Per Session" />
                    </div>
                </CardContent>
            </Card>
          )}


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
                            {product.wholesalePricing.map((tier, index) => (
                                <Card key={index} className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 flex-1">
                                            <div className="space-y-1">
                                                <Label htmlFor={`ws-group-${index}`} className="text-xs">Customer Group</Label>
                                                <Input
                                                    id={`ws-group-${index}`}
                                                    type="text"
                                                    value={tier.customerGroup}
                                                    onChange={(e) => handleWholesalePriceChange(index, 'customerGroup', e.target.value)}
                                                    placeholder="e.g. Wholesale"
                                                />
                                            </div>
                                             <div className="space-y-1">
                                                <Label htmlFor={`ws-qty-${index}`} className="text-xs">Min. Quantity</Label>
                                                <Input 
                                                    id={`ws-qty-${index}`}
                                                    type="number" 
                                                    value={tier.minOrderQuantity} 
                                                    onChange={(e) => handleWholesalePriceChange(index, 'minOrderQuantity', e.target.value)}
                                                    placeholder="Min. Quantity"
                                                />
                                            </div>
                                             <div className="space-y-1">
                                                <Label htmlFor={`ws-price-${index}`} className="text-xs">Price</Label>
                                                <Input 
                                                    id={`ws-price-${index}`}
                                                    type="number" 
                                                    value={tier.price} 
                                                    onChange={(e) => handleWholesalePriceChange(index, 'price', e.target.value)}
                                                    placeholder="Price per item"
                                                />
                                            </div>
                                        </div>
                                         <Button variant="ghost" size="icon" onClick={() => handleRemoveWholesalePrice(index)} className="ml-2 flex-shrink-0" aria-label="Remove wholesale tier">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </Card>
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
          
          {product.productType === 'Physical' && (
            <>
            <Card>
                <CardHeader>
                    <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start space-x-3">
                        <Checkbox id="hasVariants" checked={product.hasVariants} onCheckedChange={(c) => handleCheckboxChange('hasVariants', !!c)}/>
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="hasVariants">This product has variants</Label>
                            <p className="text-sm text-muted-foreground">
                                Offer different versions of this product, like sizes or colors.
                            </p>
                        </div>
                    </div>

                    {product.hasVariants && (
                        <div className="space-y-4 pl-8 border-l">
                            <h4 className="font-medium">Options</h4>
                            {product.options.map((option, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="space-y-1">
                                                <Label htmlFor={`option-name-${index}`}>Option Name</Label>
                                                <Input
                                                    id={`option-name-${index}`}
                                                    value={option.name}
                                                    onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                                                    placeholder="e.g., Size"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor={`option-values-${index}`}>Option Values</Label>
                                                <Input
                                                    id={`option-values-${index}`}
                                                    value={option.values.join(', ')}
                                                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                                    placeholder="e.g., Small, Medium, Large"
                                                />
                                                 <p className="text-xs text-muted-foreground">Separate values with a comma.</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="mt-6">
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {product.options.length < 3 && (
                                <Button variant="outline" size="sm" onClick={addOption}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add another option
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {product.hasVariants && product.variants && product.variants.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Variant Details</CardTitle>
                        <CardDescription>Manage price, stock, and SKU for each product combination.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
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
                                                value={variant.price ?? ''}
                                                onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                                                placeholder={String(product.retailPrice)}
                                                className="h-8 min-w-[100px]"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                aria-label="Variant Stock"
                                                value={variant.stockQuantity}
                                                onChange={(e) => handleVariantChange(variant.id, 'stockQuantity', e.target.value)}
                                                className="h-8 min-w-[80px]"
                                                disabled={product.inventoryTracking === 'Don\'t Track'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                aria-label="Variant SKU"
                                                value={variant.sku || ''}
                                                onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                                                placeholder="Variant SKU"
                                                className="h-8 min-w-[120px]"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                        <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" disabled={uploadedImages.length === 0}>
                                                        <ImageIcon className="h-4 w-4 mr-2" />
                                                        {variant.imageIds?.length || 0}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Manage Images for {Object.values(variant.optionValues).join(' / ')}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4 max-h-[50vh] overflow-y-auto">
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

            <Card>
                <CardHeader>
                    <CardTitle>Inventory & Shipping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                            <Input id="sku" value={product.sku || ''} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="barcode">Barcode (GTIN, UPC, etc.)</Label>
                            <Input id="barcode" value={product.barcode || ''} onChange={handleInputChange}/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inventoryTracking">Inventory Tracking</Label>
                        <Select value={product.inventoryTracking} onValueChange={(v) => handleSelectChange('inventoryTracking', v)}>
                            <SelectTrigger id="inventoryTracking">
                                <SelectValue placeholder="Select tracking method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Don't Track">Don't Track</SelectItem>
                                <SelectItem value="Track Quantity">Track Quantity</SelectItem>
                                <SelectItem value="Track with Serial Numbers">Track with Serial Numbers</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                     {product.inventoryTracking !== 'Don\'t Track' && !product.hasVariants && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2">
                            <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                                <Input id="unitOfMeasure" value={product.unitOfMeasure || 'unit'} onChange={handleInputChange} placeholder="e.g. kg, m, unit"/>
                            </div>
                            <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="stockQuantity">Available Quantity</Label>
                                <Input id="stockQuantity" type="number" value={product.variants[0]?.stockQuantity || 0} onChange={(e) => handleVariantChange(product.variants[0].id, 'stockQuantity', e.target.value)} />
                            </div>
                             <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                <Input id="lowStockThreshold" type="number" value={product.lowStockThreshold || ''} onChange={handleNumberChange} />
                            </div>
                        </div>
                     )}
                     <div className="flex items-center space-x-2">
                        <Checkbox id="requiresShipping" checked={product.requiresShipping} onCheckedChange={(c) => handleCheckboxChange('requiresShipping', !!c)} disabled={product.productType !== 'Physical'}/>
                        <Label htmlFor="requiresShipping">This is a physical product that requires shipping</Label>
                     </div>
                      {product.requiresShipping && (
                        <div className="pl-6 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input id="weight" type="number" value={product.weight || ''} onChange={handleNumberChange} />
                            </div>
                             <div className="space-y-2">
                                <Label>Dimensions (cm)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                     <div className="space-y-1 sm:hidden">
                                        <Label className="text-xs">Length</Label>
                                        <Input type="number" placeholder="Length" value={product.dimensions?.length || ''} onChange={(e) => handleDimensionChange('length', e.target.value)} />
                                     </div>
                                      <Input type="number" placeholder="Length" className="hidden sm:block" value={product.dimensions?.length || ''} onChange={(e) => handleDimensionChange('length', e.target.value)} />

                                      <div className="space-y-1 sm:hidden">
                                        <Label className="text-xs">Width</Label>
                                        <Input type="number" placeholder="Width" value={product.dimensions?.width || ''} onChange={(e) => handleDimensionChange('width', e.target.value)} />
                                     </div>
                                     <Input type="number" placeholder="Width" className="hidden sm:block" value={product.dimensions?.width || ''} onChange={(e) => handleDimensionChange('width', e.target.value)} />

                                     <div className="space-y-1 sm:hidden">
                                        <Label className="text-xs">Height</Label>
                                        <Input type="number" placeholder="Height" value={product.dimensions?.height || ''} onChange={(e) => handleDimensionChange('height', e.target.value)} />
                                     </div>
                                     <Input type="number" placeholder="Height" className="hidden sm:block" value={product.dimensions?.height || ''} onChange={(e) => handleDimensionChange('height', e.target.value)} />
                                </div>
                            </div>
                        </div>
                     )}
                </CardContent>
            </Card>
            </>
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
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    