
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProducts } from '@/services/products';
import { type Product, type ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { Remarkable } from 'remarkable';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductImages } from '@/components/storefront/product-images';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/storefront/auth-modal';

const md = new Remarkable();

export default function ProductDetailPage() {
  const params = useParams();
  const sku = params.sku as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Simulate customer authentication state
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // In a real app, you would use a proper customer auth context.
  // For this prototype, we'll just check a mock flag.
  useEffect(() => {
    const loggedIn = localStorage.getItem('isCustomerLoggedIn') === 'true';
    setIsCustomerAuthenticated(loggedIn);
  }, []);


  useEffect(() => {
    async function fetchProduct() {
      if (!sku) return;
      setIsLoading(true);
      const products = await getProducts();
      const foundProduct = products.find(p => p.sku === sku);
      setProduct(foundProduct || null);

      if (foundProduct) {
        if (foundProduct.hasVariants && foundProduct.options.length > 0) {
          const initialOptions = foundProduct.options.reduce((acc, option) => {
            acc[option.name] = option.values[0];
            return acc;
          }, {} as Record<string, string>);
          setSelectedOptions(initialOptions);
        } else if (foundProduct.variants.length > 0) {
          // For products with no variants options but a default variant
          setSelectedVariant(foundProduct.variants[0]);
        }
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [sku]);

  useEffect(() => {
    if (product && product.hasVariants) {
      const variant = product.variants.find(v => {
        return Object.entries(selectedOptions).every(
          ([key, value]) => v.optionValues[key] === value
        );
      });
      setSelectedVariant(variant || null);
    }
  }, [product, selectedOptions]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };
  
  const handleAddToCart = () => {
    if (!isCustomerAuthenticated) {
        setIsAuthModalOpen(true);
        return;
    }
    
    if (product && (selectedVariant || (!product.hasVariants && product.variants.length > 0))) {
        addToCart(product, selectedVariant || product.variants[0], quantity);
    } else {
        toast({
            variant: 'destructive',
            title: 'Unable to add to cart',
            description: 'This product variant is currently unavailable.',
        })
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  const getIsVariantAvailable = (optionName: string, value: string) => {
    if (!product || !product.hasVariants) return true;

    const potentialOptions = { ...selectedOptions, [optionName]: value };
    const variant = product.variants.find(v => {
      return Object.entries(potentialOptions).every(
        ([key, val]) => v.optionValues[key] === val
      );
    });
    return variant ? variant.status === 'In Stock' || variant.status === 'Low Stock' : false;
  };
  
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="w-full aspect-square" />
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }
  
  // Use selectedVariant for price if available, otherwise fallback to base product price.
  // For non-variant products, selectedVariant will be the default variant.
  const price = selectedVariant?.price ?? product.retailPrice;
  const isAvailable = selectedVariant ? selectedVariant.status === 'In Stock' || selectedVariant.status === 'Low Stock' : true;

  return (
    <>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        reason="add items to your cart"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <ProductImages product={product} selectedVariant={selectedVariant} />
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
              <p className="text-2xl lg:text-3xl font-semibold mt-2 text-primary">
                  {formatCurrency(price, product.currency)}
              </p>
              {product.compareAtPrice && product.compareAtPrice > price && (
                  <p className="text-lg text-muted-foreground line-through mt-1">
                      {formatCurrency(product.compareAtPrice, product.currency)}
                  </p>
              )}
            </div>
            
            <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: md.render(product.shortDescription || '') }} />

            {product.hasVariants && product.options.map(option => (
              <div key={option.name} className="space-y-3">
                <Label className="text-lg font-semibold">{option.name}</Label>
                <RadioGroup
                  value={selectedOptions[option.name]}
                  onValueChange={(value) => handleOptionChange(option.name, value)}
                  className="flex flex-wrap gap-2"
                >
                  {option.values.map(value => {
                    const isOptionAvailable = getIsVariantAvailable(option.name, value);
                    return (
                      <Label
                        key={value}
                        htmlFor={`${option.name}-${value}`}
                        className={cn(
                            "cursor-pointer rounded-md border px-4 py-2 transition-colors relative",
                            selectedOptions[option.name] === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-muted",
                            !isOptionAvailable && "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                      >
                        <RadioGroupItem value={value} id={`${option.name}-${value}`} className="sr-only" disabled={!isOptionAvailable}/>
                        {value}
                        {!isOptionAvailable && (
                          <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-destructive" />
                        )}
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>
            ))}

            <Separator />
            
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <div className="flex items-center border rounded-md">
                  <Button variant="ghost" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-full rounded-r-none">-</Button>
                  <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border-x border-y-0 rounded-none focus-visible:ring-0" />
                  <Button variant="ghost" onClick={() => setQuantity(q => q + 1)} className="h-full rounded-l-none">+</Button>
              </div>
              <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
              >
                {isAvailable ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
            
            {product.longDescription && (
              <>
                  <Separator />
                  <div className="space-y-4">
                      <h3 className="text-xl font-bold">Product Details</h3>
                      <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: md.render(product.longDescription) }} />
                  </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
