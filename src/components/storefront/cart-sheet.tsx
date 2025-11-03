
'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { useCart } from '@/context/cart-context';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal, currency } = useCart();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
           <>
            <ScrollArea className="flex-1 px-6">
                <div className="flex flex-col gap-6 py-6">
                {cartItems.map(item => (
                    <div key={item.variantId} className="flex items-start gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                            <Image
                                src={item.image || `https://picsum.photos/seed/${item.sku}/80/80`}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-md">
                                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="h-8 w-8 px-2">-</Button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="h-8 w-8 px-2">+</Button>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.variantId)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                ))}
                </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="px-6 py-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                    <p>Subtotal</p>
                    <p>{formatCurrency(cartTotal)}</p>
                </div>
                 <SheetClose asChild>
                    <Button size="lg" className="w-full" asChild>
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                 </SheetClose>
            </SheetFooter>
           </>
        ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty.</p>
                <SheetClose asChild>
                    <Button variant="outline">Continue Shopping</Button>
                </SheetClose>
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
