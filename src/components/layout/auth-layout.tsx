
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl font-headline">Paynze</span>
                </Link>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center py-12">
                {children}
            </main>
        </div>
    )
}
