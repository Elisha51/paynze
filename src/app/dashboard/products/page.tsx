
'use client';

import { PlusCircle, Sparkles, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { ProductsTable } from '@/components/dashboard/products-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductVariant } from '@/lib/types';
import { getProducts } from '@/services/products';
import { Stepper, Step } from '@/components/ui/stepper';

const emptyProduct: Product = {
    name: '',
    sku: '',
    category: '',
    description: '',
    retailPrice: 0,
    wholesalePricing: [],
    stockQuantity: 0,
    variants: [],
    visibility: 'draft',
    images: [],
    discount: null,
};

const steps = [
    { label: "Details" },
    { label: "Media" },
    { label: "Pricing & Stock" },
    { label: "Variants" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

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
    } else {
      setEditingProduct({ 
        ...emptyProduct, 
        sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
    }
    setCurrentStep(0);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
    setCurrentStep(0);
  }

  const handleSaveProduct = (publish: boolean) => {
    if (!editingProduct) return;

    const finalProduct: Product = {
      ...editingProduct,
      visibility: publish ? 'published' : 'draft',
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
        title: `Product ${productIndex > -1 ? 'Updated' : 'Saved'}`,
        description: `${finalProduct.name} has been ${publish ? 'published.' : 'saved as a draft.'}`,
    });

    handleDialogClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditingProduct(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditingProduct(prev => prev ? { ...prev, [id]: Number(value) } : null);
  };

  const nextStep = () => setCurrentStep(prev => (prev < steps.length -1) ? prev + 1 : prev);
  const prevStep = () => setCurrentStep(prev => (prev > 0) ? prev - 1 : prev);

  const handleAddImage = () => {
    setEditingProduct(prev => prev ? ({ ...prev, images: [...prev.images, ''] }) : null);
  };

  const handleImageChange = (index: number, value: string) => {
    if (!editingProduct) return;
    const newImages = [...editingProduct.images];
    newImages[index] = value;
    setEditingProduct({ ...editingProduct, images: newImages });
  };
  
  const handleRemoveImage = (index: number) => {
    if (!editingProduct) return;
    const newImages = editingProduct.images.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = { optionName: 'New Variant', value: '', price: 0, stock: 0 };
    setEditingProduct(prev => prev ? ({ ...prev, variants: [...prev.variants, newVariant] }) : null);
  };
  
  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
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
            <DialogTitle>{editingProduct?.sku && editingProduct.name ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct?.sku && editingProduct.name ? `Editing ${editingProduct.name}` : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border-b">
            <Stepper currentStep={currentStep} steps={steps} />
          </div>

          {editingProduct && (
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-6">

              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={editingProduct.name} onChange={handleInputChange} placeholder="e.g. Kitenge Fabric" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={editingProduct.category} onChange={handleInputChange} placeholder="e.g. Fabrics"/>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button variant="outline" size="sm" onClick={handleSuggestDescription} disabled={isGenerating}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generating...' : 'Suggest'}
                      </Button>
                    </div>
                    <Textarea id="description" value={editingProduct.description || ''} onChange={handleInputChange} className="min-h-[100px]" placeholder="A brief, appealing description of the product."/>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Images</Label>
                    <Button variant="outline" size="sm" onClick={handleAddImage}>Add Image URL</Button>
                  </div>
                  <div className="space-y-2">
                    {editingProduct.images.map((img, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={img} 
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder="https://example.com/image.png"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveImage(index)}>
                          <X className="h-4 w-4"/>
                        </Button>
                      </div>
                    ))}
                    {editingProduct.images.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No images added yet.</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="retailPrice">Retail Price</Label>
                        <Input id="retailPrice" type="number" value={editingProduct.retailPrice} onChange={handleNumberInputChange} placeholder="e.g. 35000"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stockQuantity">Stock Quantity</Label>
                        <Input id="stockQuantity" type="number" value={editingProduct.stockQuantity} onChange={handleNumberInputChange} placeholder="e.g. 100"/>
                    </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Variants</Label>
                    <Button variant="outline" size="sm" onClick={handleAddVariant}>Add Variant</Button>
                  </div>
                   <div className="space-y-4">
                    {editingProduct.variants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md">
                            <div className="col-span-3 space-y-1">
                                <Label htmlFor={`variant-name-${index}`} className="text-xs">Type</Label>
                                <Input id={`variant-name-${index}`} value={variant.optionName} onChange={(e) => handleVariantChange(index, 'optionName', e.target.value)} placeholder="e.g. Color" />
                            </div>
                             <div className="col-span-3 space-y-1">
                                <Label htmlFor={`variant-value-${index}`} className="text-xs">Value</Label>
                                <Input id={`variant-value-${index}`} value={variant.value} onChange={(e) => handleVariantChange(index, 'value', e.target.value)} placeholder="e.g. Red" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor={`variant-price-${index}`} className="text-xs">Price</Label>
                                <Input id={`variant-price-${index}`} type="number" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor={`variant-stock-${index}`} className="text-xs">Stock</Label>
                                <Input id={`variant-stock-${index}`} type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} />
                            </div>
                            <div className="col-span-2">
                                <Button variant="destructive" size="icon" onClick={() => handleRemoveVariant(index)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                    {editingProduct.variants.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No variants added yet. Click &quot;Add Variant&quot; to create options like size or color.</p>}
                   </div>
                </div>
              )}

            </div>
          )}

          <div className="flex justify-between p-6 pt-0">
            {currentStep > 0 ? (
                <Button variant="outline" onClick={prevStep}>Back</Button>
            ) : <div></div>}
            
            {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>Next</Button>
            ) : (
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => handleSaveProduct(false)}>Save Draft</Button>
                    <Button type="button" onClick={() => handleSaveProduct(true)}>Save &amp; Publish</Button>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
