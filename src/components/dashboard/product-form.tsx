
'use client';

import { ArrowLeft, PlusCircle, Trash2, Image as ImageIcon, Sparkles, Save, Package, Download, Clock, X, Store, Laptop, Check, ChevronsUpDown, Layers, Boxes, Loader2, Info, PackageCheck } from 'lucide-react';
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
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Product, WholesalePrice, ProductVariant, ProductImage, ProductOption, Category, Supplier, UnitOfMeasure, CustomerGroup } from '@/lib/types';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from '../ui/checkbox';
import { RichTextEditor } from '../ui/rich-text-editor';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';
import type { OnboardingFormData } from '@/context/onboarding-context';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { getCategories } from '@/services/categories';
import { addProduct, updateProduct, getProducts } from '@/services/products';
import { getSuppliers } from '@/services/procurement';
import { getCustomerGroups } from '@/services/customer-groups';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { Separator } from '../ui/separator';

const defaultStock = { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 };
const defaultStockByLocation = [{ locationName: 'Main Warehouse', stock: defaultStock }];

const emptyProduct: Omit<Product, 'compareAtPrice' > & { compareAtPrice?: number} = {
  productType: 'Physical',
  name: '',
  shortDescription: '',
  longDescription: '',
  status: 'draft',
  images: [],
  inventoryTracking: 'Track Quantity',
  unitsOfMeasure: [{ name: 'Piece', isBaseUnit: true, contains: 1, sku: '' }],
  requiresShipping: true,
  currency: 'UGX',
  isTaxable: false,
  hasVariants: false,
  options: [{ name: '', values: [] }],
  variants: [],
  wholesalePricing: [],
  productVisibility: ['Online Store'],
  supplierIds: [],
};

const generateVariantCombinations = (options: ProductOption[]): Record<string, string>[] => {
    if (options.every(opt => !opt.name || opt.values.length === 0)) {
        return [{}];
    }
    let combinations: Record<string, string>[] = [{}];
    for (const option of options) {
        if (!option.name || option.values.length === 0) continue;
        const newCombinations: Record<string, string>[] = [];
        for (const combination of combinations) {
            for (const value of option.values) {
                newCombinations.push({
                    ...combination,
                    [option.name]: value,
                });
            }
        }
        combinations = newCombinations;
    }
    return combinations;
};

