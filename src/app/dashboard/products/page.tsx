
'use client';

import { PlusCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { ProductsTable } from '@/components/dashboard/products-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
  }

  const handleSaveProduct = (publish: boolean) => {
    if (!editingProduct) return;

    const finalProduct: Product = {
      ...editingProduct,
      visibility: publish ? 'published' : 'draft',
    };

    const productIndex = products.findIndex(p => p.sku === finalProduct.sku);

    if (productIndex > -1) {
      // Update existing product
      const updatedProducts = [...products];
      updatedProducts[productIndex] = finalProduct;
      setProducts(updatedProducts);
    } else {
      // Add new product
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
  
  const handleVisibilityChange = (value: 'draft' | 'published' | 'archived') => {
    setEditingProduct(prev => prev ? { ...prev, visibility: value } : null);
  };

  const tabs = [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
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
        <DashboardPageLayout.TabContent value="active">
            <ProductsTable 
                data={products}
                setData={setProducts}
                onEdit={handleOpenDialog}
                filter={{ column: 'visibility', value: 'published' }}
                cardTitle='Active Products'
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct?.name ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your product. You can save as a draft or publish immediately.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="retailPrice">Retail Price</Label>
                    <Input id="retailPrice" type="number" value={editingProduct.retailPrice} onChange={handleNumberInputChange} placeholder="e.g. 35000"/>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <Input id="stockQuantity" type="number" value={editingProduct.stockQuantity} onChange={handleNumberInputChange} placeholder="e.g. 100"/>
                 </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                 <Select onValueChange={(value: 'draft' | 'published' | 'archived') => handleVisibilityChange(value)} value={editingProduct.visibility}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleSaveProduct(false)}>Save Draft</Button>
            <Button type="button" onClick={() => handleSaveProduct(true)}>Save &amp; Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
