
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Package, PlusCircle, Trash2, X } from 'lucide-react';
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
import type { ProductTemplate, Product, ProductOption } from '@/lib/types';
import * as Lucide from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';

const emptyTemplate: Partial<ProductTemplate> = {
  name: '',
  description: '',
  icon: 'Package',
  product: {
    productType: 'Physical',
    status: 'draft',
    requiresShipping: true,
    isTaxable: false,
    hasVariants: false,
    inventoryTracking: 'Track Quantity',
    currency: 'UGX',
    options: [{ name: '', values: [] }],
  }
};

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

const availableIcons = Object.keys(Lucide).filter(key => typeof Lucide[key as keyof typeof Lucide] === 'object' && key !== 'createLucideIcon' && /^[A-Z]/.test(key));


export function ProductTemplateForm({ initialTemplate }: { initialTemplate?: Partial<ProductTemplate> | null }) {
  const [template, setTemplate] = useState<Partial<ProductTemplate>>(initialTemplate || emptyTemplate);
  const [openCombobox, setOpenCombobox] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (initialTemplate) {
        setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setTemplate(prev => ({...prev, [id]: value}));
  };
  
  const handleSelectChange = (field: keyof ProductTemplate | keyof Product, value: string) => {
    if (field === 'icon') {
        setTemplate(prev => ({...prev, [field]: value}));
    } else {
        handleProductChange(field as keyof Product, value);
    }
  }

  const handleProductChange = (field: keyof Product, value: any) => {
    setTemplate(prev => ({
      ...prev,
      product: { ...(prev?.product || {}), [field]: value }
    }));
  };
  
 const handleOptionChange = (optionIndex: number, field: 'name' | 'value', value: string) => {
      const productOptions = template.product?.options || [];
      const updatedOptions = [...productOptions];
      if (field === 'name') {
          updatedOptions[optionIndex].name = value;
      } else {
          updatedOptions[optionIndex].values = value.split(',').map(v => v.trim()).filter(Boolean);
      }
      handleProductChange('options', updatedOptions);
  };

  const addOption = () => {
    const productOptions = template.product?.options || [];
    if (productOptions.length < 3) {
      handleProductChange('options', [...productOptions, { name: '', values: [] }]);
    }
  };

  const removeOption = (optionIndex: number) => {
    const productOptions = template.product?.options || [];
    const updatedOptions = productOptions.filter((_, i) => i !== optionIndex);
    handleProductChange('options', updatedOptions);
  };


  const handleSave = () => {
    toast({
      title: "Template Saved",
      description: `The "${template.name}" template has been saved.`
    });
    // In a real app, you'd POST this to your API
    console.log("Saving template:", template);
  };
  
  const pageTitle = initialTemplate?.id ? 'Edit Product Template' : 'Create Product Template';
  const pageDescription = initialTemplate?.id ? 'Update the details of this template.' : 'Design a new reusable template for your products.';

  const productOptions = template.product?.options || [];

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
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">
            {pageDescription}
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                 <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Icon name={template.icon || 'Package'} className="h-4 w-4" />
                                {template.icon || 'Select icon...'}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search icon..." />
                            <CommandEmpty>No icon found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-y-auto">
                                {availableIcons.map((iconName) => (
                                <CommandItem
                                    key={iconName}
                                    value={iconName}
                                    onSelect={(currentValue) => {
                                        handleSelectChange('icon', iconName === template.icon ? 'Package' : iconName);
                                        setOpenCombobox(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            template.icon === iconName ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex items-center gap-2">
                                       <Icon name={iconName} className="h-4 w-4" />
                                       {iconName}
                                    </div>
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                 </Popover>
                 <p className="text-xs text-muted-foreground">
                    This icon will represent your template in the "Add Product" screen.
                 </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Product Configuration</CardTitle>
                <CardDescription>Set the default values for products created with this template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="productType">Product Type</Label>
                        <Select value={template.product?.productType} onValueChange={(v) => handleProductChange('productType', v)}>
                            <SelectTrigger id="productType">
                                <SelectValue placeholder="Select product type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Physical">Physical</SelectItem>
                                <SelectItem value="Digital">Digital</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Default Category</Label>
                        <Input
                          id="category"
                          value={template.product?.category || ''}
                          onChange={(e) => handleProductChange('category', e.target.value)}
                          placeholder="e.g., Apparel"
                        />
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                   <Checkbox
                      id="hasVariants"
                      checked={template.product?.hasVariants}
                      onCheckedChange={(c) => handleProductChange('hasVariants', !!c)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="hasVariants"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          This product has variants
                        </label>
                        <p className="text-sm text-muted-foreground">
                            Define options like size, color, or material.
                        </p>
                    </div>
                </div>
                
                {template.product?.hasVariants && (
                    <div className="space-y-4 pl-8 border-l">
                        <h4 className="font-medium">Options</h4>
                            {productOptions.map((option, index) => (
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
                            {productOptions.length < 3 && (
                                <Button variant="outline" size="sm" onClick={addOption}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add another option
                                </Button>
                            )}
                    </div>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>A glimpse of the template card.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Card className="cursor-pointer flex flex-col items-center justify-center text-center p-4">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                           <Icon name={template.icon || 'Package'} className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold">{template.name || 'Template Name'}</h3>
                        <p className="text-sm text-muted-foreground">{template.description || 'Template Description'}</p>
                    </Card>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 text-muted-foreground">
                    <p><span className="font-semibold text-foreground">Type:</span> {template.product?.productType}</p>
                    <p><span className="font-semibold text-foreground">Category:</span> {template.product?.category || 'Not set'}</p>
                    <p><span className="font-semibold text-foreground">Variants:</span> {template.product?.hasVariants ? 'Yes' : 'No'}</p>
                    {template.product?.hasVariants && productOptions.length > 0 && (
                        <div>
                            <p className="font-semibold text-foreground">Options:</p>
                            <ul className="list-disc list-inside pl-4">
                                {productOptions.filter(opt => opt.name).map((opt, i) => (
                                    <li key={i}>{opt.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
