
'use client';
import { ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OnboardingFormData } from '@/lib/types';
import { CartSheet } from './cart-sheet';
import { useCart } from '@/context/cart-context';
import { Badge } from '../ui/badge';

type StoreHeaderProps = {
    settings: OnboardingFormData | null;
};

export function StoreHeader({ settings }: StoreHeaderProps) {
    const { cartCount } = useCart();
    
    return (
         <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center">
                <Link href="/store" className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">{settings?.businessName || "Your Store"}</span>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    <CartSheet>
                         <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-1 text-xs">
                                    {cartCount}
                                </Badge>
                            )}
                            <span className="sr-only">Open Cart</span>
                        </Button>
                    </CartSheet>
                     <Button variant="ghost" size="icon" asChild>
                        <Link href="/login">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Login</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