export function ProductForm({ initialProduct, onSave }: { initialProduct?: Partial<Product> | null, onSave?: (product: Product) => void }) {
  const [product, setProduct] = useState<Partial<Product>>({ ...emptyProduct, ...initialProduct });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setProduct(prev => ({ ...emptyProduct, ...prev, ...initialProduct }));
    
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    async function loadData() {
        const [fetchedCategories, fetchedSuppliers, fetchedCustomerGroups] = await Promise.all([
            getCategories(),
            getSuppliers(),
            getCustomerGroups(),
        ]);
        setCategories(fetchedCategories);
        setSuppliers(fetchedSuppliers);
        setCustomerGroups(fetchedCustomerGroups.filter(g => g.name !== 'default'));
    }
    loadData();
  }, [initialProduct]);

  const allSellableUnits = useMemo(() => {
    const variantCombos = product.hasVariants ? generateVariantCombinations(product.options || []) : [{}];
    const units = product.unitsOfMeasure || [];
    const results: ProductVariant[] = [];

    const baseUnit = units.find(u => u.isBaseUnit);
    if (!baseUnit) return [];

    for (const combo of variantCombos) {
      for (const unit of units) {
        const variantIdentifierParts = [...Object.values(combo), unit.name];
        const variantIdentifier = variantIdentifierParts.join('-').replace(/\s+/g, '-').toLowerCase();
        
        const existingVariant = product.variants?.find(v => v.id === `var-${variantIdentifier}`);
        
        results.push({
          id: existingVariant?.id || `var-${variantIdentifier}`,
          optionValues: combo,
          unitOfMeasure: unit.name,
          retailPrice: existingVariant?.retailPrice,
          compareAtPrice: existingVariant?.compareAtPrice,
          costPerItem: existingVariant?.costPerItem,
          sku: existingVariant?.sku ?? unit.sku,
          status: existingVariant?.status ?? 'In Stock',
          stockByLocation: existingVariant?.stockByLocation ?? defaultStockByLocation,
        });
      }
    }
    return results;
  }, [product.options, product.hasVariants, product.unitsOfMeasure, product.variants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProduct((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleDescriptionChange = (value: string) => {
    setProduct(prev => ({ ...prev, longDescription: value }));
  };
  
  const handleProductChange = (field: keyof Product, value: any) => {
    let productUpdates: Partial<Product> = { [field]: value };
    if (field === 'productType') {
        const isPhysical = value === 'Physical';
        productUpdates.requiresShipping = isPhysical;
        productUpdates.inventoryTracking = isPhysical ? 'Track Quantity' : "Don't Track";
        if (!isPhysical) {
            productUpdates.hasVariants = false;
        }
    }
    if (field === 'inventoryTracking' && value === "Don't Track") {
      productUpdates.hasVariants = false;
    }
    setProduct(prev => ({...prev, ...productUpdates}));
  };
  
  const handleOptionChange = (optionIndex: number, field: 'name' | 'value', value: string) => {
    const updatedOptions = [...(product.options || [])];
    if (field === 'name') {
      updatedOptions[optionIndex].name = value;
    } else {
      updatedOptions[optionIndex].values = value.split(',').map(v => v.trim()).filter(Boolean);
    }
    setProduct(prev => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    if ((product.options?.length || 0) < 3) {
      setProduct(prev => ({ ...prev, options: [...(prev.options || []), { name: '', values: [] }] }));
    }
  };

  const removeOption = (optionIndex: number) => {
    const updatedOptions = (product.options || []).filter((_, i) => i !== optionIndex);
    setProduct(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleUnitOfMeasureChange = (index: number, field: keyof UnitOfMeasure, value: string | number) => {
    const newUnits = [...(product.unitsOfMeasure || [])];
    (newUnits[index] as any)[field] = value;
    setProduct(prev => ({ ...prev, unitsOfMeasure: newUnits }));
  }

  const addUnitOfMeasure = () => {
    const newUnit: UnitOfMeasure = { name: '', contains: 1, sku: '' };
    setProduct(prev => ({ ...prev, unitsOfMeasure: [...(prev.unitsOfMeasure || []), newUnit] }));
  }

  const removeUnitOfMeasure = (index: number) => {
    if (index === 0) return;
    setProduct(prev => ({...prev, unitsOfMeasure: (prev.unitsOfMeasure || []).filter((_, i) => i !== index)}));
  }
  
  const handleGenerateDescription = async () => {
    if (!product.name || !product.category) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide a product name and category before generating a description." });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await suggestProductDescription({ productName: product.name, category: product.category });
        if (result.description) {
            setProduct(prev => ({...prev, longDescription: result.description}));
            toast({ title: "Description Generated", description: "The AI-powered description has been added." });
        }
    } catch (error) {
        console.error("AI flow 'suggestProductDescription' is offline:", error);
        toast({ variant: "destructive", title: "Generation Failed", description: "The AI model is currently offline. Please try again later." });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleVariantTableChange = (variantId: string, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(product.variants || [])];
    const variantIndex = newVariants.findIndex(v => v.id === variantId);

    if (variantIndex !== -1) {
        (newVariants[variantIndex] as any)[field] = value;
    } else {
        const sourceVariant = allSellableUnits.find(u => u.id === variantId);
        if (sourceVariant) {
            newVariants.push({ ...sourceVariant, [field]: value });
        }
    }
    setProduct(prev => ({ ...prev, variants: newVariants }));
  };

  const addWholesaleTier = () => {
      const newTier: WholesalePrice = {
          id: `ws-${Date.now()}-${(product.wholesalePricing || []).length}`,
          customerGroup: customerGroups[0]?.name || '',
          variantSku: allSellableUnits.find(u => u.sku)?.sku || '',
          minOrderQuantity: 1,
          price: 0,
      };
      setProduct(prev => ({...prev, wholesalePricing: [...(prev.wholesalePricing || []), newTier]}));
  };

  const updateWholesaleTier = (index: number, field: keyof WholesalePrice, value: string | number) => {
      const newTiers = [...(product.wholesalePricing || [])];
      (newTiers[index] as any)[field] = value;
      setProduct(prev => ({...prev, wholesalePricing: newTiers}));
  };

  const removeWholesaleTier = (index: number) => {
      setProduct(prev => ({...prev, wholesalePricing: (prev.wholesalePricing || []).filter((_, i) => i !== index)}));
  };
  
  const handleSave = async () => {
    if (onSave) {
        onSave(product as Product);
        return;
    }
    setIsSaving(true);
    try {
        const productToSave = { ...product, variants: allSellableUnits };
        if (initialProduct?.sku) {
            await updateProduct(productToSave as Product);
            toast({ title: 'Product Updated', description: `${product.name} has been updated successfully.` });
        } else {
            await addProduct(productToSave as Product);
            toast({ title: 'Product Created', description: `${product.name} has been created successfully.` });
        }
        router.push('/dashboard/products');
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'There was an error saving the product.' });
    } finally {
        setIsSaving(false);
    }
  }

  const { mainCategories, subCategoriesByParent } = useMemo(() => {
    const main: Category[] = [];
    const sub: Record<string, Category[]> = {};
    for (const category of categories) {
        if (category.parentId) {
            if (!sub[category.parentId]) sub[category.parentId] = [];
            sub[category.parentId].push(category);
        } else {
            main.push(category);
        }
    }
    return { mainCategories: main, subCategoriesByParent: sub };
  }, [categories]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" value={product.name} onChange={handleInputChange} placeholder="e.g., Kitenge Fabric"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea id="shortDescription" value={product.shortDescription || ''} onChange={handleInputChange} placeholder="A brief, catchy summary for product listings." maxLength={200}/>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Button variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                  <RichTextEditor id="longDescription" value={product.longDescription || ''} onChange={handleDescriptionChange} placeholder="Use this space for features, benefits, and care instructions."/>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Media</CardTitle></CardHeader>
              <CardContent className="space-y-4"><div className="space-y-2"><Label>Images</Label><FileUploader files={[]} onFilesChange={() => {}} /></div></CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Packaging &amp; Pricing</CardTitle>
                    <CardDescription>Define how this product is sold (e.g., pieces, packs) and set its base price.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(product.unitsOfMeasure || []).map((uom, index) => (
                        <Card key={index} className="p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor={`uom-name-${index}`} className="flex items-center gap-1.5">
                                        {index === 0 ? 'Base Unit Name' : 'Unit Name'}
                                        <Tooltip>
                                            <TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger>
                                            <TooltipContent><p className="max-w-xs">{index === 0 ? "The name of the smallest individual item you sell, e.g., 'Piece', 'Can', 'Bottle'." : "The name for this package, e.g., 'Pack of 6'."}</p></TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input id={`uom-name-${index}`} value={uom.name} onChange={(e) => handleUnitOfMeasureChange(index, 'name', e.target.value)} placeholder={index === 0 ? "e.g., Piece" : "e.g., Pack of 6"} />
                                </div>
                                {index > 0 && (
                                <div className="flex items-end gap-2">
                                    <div className="space-y-2 flex-1">
                                        <Label htmlFor={`uom-contains-${index}`} className="flex items-center gap-1.5">
                                            Contains ({product.unitsOfMeasure?.[0]?.name || 'base units'})
                                            <Tooltip>
                                                <TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger>
                                                <TooltipContent><p className="max-w-xs">How many base units are in this package.</p></TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input id={`uom-contains-${index}`} type="number" value={uom.contains} onChange={(e) => handleUnitOfMeasureChange(index, 'contains', Number(e.target.value))} />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeUnitOfMeasure(index)} type="button"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                                )}
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" onClick={addUnitOfMeasure} type="button"><PlusCircle className="mr-2 h-4 w-4" /> Add Packaging Unit</Button>
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Define product variations like size or color.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="hasVariants"
                    checked={product.hasVariants}
                    onCheckedChange={(c) => handleProductChange('hasVariants', !!c)}
                    disabled={product.productType !== 'Physical' || product.inventoryTracking === "Don't Track"}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="hasVariants" className="flex items-center gap-1.5">This product has variants
                        <Tooltip>
                            <TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger>
                            <TooltipContent><p className="max-w-xs">Offer different versions of this product, like sizes, colors, or materials.</p></TooltipContent>
                        </Tooltip>
                    </Label>
                  </div>
                </div>
                {product.hasVariants && (
                  <div className="space-y-4 pl-8 border-l">
                    <h4 className="font-medium">Options</h4>
                    {(product.options || []).map((option, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="space-y-1"><Label htmlFor={`option-name-${index}`}>Option Name</Label><Input id={`option-name-${index}`} value={option.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} placeholder="e.g., Size"/></div>
                            <div className="space-y-1"><Label htmlFor={`option-values-${index}`}>Option Values</Label><Input id={`option-values-${index}`} value={option.values.join(', ')} onChange={(e) => handleOptionChange(index, 'value', e.target.value)} placeholder="e.g., Small, Medium, Large"/><p className="text-xs text-muted-foreground">Separate values with a comma.</p></div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeOption(index)} type="button" className="mt-6"><X className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </Card>
                    ))}
                    {(product.options || []).length < 3 && (<Button variant="outline" size="sm" onClick={addOption} type="button"><PlusCircle className="mr-2 h-4 w-4" /> Add another option</Button>)}
                  </div>
                )}
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Variants &amp; Pricing</CardTitle>
                    <CardDescription>Manage SKU, price, and stock for each sellable unit of this product.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variant</TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-1.5">SKU 
                                    <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent>Unique code to track this specific item.</TooltipContent></Tooltip>
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-1.5">Cost per item 
                                      <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent>Your cost for the item. Used for profit calculation.</TooltipContent></Tooltip>
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-1.5">Retail Price ({settings?.currency || 'UGX'})
                                      <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent>The standard price for this item.</TooltipContent></Tooltip>
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center gap-1.5">Compare At Price
                                      <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent>An optional higher price to show a sale.</TooltipContent></Tooltip>
                                  </div>
                                </TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allSellableUnits.map(variant => {
                                const matchingProductVariant = product.variants?.find(v => v.id === variant.id) || variant;
                                return (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>
                                                {Object.values(variant.optionValues).join(' / ') || product.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{variant.unitOfMeasure}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="text"
                                            value={matchingProductVariant.sku || ''}
                                            onChange={(e) => handleVariantTableChange(variant.id, 'sku', e.target.value)}
                                            className="w-32"
                                            placeholder="SKU-123"
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <Input
                                            type="number"
                                            value={matchingProductVariant.costPerItem || ''}
                                            onChange={(e) => handleVariantTableChange(variant.id, 'costPerItem', Number(e.target.value))}
                                            className="w-28"
                                            placeholder="e.g., 20000"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={matchingProductVariant.retailPrice || ''}
                                            onChange={(e) => handleVariantTableChange(variant.id, 'retailPrice', Number(e.target.value))}
                                            className="w-28"
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <Input
                                            type="number"
                                            value={matchingProductVariant.compareAtPrice || ''}
                                            onChange={(e) => handleVariantTableChange(variant.id, 'compareAtPrice', Number(e.target.value))}
                                            className="w-28"
                                        />
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Input
                                            type="number"
                                            value={matchingProductVariant.stockByLocation?.[0]?.stock.onHand || ''}
                                            onChange={(e) => handleVariantTableChange(variant.id, 'stockByLocation', [{ locationName: 'Main Warehouse', stock: { ...defaultStock, onHand: Number(e.target.value), available: Number(e.target.value) }}])}
                                            className="w-20 ml-auto"
                                            disabled={product.inventoryTracking === "Don't Track"}
                                        />
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Wholesale Pricing</CardTitle>
                    <CardDescription>Offer different prices to different customer groups for specific products and quantities.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    {(product.wholesalePricing || []).map((tier, index) => (
                        <Card key={tier.id || index} className="p-4 relative">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeWholesaleTier(index)}>
                                <X className="h-4 w-4 text-destructive" />
                            </Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Customer Group</Label>
                                    <Select value={tier.customerGroup} onValueChange={(v) => updateWholesaleTier(index, 'customerGroup', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {customerGroups.map(cg => <SelectItem key={cg.id} value={cg.name}>{cg.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Product/Variant</Label>
                                    <Select value={tier.variantSku} onValueChange={(v) => updateWholesaleTier(index, 'variantSku', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select one..."/></SelectTrigger>
                                        <SelectContent>
                                            {allSellableUnits.filter(u => u.sku).map(unit => (
                                                <SelectItem key={unit.sku} value={unit.sku!}>
                                                    {Object.values(unit.optionValues).join(' / ') || product.name} ({unit.unitOfMeasure})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">Min. Quantity
                                        <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent>Minimum quantity to get this price.</TooltipContent></Tooltip>
                                    </Label>
                                    <Input type="number" value={tier.minOrderQuantity} onChange={(e) => updateWholesaleTier(index, 'minOrderQuantity', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                     <Label className="flex items-center gap-1.5">Price per unit
                                        <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent>The special wholesale price for this tier.</TooltipContent></Tooltip>
                                    </Label>
                                    <Input type="number" value={tier.price} onChange={(e) => updateWholesaleTier(index, 'price', Number(e.target.value))} />
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" onClick={addWholesaleTier} type="button">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Pricing Tier
                    </Button>
                </CardContent>
             </Card>

          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="flex items-center gap-1.5">Status
                                <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent><p>"Published" is visible to customers, "Draft" is hidden.</p></TooltipContent></Tooltip>
                            </Label>
                            <Select value={product.status} onValueChange={(v) => handleProductChange('status', v as Product['status'])}>
                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productType" className="flex items-center gap-1.5">Product Type
                                <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent><p>Physical (shipped), Digital (downloadable), or Service (non-shippable).</p></TooltipContent></Tooltip>
                            </Label>
                            <Select value={product.productType} onValueChange={(v) => handleProductChange('productType', v)}>
                                <SelectTrigger id="productType"><SelectValue placeholder="Select product type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Physical">Physical</SelectItem>
                                    <SelectItem value="Digital">Digital</SelectItem>
                                    <SelectItem value="Service">Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={product.category} onValueChange={(v) => setProduct(p => ({...p, category: v}))}>
                            <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                            {mainCategories.map(mainCat => (<SelectGroup key={mainCat.id}><SelectLabel>{mainCat.name}</SelectLabel>{(subCategoriesByParent[mainCat.id] || []).map(subCat => (<SelectItem key={subCat.id} value={subCat.name}>{subCat.name}</SelectItem>))}</SelectGroup>))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                         <Label className="flex items-center gap-1.5">Product Visibility
                            <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent><p>Where this product can be sold.</p></TooltipContent></Tooltip>
                         </Label>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center space-x-2"><Checkbox id="vis-online" checked={product.productVisibility?.includes('Online Store')} /><Label htmlFor="vis-online" className="font-normal flex items-center gap-2"><Laptop/> Online Store</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="vis-pos" disabled/><Label htmlFor="vis-pos" className="font-normal flex items-center gap-2 opacity-50"><Store/> Point of Sale (coming soon)</Label></div>
                         </div>
                     </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">Inventory Tracking
                      <Tooltip><TooltipTrigger asChild><button type="button"><Info className="h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger><TooltipContent><p className="max-w-xs">"Track Quantity" enables stock management. "Don't Track" sets inventory to unlimited.</p></TooltipContent></Tooltip>
                    </Label>
                    <Select value={product.inventoryTracking} onValueChange={(v) => handleProductChange('inventoryTracking', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Track Quantity">Track Quantity</SelectItem>
                        <SelectItem value="Don't Track">Don't Track</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Taxation</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex items-center space-x-2">
                      <Checkbox id="isTaxable" checked={product.isTaxable} onCheckedChange={(c) => handleProductChange('isTaxable', !!c)} />
                      <Label htmlFor="isTaxable">Charge tax on this product</Label>
                  </div>
                </CardContent>
            </Card>

          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
