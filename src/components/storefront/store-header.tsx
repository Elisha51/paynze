
'use client';
import { ShoppingCart, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OnboardingFormData } from '@/lib/types';
import { CartSheet } from './cart-sheet';
import { useCart } from '@/context/cart-context';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { AuthModal } from './auth-modal';


type StoreHeaderProps = {
    settings: OnboardingFormData | null;
};

export function StoreHeader({ settings }: StoreHeaderProps) {
    const { cartCount } = useCart();
    
    // Simulate customer authentication state
    const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalReason, setAuthModalReason] = useState('');
  
    // In a real app, this would use a proper customer auth context.
    useEffect(() => {
        const loggedIn = localStorage.getItem('isCustomerLoggedIn') === 'true';
        setIsCustomerAuthenticated(loggedIn);
    }, []);

    // Mock unread notification count for the customer
    const unreadNotifications = 3;
    
    const handleProtectedClick = (e: React.MouseEvent, reason: string) => {
        if (!isCustomerAuthenticated) {
            e.preventDefault();
            setAuthModalReason(reason);
            setIsAuthModalOpen(true);
        }
    };
    
    return (
        <>
            <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={() => setIsAuthModalOpen(false)} 
              reason={authModalReason}
            />
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container flex h-16 items-center gap-4">
                    <Link href="/store" className="hidden items-center gap-2 sm:flex">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">{settings?.businessName || "Your Store"}</span>
                    </Link>
                    <div className="flex-1" />
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

                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link href="/store/account/notifications" onClick={(e) => handleProtectedClick(e, "view your notifications")}>
                                <Bell className="h-5 w-5" />
                                {isCustomerAuthenticated && unreadNotifications > 0 && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-1 text-xs">
                                        {unreadNotifications}
                                    </Badge>
                                )}
                                <span className="sr-only">View Notifications</span>
                            </Link>
                        </Button>

                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                                <span className="sr-only">Customer Account</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isCustomerAuthenticated ? (
                                <>
                                    <DropdownMenuItem asChild><Link href="/store/account">My Profile</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/store/account/orders">My Orders</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => {
                                        localStorage.setItem('isCustomerLoggedIn', 'false');
                                        window.location.reload();
                                    }}>
                                        Log Out
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem asChild><Link href="/store/login">Sign In</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/store/signup">Create Account</Link></DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
        </>
    )
}
