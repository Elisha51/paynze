
'use client';

import { ProductGrid } from "@/components/storefront/product-grid";
import { getProducts } from "@/services/products";
import type { Product, Category } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFilters } from "@/components/storefront/product-filters";
import { getCategories } from "@/services/categories";

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      const publishedProducts = fetchedProducts.filter(p => p.status === 'published');
      setProducts(publishedProducts);
      setCategories(fetchedCategories);

      if (publishedProducts.length > 0) {
        const maxPrice = Math.max(...publishedProducts.map(p => p.retailPrice));
        setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => p.category && selectedCategories.includes(p.category));
    }

    // Price range filter
    filtered = filtered.filter(p => p.retailPrice >= priceRange[0] && p.retailPrice <= priceRange[1]);

    // Sorting
    switch (sortOption) {
        case 'price-asc':
            filtered.sort((a, b) => a.retailPrice - b.retailPrice);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.retailPrice - a.retailPrice);
            break;
        case 'newest':
        default:
            // Assuming products are fetched in a default order (e.g., by date)
            break;
    }
    
    return filtered;
  }, [products, searchQuery, sortOption, selectedCategories, priceRange]);
  
  const handleResetFilters = () => {
    setSelectedCategories([]);
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.retailPrice));
      setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
    }
  }
  
  const maxPrice = useMemo(() => {
     if (products.length === 0) return 1000000;
     return Math.max(...products.map(p => p.retailPrice));
  }, [products]);

  return (
    <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <aside className="hidden lg:block lg:col-span-1 sticky top-24">
                <ProductFilters 
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onCategoryChange={setSelectedCategories}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    maxPrice={maxPrice}
                    onReset={handleResetFilters}
                />
            </aside>
            <main className="lg:col-span-3">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 border rounded-lg bg-card">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, category, or tag..."
                            className="pl-10 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm text-muted-foreground hidden md:inline">Sort by:</span>
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="h-11 w-full md:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="aspect-square w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <ProductGrid products={filteredAndSortedProducts} />
                )}
            </main>
        </div>
    </div>
  );
}
