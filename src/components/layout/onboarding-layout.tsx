
// src/components/layout/onboarding-layout.tsx
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl font-headline">Paynze</span>
                </Link>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                {children}
            </main>
        </div>
    )
}
