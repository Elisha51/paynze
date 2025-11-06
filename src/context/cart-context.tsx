
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { OrderItem, Product, ProductVariant, OnboardingFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export type CartItem = OrderItem & {
  variantId: string;
  productId: string;
  image?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  currency: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [currency, setCurrency] = useState('UGX');

  useEffect(() => {
    // Load cart from local storage on mount
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
     const onboardingDataRaw = localStorage.getItem('onboardingData');
    if (onboardingDataRaw) {
        const settings: OnboardingFormData = JSON.parse(onboardingDataRaw);
        setCurrency(settings.currency || 'UGX');
    }
  }, []);

  useEffect(() => {
    // Save cart to local storage whenever it changes
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    const existingItem = cartItems.find(item => item.variantId === variant.id);

    if (existingItem) {
      updateQuantity(variant.id, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        productId: product.sku,
        variantId: variant.id,
        sku: variant.sku || product.sku,
        name: product.hasVariants ? `${product.name} - ${Object.values(variant.optionValues).join(' / ')}` : product.name,
        quantity,
        price: variant.price || product.retailPrice,
        image: (product.images[0] as { url: string })?.url,
      };
      setCartItems(prev => [...prev, newItem]);
    }
     toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (variantId: string) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.variantId === variantId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);
  
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, currency }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
