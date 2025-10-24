
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { ProductsTable } from '@/components/dashboard/products-table';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { suggestProductDescription } from '@/ai/flows/suggest-product-descriptions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';

export default function ProductsPage() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useState(() => {
    async function loadProducts() {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
    }
    loadProducts();
  });

  const handleSuggestDescription = async () => {
    if (!productName || !category) {
        toast({
            variant: "destructive",
            title: "Name and Category required",
            description: "Please enter a product name and category to generate a description.",
        });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await suggestProductDescription({ productName, category });
        setDescription(result.description);
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

  const handleSaveProduct = () => {
    if (!productName || !category) {
        toast({
            variant: "destructive",
            title: "Name and Category required",
            description: "Please enter a product name and category to save.",
        });
        return;
    }
    const newProduct: Product = {
        name: productName,
        sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        category: category,
        retailPrice: 0, // Default value, can be edited later
        wholesalePricing: [],
        stockQuantity: 0, // Default value
        variants: [],
        visibility: 'draft',
        images: [],
        discount: null,
    };

    setProducts(prevProducts => [newProduct, ...prevProducts]);
    
    toast({
        title: "Product Saved as Draft",
        description: `${productName} has been added to your products.`,
    });

    // Reset form and close dialog
    setProductName('');
    setCategory('');
    setDescription('');
    setIsDialogOpen(false);
  };


  const tabs = [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
  ];

  const cta = (
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details for your new product. It will be saved as a draft.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Kitenge Fabric" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Fabrics"/>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button variant="outline" size="sm" onClick={handleSuggestDescription} disabled={isGenerating}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Suggest'}
                </Button>
              </div>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" placeholder="A brief, appealing description of the product."/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSaveProduct}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );


  return (
    <DashboardPageLayout
        title="Products"
        tabs={tabs}
        cta={cta}
    >
        <DashboardPageLayout.TabContent value="all">
            <ProductsTable
                data={products}
                setData={setProducts}
                filter={{ column: 'visibility', value: 'published,draft' }}
                cardTitle='All Products'
                cardDescription='Manage your products and view their sales performance.'
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="active">
            <ProductsTable 
                data={products}
                setData={setProducts}
                filter={{ column: 'visibility', value: 'published' }}
                cardTitle='Active Products'
                cardDescription='View all products that are currently visible to customers.'
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="draft">
            <ProductsTable
                data={products}
                setData={setProducts}
                filter={{ column: 'visibility', value: 'draft' }}
                cardTitle='Draft Products'
                cardDescription='View all products that are not yet published.'
            />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="archived">
            <ProductsTable 
                data={products}
                setData={setProducts}
                filter={{ column: 'visibility', value: 'archived' }}
                cardTitle='Archived Products'
                cardDescription='View all products that have been archived.'
            />
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
