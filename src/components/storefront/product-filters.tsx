
'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "../ui/separator";
import type { Category } from "@/lib/types";
import { useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

interface ProductFiltersProps {
    categories: Category[];
    selectedCategories: string[];
    onCategoryChange: (selected: string[]) => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    maxPrice: number;
    showInStock: boolean;
    onStockChange: (show: boolean) => void;
    onReset: () => void;
}

export function ProductFilters({ 
    categories, 
    selectedCategories, 
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    maxPrice,
    showInStock,
    onStockChange,
    onReset
}: ProductFiltersProps) {

    const handleCategoryToggle = (categoryName: string) => {
        const newSelection = selectedCategories.includes(categoryName)
            ? selectedCategories.filter(name => name !== categoryName)
            : [...selectedCategories, categoryName];
        onCategoryChange(newSelection);
    }
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(amount);
    }

    const groupedCategories = useMemo(() => {
        return categories.reduce((acc, category) => {
            const mainCategory = category.description || 'Uncategorized';
            if (!acc[mainCategory]) {
                acc[mainCategory] = [];
            }
            acc[mainCategory].push(category);
            return acc;
        }, {} as Record<string, Category[]>);
    }, [categories]);

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="link" onClick={onReset} className="p-0 h-auto">Reset</Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                    <h4 className="font-semibold">Availability</h4>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="in-stock"
                            checked={showInStock}
                            onCheckedChange={() => onStockChange(!showInStock)}
                        />
                        <Label htmlFor="in-stock" className="font-normal cursor-pointer">
                            In Stock
                        </Label>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <h4 className="font-semibold">Category</h4>
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(groupedCategories).map(([mainCategory, subCategories]) => (
                            <AccordionItem value={mainCategory} key={mainCategory}>
                                <AccordionTrigger>{mainCategory}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 pl-2">
                                    {subCategories.map(category => (
                                        <div key={category.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`cat-${category.id}`} 
                                                checked={selectedCategories.includes(category.name)}
                                                onCheckedChange={() => handleCategoryToggle(category.name)}
                                            />
                                            <Label htmlFor={`cat-${category.id}`} className="font-normal cursor-pointer">
                                                {category.name}
                                            </Label>
                                        </div>
                                    ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <h4 className="font-semibold">Price Range</h4>
                     <Slider
                        value={priceRange}
                        onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                        max={maxPrice}
                        step={1000}
                        className="my-4"
                    />
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{formatCurrency(priceRange[0])}</span>
                        <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
