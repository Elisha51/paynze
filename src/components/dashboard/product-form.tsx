
'use client';

import { ArrowLeft, PlusCircle, Trash2, Image as ImageIcon, Sparkles, Save, Package, Download, Clock, X, Store, Laptop, Check, ChevronsUpDown, Layers, Boxes, Loader2, Info } from 'lucide-react';
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

const defaultStock = { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 };
const defaultStockByLocation = [{ locationName: 'Main Warehouse', stock: defaultStock }];

const emptyProduct: Product = {
  productType: 'Physical',
  name: '',
  status: 'draft',
  images: [],
  inventoryTracking: 'Track Quantity',
  unitsOfMeasure: [{ name: 'Piece', isBaseUnit: true, contains: 1 }],
  requiresShipping: true,
  retailPrice: 0,
  currency: 'UGX',
  isTaxable: false,
  hasVariants: false,
  options: [{ name: '', values: [] }],
  variants: [
    { id: 'default-variant', unitOfMeasure: 'Piece', optionValues: {}, status: 'In Stock', stockByLocation: defaultStockByLocation }
  ],
  wholesalePricing: [],
  productVisibility: ['Online Store'],
  supplierIds: [],
};


// Helper function to generate variants from options and units
const generateVariants = (options: ProductOption[], units: UnitOfMeasure[]): ProductVariant[] => {
    let combinations: Record<string, string>[] = [{}];

    // First, generate combinations from product options (size, color, etc.)
    const activeOptions = options.filter(opt => opt.name && opt.values.length > 0);
    if (activeOptions.length > 0) {
        for (const option of activeOptions) {
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
    }
    
    // Now, cross-product with units of measure
    let finalVariants: ProductVariant[] = [];
    for (const combo of combinations) {
        for (const unit of units) {
            const idParts = [...Object.values(combo), unit.name].join('-').replace(/\s+/g, '-').toLowerCase();
            finalVariants.push({
                id: `var-${idParts}-${Date.now() % 1000}`,
                optionValues: combo,
                unitOfMeasure: unit.name,
                status: 'In Stock',
                stockByLocation: [],
            });
        }
    }

    return finalVariants;
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
  
  // Auto-update variants when options or units change
  useEffect(() => {
    if (!product.hasVariants && (product.unitsOfMeasure?.length || 0) <= 1) {
        // Simple product, ensure one variant exists for the base unit
        if (product.variants.length === 0) {
            setProduct(prev => ({...prev, variants: [ { id: 'default-variant', unitOfMeasure: prev.unitsOfMeasure[0].name, optionValues: {}, status: 'In Stock', stockByLocation: [] } ]}));
        }
        return;
    }
    
    const currentVariants = product.variants || [];
    const newVariantDefs = generateVariants(product.options || [], product.unitsOfMeasure || []);
    
    // Preserve existing data for variants that are still valid
    const updatedVariants = newVariantDefs.map(newVar => {
      const existing = currentVariants.find(oldVar => 
        oldVar.unitOfMeasure === newVar.unitOfMeasure && 
        JSON.stringify(oldVar.optionValues) === JSON.stringify(newVar.optionValues)
      );
      return existing ? { ...newVar, ...existing, id: existing.id } : newVar;
    });

    setProduct(prev => ({...prev, variants: updatedVariants}));

  }, [product.hasVariants, product.options, product.unitsOfMeasure]);

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

  const handleSelectChange = (id: keyof Product, value: string) => {
    setProduct(prev => ({ ...prev, [id]: value }));
  }
  
  const handleProductChange = (field: keyof Product, value: any) => {
     let productUpdates: Partial<Product> = { [field]: value };
      
    if (field === 'productType') {
        const isPhysical = value === 'Physical';
        productUpdates.requiresShipping = isPhysical;
        productUpdates.inventoryTracking = isPhysical ? 'Track Quantity' : 'Don\'t Track';
        if (!isPhysical) {
            productUpdates.hasVariants = false;
        }
    }
    
    if (field === 'inventoryTracking' && value === "Don't Track") {
      productUpdates.hasVariants = false;
    }

    setProduct(prev => ({
      ...prev,
      ...productUpdates
    }));
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


  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: string | number) => {
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
  
  const handleGenerateDescription = async () => {
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
            setProduct(prev => ({...prev, longDescription: result.description}));
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

  const handleUnitOfMeasureChange = (index: number, field: keyof UnitOfMeasure, value: string | number) => {
      const newUnits = [...(product.unitsOfMeasure || [])];
      (newUnits[index] as any)[field] = value;
      setProduct(prev => ({ ...prev, unitsOfMeasure: newUnits }));
  }

  const addUnitOfMeasure = () => {
      const newUnit = { name: '', contains: 1 };
      setProduct(prev => ({ ...prev, unitsOfMeasure: [...(prev.unitsOfMeasure || []), newUnit] }));
  }

  const removeUnitOfMeasure = (index: number) => {
      if (index === 0) return; // Cannot remove base unit
      setProduct(prev => ({...prev, unitsOfMeasure: (prev.unitsOfMeasure || []).filter((_, i) => i !== index)}));
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
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
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
                    <Label htmlFor="longDescription">Detailed Description</Label>
                     <Button variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
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
                    <FileUploader files={[]} onFilesChange={() => {}} />
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                    Define product variations (like size or color) and packaging units, then manage the price and SKU for each combination below.
                </CardDescription>
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
                                        <div className="space-y-1">
                                            <Label htmlFor={`option-name-${index}`}>Option Name</Label>
                                            <Input id={`option-name-${index}`} value={option.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} placeholder="e.g., Size"/>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`option-values-${index}`}>Option Values</Label>
                                            <Input id={`option-values-${index}`} value={option.values.join(', ')} onChange={(e) => handleOptionChange(index, 'value', e.target.value)} placeholder="e.g., Small, Medium, Large"/>
                                            <p className="text-xs text-muted-foreground">Separate values with a comma.</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="mt-6">
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {(product.options || []).length < 3 && (
                            <Button variant="outline" size="sm" onClick={addOption}><PlusCircle className="mr-2 h-4 w-4" /> Add another option</Button>
                        )}
                    </div>
                )}
                 <Separator />
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variant / Package</TableHead>
                                <TableHead>Price ({product.currency})</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(product.variants || []).map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-medium">
                                        {Object.keys(variant.optionValues).length > 0 ? Object.values(variant.optionValues).join(' / ') : 'Default'} 
                                        {(Object.keys(variant.optionValues).length > 0 && product.unitsOfMeasure.length > 1) ? ' - ' : ''}
                                        {product.unitsOfMeasure.length > 1 ? variant.unitOfMeasure : ''}
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" aria-label="Variant Price" value={variant.price ?? ''} onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)} placeholder={String(product.retailPrice)} className="h-8 min-w-[100px]"/>
                                    </TableCell>
                                    <TableCell>
                                        <Input aria-label="Variant SKU" value={variant.sku || ''} onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} placeholder="Variant SKU" className="h-8 min-w-[120px]"/>
                                    </TableCell>
                                     <TableCell>
                                        <Input type="number" aria-label="Variant On Hand Stock" value={variant.stockByLocation && variant.stockByLocation[0] ? variant.stockByLocation[0].stock.onHand : 0} disabled className="h-8 w-24 bg-muted"/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="retailPrice">Base Unit Price ({product.currency})</Label>
                    <Input id="retailPrice" type="number" value={product.retailPrice} onChange={handleNumberChange} placeholder="e.g. 35000"/>
                    <p className="text-xs text-muted-foreground">The default price for your smallest unit.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Compare At Price</Label>
                        <div className="flex items-center space-x-4 pt-2">
                            <RadioGroup value={showComparePrice ? "yes" : "no"} onValueChange={(v) => setShowComparePrice(v === 'yes')} className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="show-compare-no" />
                                    <Label htmlFor="show-compare-no" className="font-normal">Disabled</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="show-compare-yes" />
                                    <Label htmlFor="show-compare-yes" className="font-normal">Enabled</Label>
                                </div>
                            </RadioGroup>
                            {showComparePrice && (<Input id="compareAtPrice" type="number" value={product.compareAtPrice || ''} onChange={handleNumberChange} placeholder="e.g. 40000" className="w-full"/>)}
                        </div>
                        {showComparePrice && <p className="text-xs text-muted-foreground">To show a sale, make this price higher than the retail price.</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="costPerItem">Cost per item (Base Unit)</Label>
                    <Input id="costPerItem" type="number" value={product.costPerItem} onChange={handleNumberChange} placeholder="Enter cost" className="max-w-xs"/>
                    <p className="text-xs text-muted-foreground">Used for calculating profit margins.</p>
                </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Wholesale Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Wholesale tiers apply to the total quantity of the base unit (e.g., 'Pieces') in the cart, regardless of packaging.
                        </AlertDescription>
                    </Alert>
                    {/* Wholesale pricing form would go here */}
                </CardContent>
            </Card>

           <Card>
            <CardHeader>
                <CardTitle>Packaging</CardTitle>
                <CardDescription>Define how this product is sold (e.g., pieces, packs, boxes).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {(product.unitsOfMeasure || []).map((uom, index) => (
                        <Card key={index} className="p-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor={`uom-name-${index}`}>{index === 0 ? 'Base Unit Name' : 'Unit Name'}</Label>
                                    <Input id={`uom-name-${index}`} value={uom.name} onChange={(e) => handleUnitOfMeasureChange(index, 'name', e.target.value)} placeholder={index === 0 ? "e.g., Piece" : "e.g., Packet"} />
                                </div>
                                <div className="flex items-end gap-2">
                                  <div className="space-y-2 flex-1">
                                      <Label htmlFor={`uom-contains-${index}`}>Contains</Label>
                                      <Input 
                                        id={`uom-contains-${index}`} 
                                        type="number" 
                                        value={uom.contains} 
                                        onChange={(e) => handleUnitOfMeasureChange(index, 'contains', Number(e.target.value))} 
                                        placeholder={index > 0 ? `of ${product.unitsOfMeasure[index-1].name}s` : 'Base Unit'}
                                        disabled={index === 0}
                                      />
                                  </div>
                                   {index > 0 && (
                                        <Button variant="ghost" size="icon" onClick={() => removeUnitOfMeasure(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={addUnitOfMeasure}><PlusCircle className="mr-2 h-4 w-4" /> Add Packaging Unit</Button>
            </CardContent>
        </Card>
            
            <Card>
                <CardHeader><CardTitle>Inventory & Shipping</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Inventory Tracking</Label>
                         <Select value={product.inventoryTracking} onValueChange={(v) => handleProductChange('inventoryTracking', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Don't Track">Don't Track</SelectItem>
                                <SelectItem value="Track Quantity">Track Quantity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Initial stock quantities for each variant are set via a Purchase Order or Stock Adjustment after the product is created.
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                        <Label htmlFor="sku">Base Unit SKU</Label>
                        <Input id="sku" value={product.sku} onChange={handleInputChange} placeholder="e.g. TSHIRT-BLK" />
                         <p className="text-xs text-muted-foreground">SKUs for specific variants are set in the variants table.</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={product.status} onValueChange={(v) => handleProductChange('status', v as Product['status'])}>
                            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={product.category} onValueChange={(v) => setProduct(p => ({...p, category: v}))}>
                            <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
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
  );
}
