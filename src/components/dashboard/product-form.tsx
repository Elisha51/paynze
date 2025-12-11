
'use client';

import { ArrowLeft, PlusCircle, Trash2, Image as ImageIcon, Sparkles, Save, Package, Download, Clock, X, Store, Laptop, Check, ChevronsUpDown, Layers } from 'lucide-react';
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
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Product, WholesalePrice, ProductVariant, ProductImage, ProductOption, PreorderSettings, Category, Supplier, BundleItem } from '@/lib/types';
import { FileUploader } from '@/components/ui/file-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
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
import { Separator } from '../ui/separator';
import type { OnboardingFormData } from '@/context/onboarding-context';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { getCategories } from '@/services/categories';
import { addProduct, updateProduct, getProducts } from '@/services/products';
import { getSuppliers } from '@/services/procurement';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const defaultStock = { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 };
const defaultStockByLocation = [{ locationName: 'Main Warehouse', stock: defaultStock }];

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
  variants: [
    { id: 'default-variant', optionValues: {}, status: 'In Stock', stockByLocation: defaultStockByLocation, price: 0 }
  ],
  bundleItems: [],
  wholesalePricing: [],
  productVisibility: ['Online Store'],
  supplierIds: [],
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
        status: 'In Stock',
        price: undefined,
        sku: '',
        imageIds: [],
        stockByLocation: defaultStockByLocation,
    }));
};


