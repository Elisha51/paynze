
'use client';
import { useState, useEffect } from 'react';
import { ProductForm } from '@/components/dashboard/product-form';
import { getProductTemplates } from '@/services/templates';
import type { ProductTemplate, Product } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import * as Lucide from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

export default function AddProductPage() {
    const [step, setStep] = useState(0); // 0 for template selection, 1 for form
    const [templates, setTemplates] = useState<ProductTemplate[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);

    useEffect(() => {
        async function loadTemplates() {
            const fetchedTemplates = await getProductTemplates();
            setTemplates(fetchedTemplates);
        }
        loadTemplates();
    }, []);

    const handleSelectTemplate = (productData: Partial<Product>) => {
        setSelectedProduct(productData);
        setStep(1);
    }
    
    const startFromScratch = () => {
        setSelectedProduct(emptyProduct);
        setStep(1);
    }

    if (step === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8 md:hidden" asChild>
                        <Link href="/dashboard/products">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Products</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
                        <p className="text-muted-foreground">Start with a template or from scratch.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Choose a Template</CardTitle>
                        <CardDescription>Select a pre-configured template to get started quickly, or begin with a blank slate.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                         <Card 
                            className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center text-center p-4"
                            onClick={startFromScratch}
                        >
                            <div className="p-4 rounded-full bg-primary/10 mb-2">
                               <Lucide.FilePlus2 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold">Blank Product</h3>
                            <p className="text-sm text-muted-foreground">Start with no predefined settings.</p>
                        </Card>
                        {templates.map(template => (
                            <Card 
                                key={template.id} 
                                className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center text-center p-4"
                                onClick={() => handleSelectTemplate(template.product)}
                            >
                                <div className="p-4 rounded-full bg-primary/10 mb-2">
                                   <Icon name={template.icon} className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold">{template.name}</h3>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <ProductForm initialProduct={selectedProduct} />;
}
