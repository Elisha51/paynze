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
import type { Product, WholesalePrice, ProductVariant, ProductImage, ProductOption, PreorderSettings, Category, Supplier, UnitOfMeasure } from '@/lib/types';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const defaultStock = { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 };
const defaultStockByLocation = [{ locationName: 'Main Warehouse', stock: defaultStock }];

const emptyProduct: Product = {
  productType: 'Physical',
  name: '',
  shortDescription: '',
  longDescription: '',
  status: 'draft',
  images: [],
  inventoryTracking: 'Track Quantity',
  unitsOfMeasure: [{ name: 'Piece', isBaseUnit: true, contains: 1, price: 0, sku: '' }],
  requiresShipping: true,
  retailPrice: 0,
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
  const [product, setProduct] = useState<Product>({ ...emptyProduct, ...initialProduct });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showComparePrice, setShowComparePrice] = useState(!!initialProduct?.compareAtPrice);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setProduct(prev => ({ ...emptyProduct, ...prev, ...initialProduct }));
    setShowComparePrice(!!initialProduct?.compareAtPrice);
    
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    async function loadData() {
        const [fetchedCategories, fetchedSuppliers] = await Promise.all([
            getCategories(),
            getSuppliers(),
        ]);
        setCategories(fetchedCategories);
        setSuppliers(fetchedSuppliers);
    }
    loadData();
  }, [initialProduct]);

  const allSellableUnits = useMemo(() => {
    const variantCombos = generateVariantCombinations(product.options);
    const units = product.unitsOfMeasure;
    const results: (ProductVariant & { unit: UnitOfMeasure })[] = [];
    for (const combo of variantCombos) {
      for (const unit of units) {
        const idParts = [...Object.values(combo), unit.name].join('-').replace(/\s+/g, '-').toLowerCase();
        
        const existingVariant = product.variants.find(v => 
          JSON.stringify(v.optionValues) === JSON.stringify(combo) && v.unit?.name === unit.name
        );
        
        results.push({
          id: existingVariant?.id || `var-${idParts}`,
          optionValues: combo,
          unit,
          price: existingVariant?.price ?? unit.price ?? 0,
          sku: existingVariant?.sku ?? unit.sku ?? '',
          status: existingVariant?.status ?? 'In Stock',
          stockByLocation: existingVariant?.stockByLocation ?? []
        });
      }
    }
    return results;
  }, [product.options, product.unitsOfMeasure, product.variants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const newUnit: UnitOfMeasure = { name: '', contains: 1, price: 0, sku: '' };
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
                <CardTitle>Variants</CardTitle>
                <CardDescription>Define product variations like size or color. The table below will update automatically.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox id="hasVariants" checked={product.hasVariants} onCheckedChange={(c) => handleProductChange('hasVariants', !!c)} disabled={product.productType !== 'Physical'}/>
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="hasVariants">This product has variants</Label>
                    <p className="text-sm text-muted-foreground">Offer different versions of this product, like sizes or colors.</p>
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
                          <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="mt-6"><X className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </Card>
                    ))}
                    {(product.options || []).length < 3 && (<Button variant="outline" size="sm" onClick={addOption}><PlusCircle className="mr-2 h-4 w-4" /> Add another option</Button>)}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Packaging & Pricing</CardTitle>
                <CardDescription>Define how this product is sold (e.g., pieces, packs) and set the price for each.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {(product.unitsOfMeasure || []).map((uom, index) => (
                    <Card key={index} className="p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`uom-name-${index}`} className="flex items-center gap-1.5">
                            {index === 0 ? 'Base Unit Name' : 'Unit Name'}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {index === 0 ? "The name of the smallest individual item you sell, e.g., 'Piece', 'Can', 'Bottle'." : "The name for this package, e.g., 'Pack of 6'."}
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input id={`uom-name-${index}`} value={uom.name} onChange={(e) => handleUnitOfMeasureChange(index, 'name', e.target.value)} placeholder={index === 0 ? "e.g., Piece" : "e.g., Pack of 6"} />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor={`uom-contains-${index}`} className="flex items-center gap-1.5">
                              {index === 0 ? 'Contains' : `Contains (${product.unitsOfMeasure?.[0]?.name || 'base units'})`}
                              <Tooltip>
                                <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent>How many base units are in this package.</TooltipContent>
                              </Tooltip>
                            </Tooltip>
                          </Label>
                          <Input id={`uom-contains-${index}`} type="number" value={uom.contains} onChange={(e) => handleUnitOfMeasureChange(index, 'contains', Number(e.target.value))} disabled={index === 0}/>
                        </div>
                         {index > 0 && (<Button variant="ghost" size="icon" onClick={() => removeUnitOfMeasure(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addUnitOfMeasure}><PlusCircle className="mr-2 h-4 w-4" /> Add Packaging Unit</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Wholesale Pricing</CardTitle></CardHeader>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Variants & Pricing</CardTitle>
                <CardDescription>Manage the SKU and price for every combination of variants and packaging.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Variant</TableHead><TableHead>Unit</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {allSellableUnits.map((item, index) => {
                      const variantName = product.hasVariants ? Object.values(item.optionValues).join(' / ') : product.name;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{variantName}</TableCell>
                          <TableCell>{item.unit.name}</TableCell>
                          <TableCell><Input value={item.unit.sku || ''} onChange={(e) => handleUnitOfMeasureChange(product.unitsOfMeasure.findIndex(u => u.name === item.unit.name), 'sku', e.target.value)} className="h-8" placeholder="Enter SKU" /></TableCell>
                          <TableCell className="text-right"><Input type="number" value={item.unit.price || ''} onChange={(e) => handleUnitOfMeasureChange(product.unitsOfMeasure.findIndex(u => u.name === item.unit.name), 'price', Number(e.target.value))} className="h-8 w-32 text-right" placeholder="0.00" /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Inventory & Shipping</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Inventory</Label>
                  <Alert><Info className="h-4 w-4" /><AlertDescription>Stock is managed in the "Inventory" tab on the main product details page after saving.</AlertDescription></Alert>
                </div>
                {product.hasVariants === false && (
                    <>
                    <Separator/>
                      <div className="space-y-2">
                        <Label>Inventory</Label>
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Stock is managed per variant in the table above.
                            </AlertDescription>
                        </Alert>
                      </div>
                    </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={product.status} onValueChange={(v) => handleProductChange('status', v as Product['status'])}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                  </Select>
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
