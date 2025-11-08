
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, CheckCircle, Store, Truck, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <Store className="h-8 w-8" />,
    title: 'Online Storefront',
    description: 'Create a beautiful, modern online store in minutes. No coding required.',
  },
  {
    icon: <Wallet className="h-8 w-8" />,
    title: 'Integrated Payments',
    description: 'Accept mobile money and other local payment methods seamlessly.',
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: 'Logistics & Delivery',
    description: 'Manage your inventory, assign deliveries, and track orders to fulfillment.',
  },
];

export default function LandingPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

    return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl font-headline">Paynze</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="/get-started">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full pt-12 md:pt-24 lg:pt-32">
            <div className="container px-4 md:px-6 space-y-10 xl:space-y-16 text-center">
                 <div className="mx-auto max-w-4xl space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                        Your Business, Online in Minutes
                    </h1>
                    <p className="text-muted-foreground md:text-xl">
                        The all-in-one e-commerce platform for merchants in Africa.
                        Start, run, and grow your business with Paynze.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/get-started">
                        Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                 {heroImage && (
                    <div className="relative aspect-video max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
                        <Image 
                            src={heroImage.imageUrl}
                            alt={heroImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={heroImage.imageHint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                )}
            </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 mt-16">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">{feature.icon}</div>
                    <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
         <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="mx-auto max-w-4xl text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Everything you need to sell online</h2>
                    <p className="text-muted-foreground md:text-xl">From your first sale to full-scale operation, Paynze has you covered.</p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-12 mt-12 lg:grid-cols-2">
                    <ul className="grid gap-6">
                        <li>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>Point of Sale (POS)</h3>
                            <p className="text-muted-foreground">Manage in-person sales seamlessly with our integrated POS system.</p>
                        </div>
                        </li>
                        <li>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>Marketing Tools</h3>
                            <p className="text-muted-foreground">Run SMS and email campaigns. Manage discounts and affiliate marketers.</p>
                        </div>
                        </li>
                         <li>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>Staff Management</h3>
                            <p className="text-muted-foreground">Assign roles and permissions to your team members and delivery agents.</p>
                        </div>
                        </li>
                    </ul>
                     <ul className="grid gap-6">
                        <li>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>AI-Powered Assistance</h3>
                            <p className="text-muted-foreground">Generate product descriptions and reconcile financial statements with AI.</p>
                        </div>
                        </li>
                        <li>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>Mobile-First Design</h3>
                            <p className="text-muted-foreground">Manage your entire business from your phone with our progressive web app.</p>
                        </div>
                        </li>
                         <li>
                        <div className="grid gap-1">
                            <h3 className="text-xl font-bold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>Powerful Analytics</h3>
                            <p className="text-muted-foreground">Get insights into your sales, customers, and marketing efforts.</p>
                        </div>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Paynze. All rights reserved.</p>
      </footer>
    </div>
  );
}
