
'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Package } from 'lucide-react';
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
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { ProductTemplate } from '@/lib/types';

const emptyTemplate: Partial<ProductTemplate> = {
  name: '',
  description: '',
  icon: 'Package',
  product: {
    productType: 'Physical',
    requiresShipping: true,
    isTaxable: false,
    hasVariants: false,
  }
};

export function ProductTemplateForm() {
  const [template, setTemplate] = useState<Partial<ProductTemplate>>(emptyTemplate);
  const { toast } = useToast();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setTemplate(prev => ({...prev, [id]: value}));
  };

  const handleSave = () => {
    toast({
      title: "Template Saved",
      description: `The "${template.name}" template has been saved.`
    });
    // In a real app, you'd POST this to your API
    console.log("Saving template:", template);
  };
  

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/templates">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Templates</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Product Template</h1>
          <p className="text-muted-foreground">
            Design a new reusable template for your products.
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            This information will help you identify the template later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input 
              id="name" 
              placeholder="e.g., Standard T-Shirt"
              value={template.name || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., For all standard apparel with size and color variants."
              value={template.description || ''}
              onChange={handleInputChange}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input 
              id="icon" 
              placeholder="e.g., Shirt"
              value={template.icon || ''}
              onChange={handleInputChange}
            />
             <p className="text-xs text-muted-foreground">
                Choose any icon name from the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline">Lucide icon library</a>.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