export function ProductForm({ initialProduct, onSave }: { initialProduct?: Partial<Product> | null, onSave?: (product: Product) => void }) {
  const [product, setProduct] = useState<Product>({ ...emptyProduct, ...initialProduct });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showComparePrice, setShowComparePrice] = useState(!!initialProduct?.compareAtPrice);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    // When initialProduct changes, reset the form state
    setProduct(prev => ({ ...emptyProduct, ...prev, ...initialProduct }));
    setShowComparePrice(!!initialProduct?.compareAtPrice);

    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }

    async function loadData() {
        const [fetchedCategories, fetchedSuppliers, fetchedProducts] = await Promise.all([
            getCategories(),
            getSuppliers(),
            getProducts(),
        ]);
        setCategories(fetchedCategories);
        setSuppliers(fetchedSuppliers);
        setAllProducts(fetchedProducts.filter(p => p.productType !== 'Bundle')); // Bundles can't contain other bundles
    }
    loadData();
  }, [initialProduct]);
  
  useEffect(() => {
    setProduct(prevProduct => {
        let newVariants: ProductVariant[];

        if (prevProduct.hasVariants) {
            const generated = generateVariants(prevProduct.options);
            // Merge existing variant data into newly generated variants
            newVariants = generated.map(newVariant => {
                const existingVariant = prevProduct.variants.find(oldVariant => 
                    JSON.stringify(oldVariant.optionValues) === JSON.stringify(newVariant.optionValues)
                );
                return existingVariant ? { ...newVariant, ...existingVariant, id: newVariant.id } : newVariant;
            });
        } else {
            newVariants = [];
        }

        // If there are no variants (either because hasVariants is false or options are empty),
        // ensure there is at least one default variant.
        if (newVariants.length === 0) {
            // Try to find an existing default variant to preserve its data (e.g., stock)
            const existingDefault = prevProduct.variants.find(v => Object.keys(v.optionValues).length === 0);
            newVariants = [existingDefault || { id: 'default-variant', optionValues: {}, status: 'In Stock', stockByLocation: defaultStockByLocation, price: prevProduct.retailPrice }];
        }
        
        const updatedSkuVariants = newVariants.map(variant => {
            if (prevProduct.sku && Object.keys(variant.optionValues).length > 0) {
                const optionCodes = Object.values(variant.optionValues).map(v => v.substring(0,3).toUpperCase()).join('-');
                return { ...variant, sku: `${prevProduct.sku}-${optionCodes}` };
            }
            // Preserve the base SKU for the default variant if variants are disabled
            if (!prevProduct.hasVariants && newVariants.length === 1) {
                return { ...variant, sku: prevProduct.sku };
            }
            return variant;
        });

        return { ...prevProduct, variants: updatedSkuVariants };
    });
}, [product.options, product.hasVariants, product.sku]);


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
              ...(prev.dimensions || { length: 0, width: 0, height: 0 }),
              [dimension]: Number(value) || 0,
          }
      }));
  }
  
  const handleSelectChange = (id: keyof Product, value: string) => {
    if (id === 'productType') {
        const isPhysical = value === 'Physical';
        const isBundle = value === 'Bundle';
        setProduct(prev => ({ 
            ...prev, 
            productType: value as Product['productType'],
            requiresShipping: isPhysical || isBundle,
            inventoryTracking: isBundle ? 'Don\'t Track' : isPhysical ? 'Track Quantity' : 'Don\'t Track',
            hasVariants: (isPhysical || isBundle) ? prev.hasVariants : false,
        }));
    } else {
        setProduct(prev => ({ ...prev, [id]: value }));
    }
     if (id === 'inventoryTracking' && value === "Don't Track") {
        setProduct(prev => ({ 
            ...prev, 
            inventoryTracking: value as Product['inventoryTracking'],
            lowStockThreshold: undefined, 
            variants: prev.variants.map(v => ({...v, stockByLocation: []})),
            hasVariants: false, // Can't have variants if not tracking inventory
        }));
    }
  }
  
  const handleVisibilityChange = (channel: 'Online Store' | 'POS', checked: boolean) => {
    let currentVisibility = product.productVisibility || [];
    if (checked) {
        if (!currentVisibility.includes(channel)) {
            currentVisibility.push(channel);
        }
    } else {
        currentVisibility = currentVisibility.filter(c => c !== channel);
    }
    setProduct(prev => ({ ...prev, productVisibility: currentVisibility }));
  };


  const handleStatusChange = (value: Product['status']) => {
    setProduct((prev) => ({ ...prev, status: value }));
  };
  
  const handlePreorderPaymentChange = (field: keyof PreorderSettings, value: string | number) => {
    setProduct(prev => ({
      ...prev,
      preorderSettings: {
        ...(prev.preorderSettings || { paymentType: 'full' }),
        [field]: value
      }
    }));
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


  const handleVariantStockChange = (variantId: string, locationName: string, value: string) => {
    setProduct(prev => ({
        ...prev,
        variants: prev.variants.map(v => {
            if (v.id === variantId) {
                const newStockByLocation = [...v.stockByLocation];
                const locIndex = newStockByLocation.findIndex(loc => loc.locationName === locationName);
                
                if (locIndex !== -1) {
                    const newStock = { ...newStockByLocation[locIndex].stock, onHand: Number(value) || 0 };
                    newStock.available = newStock.onHand - newStock.reserved - newStock.damaged;
                    newStockByLocation[locIndex] = { ...newStockByLocation[locIndex], stock: newStock };
                } else {
                    // This case should ideally not happen if locations are managed properly
                    const newStock = { ...defaultStock, onHand: Number(value) || 0 };
                    newStock.available = newStock.onHand;
                    newStockByLocation.push({ locationName, stock: newStock });
                }

                return { ...v, stockByLocation: newStockByLocation };
            }
            return v;
        })
    }));
  };

  const handleVariantChange = (variantId: string, field: keyof Omit<ProductVariant, 'stockByLocation'>, value: string | number) => {
    setProduct(prev => ({
        ...prev,
        variants: prev.variants.map(v => {
            if (v.id === variantId) {
                const updatedVariant = { ...v };
                if (field === 'price') {
                    updatedVariant[field] = Number(value);
                } else {
                    (updatedVariant as any)[field] = value;
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
        console.error("AI flow 'suggestProductDescription' is offline:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "The AI model is currently offline. Please try again later.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSupplierSelect = (supplierId: string) => {
    setProduct(prev => {
        const currentIds = prev.supplierIds || [];
        const newIds = currentIds.includes(supplierId) 
            ? currentIds.filter(id => id !== supplierId)
            : [...currentIds, supplierId];
        return { ...prev, supplierIds: newIds };
    });
  }
  
  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const field = id.replace('seo-', '');
    setProduct(prev => ({
        ...prev,
        seo: { ...(prev.seo || {}), [field]: value }
    }));
  }

   const handleBundleItemChange = (index: number, field: keyof BundleItem, value: string | number) => {
        const newItems = [...(product.bundleItems || [])];
        const currentItem = { ...newItems[index] };
        if (field === 'quantity') {
            currentItem.quantity = Number(value) || 1;
        } else {
            currentItem.sku = value as string;
        }
        newItems[index] = currentItem;
        setProduct(prev => ({ ...prev, bundleItems: newItems }));
    };

    const addBundleItem = () => {
        setProduct(prev => ({ ...prev, bundleItems: [...(prev.bundleItems || []), { sku: '', quantity: 1 }] }));
    };

    const removeBundleItem = (index: number) => {
        setProduct(prev => ({ ...prev, bundleItems: (prev.bundleItems || []).filter((_, i) => i !== index) }));
    };
  
  const uploadedImages = product.images.filter(img => ('url' in img && img.url) || (img instanceof File)) as (ProductImage | File & { id: string, url?: string })[];

  const singleVariantOnHand = product.variants[0]?.stockByLocation[0]?.stock.onHand || 0;
  
  const handleBack = () => {
      router.back();
  }

  const handleSave = async () => {
    if (onSave) {
        onSave(product as Product);
        return;
    }

    setIsSaving(true);
    try {
        if (initialProduct?.sku) {
            await updateProduct(product as Product);
            toast({
                title: 'Product Updated',
                description: `${product.name} has been updated successfully.`,
            });
        } else {
            await addProduct(product as Product);
             toast({
                title: 'Product Created',
                description: `${product.name} has been created successfully.`,
            });
        }
        router.push('/dashboard/products');
    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'There was an error saving the product.',
        });
    } finally {
        setIsSaving(false);
    }
  }

  const { mainCategories, subCategoriesByParent } = React.useMemo(() => {
    const main: Category[] = [];
    const sub: Record<string, Category[]> = {};

    for (const category of categories) {
        if (category.parentId) {
            if (!sub[category.parentId]) {
                sub[category.parentId] = [];
            }
            sub[category.parentId].push(category);
        } else {
            main.push(category);
        }
    }
    return { mainCategories: main, subCategoriesByParent: sub };
  }, [categories]);

  return (
    <div className="space-y-6">
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
                            <SelectItem value="Bundle"><div className="flex items-center gap-2"><Layers className="h-4 w-4"/> Bundle</div></SelectItem>
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

          {product.productType === 'Bundle' && (
             <Card>
                <CardHeader>
                  <CardTitle>Bundle Items</CardTitle>
                  <CardDescription>Select the products and quantities that make up this bundle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(product.bundleItems || []).map((item, index) => (
                      <div key={index} className="flex items-end gap-2 p-2 border rounded-md">
                          <div className="flex-1 space-y-2">
                              <Label>Component Product</Label>
                                <Select onValueChange={(v) => handleBundleItemChange(index, 'sku', v)} value={item.sku}>
                                  <SelectTrigger><SelectValue placeholder="Select product..."/></SelectTrigger>
                                  <SelectContent>
                                      {allProducts.map(p => (
                                          <SelectItem key={p.sku} value={p.sku || ''}>{p.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2 w-24">
                              <Label>Quantity</Label>
                              <Input type="number" value={item.quantity} onChange={(e) => handleBundleItemChange(index, 'quantity', e.target.value)} placeholder="1" min={1} />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeBundleItem(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                      </div>
                  ))}
                  <Button variant="outline" onClick={addBundleItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Component</Button>
                </CardContent>
              </Card>
          )}

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
                        <RadioGroup value={showComparePrice ? "yes" : "no"} onValueChange={(v) => setShowComparePrice(v === 'yes')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="show-compare-no" />
                                <Label htmlFor="show-compare-no">No "compare at" price</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="show-compare-yes" />
                                <Label htmlFor="show-compare-yes">Show "compare at" price</Label>
                            </div>
                        </RadioGroup>
                    </div>
                 </div>
                {showComparePrice && (
                    <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Compare At Price ({product.currency})</Label>
                        <Input id="compareAtPrice" type="number" value={product.compareAtPrice || ''} onChange={handleNumberChange} placeholder="e.g. 40000"/>
                         <p className="text-xs text-muted-foreground">To show a sale, make this price higher than the retail price.</p>
                    </div>
                )}
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
                        <Checkbox id="hasVariants" checked={product.hasVariants} onCheckedChange={(c) => handleCheckboxChange('hasVariants', !!c)} disabled={product.inventoryTracking === "Don't Track"}/>
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
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>On Hand (Main)</TableHead>
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
                                             <Select value={variant.status} onValueChange={(v) => handleVariantChange(variant.id, 'status', v as ProductVariant['status'])}>
                                                <SelectTrigger className="h-8 min-w-[120px]">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="In Stock">In Stock</SelectItem>
                                                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                                                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                                                    <SelectItem value="Backordered">Backordered</SelectItem>
                                                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                aria-label="Variant SKU"
                                                value={variant.sku || ''}
                                                onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                                                placeholder="Variant SKU"
                                                className="h-8 min-w-[120px]"
                                            />
                                        </TableCell>
                                         <TableCell>
                                            <Input
                                                type="number"
                                                aria-label="Variant On Hand Stock"
                                                value={variant.stockByLocation[0]?.stock.onHand || 0}
                                                onChange={(e) => handleVariantStockChange(variant.id, 'Main Warehouse', e.target.value)}
                                                className="h-8 w-20"
                                                disabled={product.inventoryTracking === 'Don\'t Track'}
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

                     {product.inventoryTracking !== 'Don\'t Track' && !product.hasVariants && product.variants.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2">
                            <div className="space-y-2">
                                <Label htmlFor="onHand">On Hand Quantity</Label>
                                <Input id="onHand" type="number" value={singleVariantOnHand} onChange={(e) => handleVariantStockChange(product.variants[0].id, 'Main Warehouse', e.target.value)} />
                                <p className="text-xs text-muted-foreground">Total physical stock.</p>
                            </div>
                            {settings?.inventory?.enableLowStockAlerts && (
                                <div className="space-y-2">
                                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                    <Input id="lowStockThreshold" type="number" value={product.lowStockThreshold || ''} onChange={handleNumberChange} />
                                </div>
                            )}
                             <div className="space-y-2">
                                <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                                <Input id="unitOfMeasure" value={product.unitOfMeasure || 'unit'} onChange={handleInputChange} placeholder="e.g. kg, m, unit"/>
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
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
                <CardDescription>Customize how your product appears in search engine results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="seo-pageTitle">SEO Page Title</Label>
                    <Input id="seo-pageTitle" value={product.seo?.pageTitle || ''} onChange={handleSeoChange} />
                    <p className="text-xs text-muted-foreground">Defaults to product name if empty.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="seo-metaDescription">Meta Description</Label>
                    <Textarea id="seo-metaDescription" value={product.seo?.metaDescription || ''} onChange={handleSeoChange} maxLength={320} />
                    <p className="text-xs text-muted-foreground text-right">{product.seo?.metaDescription?.length || 0} / 320</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="seo-urlHandle">URL Handle</Label>
                    <div className="flex items-center">
                        <span className="text-sm text-muted-foreground p-2 rounded-l-md border border-r-0 bg-muted">/store/product/</span>
                        <Input id="seo-urlHandle" value={product.seo?.urlHandle || ''} onChange={handleSeoChange} className="rounded-l-none" />
                    </div>
                </div>
              </CardContent>
            </Card>
            </>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor="status">Listing Status</Label>
                        <Select value={product.status} onValueChange={handleStatusChange}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Set status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                                <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <Separator />
                    <div className='space-y-3'>
                        <Label>Visibility</Label>
                         <div className="flex items-start space-x-3">
                            <Checkbox id="visibility-online" checked={product.productVisibility?.includes('Online Store')} onCheckedChange={(c) => handleVisibilityChange('Online Store', !!c)}/>
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="visibility-online" className="flex items-center gap-2"><Laptop />Online Store</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show this product on your website.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Checkbox id="visibility-pos" checked={product.productVisibility?.includes('POS')} onCheckedChange={(c) => handleVisibilityChange('POS', !!c)}/>
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="visibility-pos" className="flex items-center gap-2"><Store />Point of Sale</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show this product in your physical store.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {product.status === 'Pre-Order' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pre-order Settings</CardTitle>
                  <CardDescription>Configure how you want to take payments for this pre-order product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <RadioGroup
                      value={product.preorderSettings?.paymentType || 'full'}
                      onValueChange={(v) => handlePreorderPaymentChange('paymentType', v)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="po-full" />
                        <Label htmlFor="po-full">Require payment in full</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deposit" id="po-deposit" />
                        <Label htmlFor="po-deposit">Require a deposit</Label>
                      </div>
                    </RadioGroup>
                    {product.preorderSettings?.paymentType === 'deposit' && (
                        <div className="space-y-2 pl-6">
                            <Label htmlFor="depositAmount">Deposit Amount ({product.currency})</Label>
                            <Input
                                id="depositAmount"
                                type="number"
                                value={product.preorderSettings.depositAmount || ''}
                                onChange={(e) => handlePreorderPaymentChange('depositAmount', Number(e.target.value))}
                                placeholder="e.g. 5000 or 20%"
                            />
                             <p className="text-xs text-muted-foreground">Can be a fixed amount or a percentage.</p>
                        </div>
                    )}
                </CardContent>
              </Card>
            )}
           <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={product.category} onValueChange={(v) => setProduct(p => ({...p, category: v}))}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {mainCategories.map(mainCat => (
                                    <SelectGroup key={mainCat.id}>
                                        <SelectLabel>{mainCat.name}</SelectLabel>
                                        {(subCategoriesByParent[mainCat.id] || []).map(subCat => (
                                            <SelectItem key={subCat.id} value={subCat.name}>{subCat.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Suppliers</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between h-auto min-h-10"
                                >
                                    <div className="flex flex-wrap gap-1">
                                        {(product.supplierIds || []).length > 0 
                                            ? (product.supplierIds || []).map(id => {
                                                const supplier = suppliers.find(s => s.id === id);
                                                return <Badge key={id} variant="secondary">{supplier?.name || id}</Badge>;
                                            })
                                            : "Select suppliers..."
                                        }
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search suppliers..." />
                                    <CommandEmpty>No suppliers found.</CommandEmpty>
                                    <CommandGroup>
                                        {suppliers.map((supplier) => (
                                        <CommandItem
                                            key={supplier.id}
                                            value={supplier.name}
                                            onSelect={() => handleSupplierSelect(supplier.id)}
                                        >
                                            <Check
                                            className={cn("mr-2 h-4 w-4",
                                                (product.supplierIds || []).includes(supplier.id) ? "opacity-100" : "opacity-0"
                                            )}
                                            />
                                            {supplier.name}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" value={product.tags?.join(', ') || ''} onChange={(e) => setProduct(p => ({...p, tags: e.target.value.split(',').map(t => t.trim())}))} placeholder="e.g. vibrant, summer, new" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
