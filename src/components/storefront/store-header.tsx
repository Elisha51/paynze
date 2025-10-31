
'use client';
import { ShoppingCart, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OnboardingFormData } from '@/lib/types';
import { CartSheet } from './cart-sheet';
import { useCart } from '@/context/cart-context';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useStorefrontSearch } from '@/context/storefront-search-context';

type StoreHeaderProps = {
    settings: OnboardingFormData | null;
};

export function StoreHeader({ settings }: StoreHeaderProps) {
    const { cartCount } = useCart();
    const { searchQuery, setSearchQuery } = useStorefrontSearch();
    
    return (
         <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center gap-4">
                <Link href="/" className="hidden items-center gap-2 sm:flex">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">{settings?.businessName || "Your Store"}</span>
                </Link>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
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
                        <Link href="/store/login">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Login</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
