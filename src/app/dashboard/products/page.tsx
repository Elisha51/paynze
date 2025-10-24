
'use client';

import { PlusCircle, Sparkles, X, Trash2, Video, Image as ImageIcon, Box, Download, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { ProductsTable } from '@/components/dashboard/products-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductVariant, ProductImage } from '@/lib/types';
import { getProducts } from '@/services/products';
import { Stepper, Step } from '@/components/ui/stepper';
import { FileUploader } from '@/components/ui/file-uploader';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

const emptyProduct: Product = {
    productType: 'Physical',
    name: '',
    sku: '',
    category: '',
    description: '',
    retailPrice: 0,
    wholesalePricing: [],
    stockQuantity: 0,
    trackStock: true,
    variants: [],
    visibility: 'draft',
    images: [],
    videoUrl: '',
    discount: null,
    requiresShipping: true,
    weight: 0,
};

const wizardSteps = [
    { label: "Type" },
    { label: "Details" },
    { label: "Options" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasVariants, setHasVariants] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    async function loadProducts() {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  const handleSuggestDescription = async () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.category) {
        toast({
            variant: "destructive",
            title: "Name and Category required",
            description: "Please enter a product name and category to generate a description.",
        });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await suggestProductDescription({ productName: editingProduct.name, category: editingProduct.category });
        setEditingProduct(prev => prev ? { ...prev, description: result.description } : null);
    } catch (error) {
        console.error("Failed to generate description:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "Could not generate a description at this time. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
      setHasVariants(product.variants.length > 0);
    } else {
      setEditingProduct({ 
        ...emptyProduct, 
        sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
      setHasVariants(false);
    }
    setCurrentStep(0);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
    setCurrentStep(0);
  }

  const handleSaveProduct = () => {
    if (!editingProduct) return;

    // This is a prototype, so we're not actually uploading files.
    const finalImages = editingProduct.images.map((img) => {
      if (img instanceof File) {
        return {
          id: `img-${Date.now()}-${Math.random()}`,
          url: URL.createObjectURL(img),
        };
      }
      return img;
    });

    const finalProduct: Product = {
      ...editingProduct,
      images: finalImages as ProductImage[],
      visibility: 'draft', // All new products from wizard are drafts
      variants: hasVariants ? editingProduct.variants : [],
    };

    const productIndex = products.findIndex(p => p.sku === finalProduct.sku);

    if (productIndex > -1) {
      const updatedProducts = [...products];
      updatedProducts[productIndex] = finalProduct;
      setProducts(updatedProducts);
    } else {
      setProducts(prevProducts => [finalProduct, ...prevProducts]);
    }
    
    toast({
        title: `Product Saved as Draft`,
        description: `${finalProduct.name} has been created. You can now add more details.`,
    });

    handleDialogClose();
    // In a real app, you would now redirect to the full edit page for this product:
    // router.push(`/dashboard/products/${finalProduct.sku}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditingProduct(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditingProduct(prev => prev ? { ...prev, [id]: Number(value) } : null);
  };

  const handleCheckboxChange = (id: 'trackStock' | 'requiresShipping', checked: boolean) => {
     setEditingProduct(prev => prev ? { ...prev, [id]: checked } : null);
  }

  const nextStep = () => setCurrentStep(prev => (prev < wizardSteps.length -1) ? prev + 1 : prev);
  const prevStep = () => setCurrentStep(prev => (prev > 0) ? prev - 1 : prev);

  const handleFilesChange = (newFiles: (File | ProductImage)[]) => {
     if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, images: newFiles });
  }

  const handleAddVariant = () => {
    const newVariant: ProductVariant = { id: `var-${Date.now()}`, optionName: 'Size', value: 'Small', price: 0, stock: 0, imageIds: [] };
    setEditingProduct(prev => prev ? ({ ...prev, variants: [...prev.variants, newVariant] }) : null);
  };
  
  const handleVariantChange = (index: number, field: keyof Omit<ProductVariant, 'id' | 'imageIds'>, value: string | number) => {
    if (!editingProduct) return;
    const newVariants = [...editingProduct.variants];
    (newVariants[index] as any)[field] = value;
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };
  
  const handleRemoveVariant = (index: number) => {
    if (!editingProduct) return;
    const newVariants = editingProduct.variants.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleProductTypeChange = (value: Product['productType']) => {
    if (!editingProduct) return;
    const isPhysical = value === 'Physical';
    setEditingProduct({
      ...editingProduct,
      productType: value,
      trackStock: isPhysical,
      requiresShipping: isPhysical
    });
  }

  const tabs = [
      { value: 'all', label: 'All' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
  ];

  const cta = (
     <Button onClick={() => handleOpenDialog()}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Product
      </Button>
  );

  return (
    <>
    <DashboardPageLayout
        title="Products"
        tabs={tabs}
        cta={cta}
    >
        <DashboardPageLayout.TabContent value="all">
            <ProductsTable
                data={products}
                setData={setProducts}
                onEdit={handleOpenDialog}
                filter={{ column: 'visibility', value: 'published,draft' }}
                cardTitle='All Products'
                cardDescription='Manage all your active and draft products.'
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="published">
            <ProductsTable 
                data={products}
                setData={setProducts}
                onEdit={handleOpenDialog}
                filter={{ column: 'visibility', value: 'published' }}
                cardTitle='Published Products'
                cardDescription='View all products that are currently visible to customers.'
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="draft">
            <ProductsTable
                data={products}
                setData={setProducts}
                onEdit={handleOpenDialog}
                filter={{ column: 'visibility', value: 'draft' }}
                cardTitle='Draft Products'
                cardDescription='View all products that are not yet published.'
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="archived">
            <ProductsTable 
                data={products}
                setData={setProducts}
                onEdit={handleOpenDialog}
                filter={{ column: 'visibility', value: 'archived' }}
                cardTitle='Archived Products'
                cardDescription='View all products that have been archived.'
            />
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>

    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add a New Product</DialogTitle>
            <DialogDescription>
             Follow the steps to quickly create a new product. You can add more details later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border-b">
            <Stepper currentStep={currentStep} steps={wizardSteps} />
          </div>

          {editingProduct && (
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-6">

              {currentStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">What are you selling?</h3>
                  <RadioGroup value={editingProduct.productType} onValueChange={handleProductTypeChange}>
                      <Label htmlFor="physical" className="flex items-start gap-4 border p-4 rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="Physical" id="physical" className="mt-1"/>
                        <div className="grid gap-1.5">
                          <span className="font-semibold flex items-center gap-2"><Box className="h-5 w-5"/> Physical Product</span>
                          <span className="text-sm text-muted-foreground">A product you ship or deliver. Requires shipping and inventory tracking.</span>
                        </div>
                      </Label>
                      <Label htmlFor="digital" className="flex items-start gap-4 border p-4 rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="Digital" id="digital" className="mt-1"/>
                        <div className="grid gap-1.5">
                          <span className="font-semibold flex items-center gap-2"><Download className="h-5 w-5"/> Digital Product</span>
                          <span className="text-sm text-muted-foreground">A downloadable file like an e-book, music, or software license.</span>
                        </div>
                      </Label>
                      <Label htmlFor="service" className="flex items-start gap-4 border p-4 rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="Service" id="service" className="mt-1"/>
                        <div className="grid gap-1.5">
                          <span className="font-semibold flex items-center gap-2"><Wrench className="h-5 w-5"/> Service</span>
                          <span className="text-sm text-muted-foreground">A non-physical item like a consultation, repair, or event ticket.</span>
                        </div>
                      </Label>
                  </RadioGroup>
                </div>
              )}

              {currentStep === 1 && (
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input id="name" value={editingProduct.name} onChange={handleInputChange} placeholder="e.g. Kitenge Fabric" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="retailPrice">Price *</Label>
                        <Input id="retailPrice" type="number" value={editingProduct.retailPrice} onChange={handleNumberInputChange} placeholder="e.g. 35000"/>
                    </div>
                     <div className="space-y-4">
                        <Label>Images *</Label>
                        <FileUploader 
                            files={editingProduct.images as (File | ProductImage)[]}
                            onFilesChange={handleFilesChange}
                            maxFiles={5}
                        />
                    </div>

                    {editingProduct.productType === 'Physical' && (
                        <>
                           <div className="space-y-3 p-4 border rounded-md">
                                <Label className="font-semibold">Inventory</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="trackStock" checked={editingProduct.trackStock} onCheckedChange={(c) => handleCheckboxChange('trackStock', !!c)} />
                                    <Label htmlFor="trackStock" className="text-sm font-normal">Track stock quantity</Label>
                                </div>
                                {editingProduct.trackStock && (
                                     <div className="space-y-2 pl-6">
                                        <Label htmlFor="stockQuantity">Quantity</Label>
                                        <Input id="stockQuantity" type="number" value={editingProduct.stockQuantity} onChange={handleNumberInputChange} placeholder="e.g. 100"/>
                                    </div>
                                )}
                           </div>
                           <div className="space-y-3 p-4 border rounded-md">
                                <Label className="font-semibold">Shipping</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="requiresShipping" checked={editingProduct.requiresShipping} onCheckedChange={(c) => handleCheckboxChange('requiresShipping', !!c)} />
                                    <Label htmlFor="requiresShipping" className="text-sm font-normal">This product requires shipping</Label>
                                </div>
                                {editingProduct.requiresShipping && (
                                     <div className="space-y-2 pl-6">
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input id="weight" type="number" value={editingProduct.weight} onChange={handleNumberInputChange} placeholder="e.g. 0.5"/>
                                    </div>
                                )}
                           </div>
                        </>
                    )}

                    {editingProduct.productType === 'Digital' && (
                      <div className="space-y-2">
                        <Label htmlFor="digitalFileUrl">File Upload *</Label>
                        {/* This would be a real file uploader, for now it's an input */}
                        <Input id="digitalFileUrl" placeholder="Paste a link to the downloadable file"/>
                         <p className="text-xs text-muted-foreground">Upload your e-book, music file, etc.</p>
                      </div>
                    )}
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Does this product have options?</h3>
                  <p className="text-sm text-muted-foreground">Add options like size, color, or material. You can manage price and stock for each combination later.</p>
                  
                  <RadioGroup value={hasVariants ? 'yes' : 'no'} onValueChange={(val) => setHasVariants(val === 'yes')}>
                    <Label htmlFor="no-variants" className="flex items-center gap-4 border p-4 rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                      <RadioGroupItem value="no" id="no-variants" />
                      <span>No, this is a simple product.</span>
                    </Label>
                     <Label htmlFor="yes-variants" className="flex items-start gap-4 border p-4 rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary cursor-pointer">
                      <RadioGroupItem value="yes" id="yes-variants" className="mt-1"/>
                       <div className="grid gap-1.5 w-full">
                          <span>Yes, this product has options.</span>
                           {hasVariants && (
                              <div className="mt-4 space-y-4">
                                  {editingProduct.variants.map((variant, index) => (
                                      <div key={variant.id} className="grid grid-cols-12 gap-2 items-end">
                                          <div className="col-span-5 space-y-1">
                                              <Label htmlFor={`variant-name-${index}`} className="text-xs">Option Name</Label>
                                              <Input id={`variant-name-${index}`} value={variant.optionName} onChange={(e) => handleVariantChange(index, 'optionName', e.target.value)} placeholder="e.g. Color" />
                                          </div>
                                          <div className="col-span-5 space-y-1">
                                              <Label htmlFor={`variant-value-${index}`} className="text-xs">Option Values</Label>
                                              <Input id={`variant-value-${index}`} value={variant.value} onChange={(e) => handleVariantChange(index, 'value', e.target.value)} placeholder="e.g. Red, Blue, Green" />
                                              <p className="text-xs text-muted-foreground">Separate values with a comma.</p>
                                          </div>
                                          <div className="col-span-2 flex items-end">
                                              <Button variant="destructive" size="icon" onClick={() => handleRemoveVariant(index)}>
                                                  <Trash2 className="h-4 w-4"/>
                                              </Button>
                                          </div>
                                      </div>
                                  ))}
                                  <Button variant="outline" size="sm" onClick={handleAddVariant}>+ Add another option</Button>
                              </div>
                           )}
                       </div>
                    </Label>
                  </RadioGroup>
                </div>
              )}

            </div>
          )}

          <div className="flex justify-between p-6 pt-0">
            {currentStep > 0 ? (
                <Button variant="outline" onClick={prevStep}>Back</Button>
            ) : <div></div>}
            
            {currentStep < wizardSteps.length - 1 ? (
                <Button onClick={nextStep}>Next</Button>
            ) : (
                <Button type="button" onClick={handleSaveProduct}>Save and Finish</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
