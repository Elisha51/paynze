
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, CheckCircle, Store, Truck, Wallet, ShoppingCart, Users, Megaphone, Landmark, FileText, Settings, BookCopy, BarChart, Zap, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const integrations = [
    { name: 'MTN MoMo', category: 'Payments' },
    { name: 'Airtel Money', category: 'Payments' },
    { name: 'Flutterwave', category: 'Payments' },
    { name: 'Twilio', category: 'Communication' },
    { name: 'WhatsApp', category: 'Communication' },
    { name: 'Sendy', category: 'Deliveries' },
    { name: 'GIG Logistics', category: 'Deliveries' },
    { name: 'Google Analytics', category: 'Analytics' },
    { name: 'Meta Pixel', category: 'Analytics' },
];

const features = [
    {
        icon: <ShoppingCart className="h-6 w-6" />,
        title: 'Storefront & Products',
        description: 'Multi-theme UI, variant support, discounts, and bulk pricing.'
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: 'Business & Staff',
        description: 'RBAC roles, activity tracking, and permissions reporting.'
    },
    {
        icon: <Megaphone className="h-6 w-6" />,
        title: 'Marketing & CRM',
        description: 'Campaigns, SMS/Email/WhatsApp promotions, and affiliate programs.'
    },
    {
        icon: <Wallet className="h-6 w-6" />,
        title: 'Payments & Finance',
        description: 'Mobile money, cash, and card support with multi-currency insights.'
    },
    {
        icon: <Truck className="h-6 w-6" />,
        title: 'Delivery & Fulfilment',
        description: 'Integrated logistics, order tracking, and proof of delivery.'
    },
    {
        icon: <Layers className="h-6 w-6" />,
        title: 'Integrations',
        description: 'Connect with WhatsApp, Email, SMS, and payment gateways.'
    },
    {
        icon: <BarChart className="h-6 w-6" />,
        title: 'Analytics',
        description: 'Real-time sales dashboards and customer heatmaps.'
    }
];

const howItWorksSteps = [
    { title: 'Sign Up & Choose Plan' },
    { title: 'Set Up Storefront' },
    { title: 'Add Products & Payments' },
    { title: 'Launch & Start Selling' },
    { title: 'Track, Manage, and Grow' }
];

const testimonials = [
    {
        quote: "Paynze helped us move from a local stock shop to serving customers across 3 cities. Our sales have tripled!",
        author: "Mary, Retailer in Kampala",
        image: "https://images.unsplash.com/photo-1592621385612-4d7129426394?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc2MTI1ODc2Mnww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
        quote: "Managing staff and deliveries became simple. The dashboard gives me a complete overview of my business at a glance.",
        author: "Ayo, Distributor in Lagos",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjEyNTU5NTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
];

const pricingPlans = [
    { name: 'Starter', price: '$10/mo', description: 'For individuals launching their first online store.', features: ['1 staff member', 'Basic storefront', 'Mobile money only', '50 products'] },
    { name: 'Growth', price: '$25/mo', description: 'For small to mid-sized retailers expanding online.', features: ['5 staff members', 'All payment methods', 'Delivery support', 'Marketing tools'] },
    { name: 'Pro', price: '$60/mo', description: 'For wholesalers & enterprises.', features: ['Unlimited staff', 'Advanced automation', 'API access', 'Custom domains'] }
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
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href="#">Book a Demo</Link>
            </Button>
            <Button asChild>
                <Link href="/get-started">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40">
            <div className="container px-4 md:px-6 text-center">
                 <div className="mx-auto max-w-4xl space-y-6">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                        Sell Smart. Grow Everywhere.
                    </h1>
                    <p className="text-lg text-muted-foreground md:text-xl">
                        Paynze helps African wholesalers, retailers, and stockists launch online stores, manage sales, payments, and deliveries — all in one system.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="/get-started">Start Free Trial</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                             <Link href="#">Book a Demo</Link>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="container mt-16">
                 <p className="text-center text-sm font-semibold text-muted-foreground mb-4">INTEGRATED WITH THE TOOLS YOU ALREADY USE</p>
                 <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
                    {integrations.slice(0, 5).map(p => (
                         <div key={p.name} className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                             <p className="font-bold text-lg">{p.name}</p>
                         </div>
                    ))}
                 </div>
            </div>
        </section>

        {/* Platform Overview */}
         <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">The All-In-One Commerce Platform</h2>
                <p className="text-muted-foreground md:text-xl">Paynze gives you everything you need to run your business, whether you’re just getting started or scaling up.</p>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-3">
              <div className="text-center p-6 space-y-3">
                  <div className="p-4 inline-block rounded-full bg-primary/10 text-primary"><Store className="h-8 w-8" /></div>
                  <h3 className="text-xl font-bold">Launch Online or Hybrid Store</h3>
                  <p className="text-muted-foreground">Create a full online storefront — or extend your physical shop online — with your own subdomain or custom domain.</p>
              </div>
               <div className="text-center p-6 space-y-3">
                  <div className="p-4 inline-block rounded-full bg-primary/10 text-primary"><BookCopy className="h-8 w-8" /></div>
                  <h3 className="text-xl font-bold">Manage Everything in One Place</h3>
                  <p className="text-muted-foreground">From inventory to invoices, deliveries, staff, and payments — all within one intuitive dashboard.</p>
              </div>
               <div className="text-center p-6 space-y-3">
                  <div className="p-4 inline-block rounded-full bg-primary/10 text-primary"><Zap className="h-8 w-8" /></div>
                  <h3 className="text-xl font-bold">Scale Without Limits</h3>
                  <p className="text-muted-foreground">Add staff, connect agents, run campaigns, and expand across Africa with built-in integrations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
         <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="mx-auto max-w-4xl text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Powerful Features for Every Business Need</h2>
                    <p className="text-muted-foreground md:text-xl">From your first sale to full-scale operation, Paynze has you covered.</p>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
                    {features.map(feature => (
                        <div key={feature.title} className="flex gap-4">
                            <div className="p-2 h-fit rounded-md bg-primary/10 text-primary">{feature.icon}</div>
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        
        {/* How It Works */}
         <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Get Started in Minutes</h2>
            </div>
            <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
                {howItWorksSteps.map((step, index) => (
                    <div key={step.title} className="relative z-10 flex flex-col items-center text-center w-40">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background border-2 border-primary text-primary font-bold text-lg mb-2">
                           {index + 1}
                        </div>
                        <p className="text-sm font-semibold">{step.title}</p>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center space-y-4 mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Pricing Plans for Every Stage</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                    {pricingPlans.map(plan => (
                        <Card key={plan.name} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline">{plan.name}</CardTitle>
                                <CardDescription className="text-3xl font-bold !mt-2">{plan.price}</CardDescription>
                                <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-accent"/>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.name === 'Growth' ? 'default' : 'outline'}>Start Free Trial</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials */}
         <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {testimonials.map(testimonial => (
                        <figure key={testimonial.author} className="space-y-4">
                            <blockquote className="text-xl md:text-2xl font-semibold italic">“{testimonial.quote}”</blockquote>
                            <figcaption className="flex items-center gap-3">
                                <Image src={testimonial.image} width={48} height={48} alt={testimonial.author} className="rounded-full object-cover" />
                                <cite className="font-bold not-italic">{testimonial.author}</cite>
                            </figcaption>
                        </figure>
                    ))}
                 </div>
            </div>
         </section>

        {/* Final CTA */}
        <section className="w-full py-20 md:py-32">
            <div className="container text-center">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Ready to grow your business online?</h2>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Button size="lg" asChild>
                        <Link href="/get-started">Start Free Trial</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                         <Link href="#">Book a Demo</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-2">
                 <Link href="#" className="flex items-center space-x-2">
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl font-headline">Paynze</span>
                </Link>
                <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Paynze. All rights reserved.</p>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Product</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">Features</Link></li>
                    <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                    <li><Link href="#" className="hover:text-primary">Integrations</Link></li>
                    <li><Link href="#" className="hover:text-primary">Roadmap</Link></li>
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Company</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">About</Link></li>
                    <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                    <li><Link href="#" className="hover:text-primary">Partners</Link></li>
                    <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Resources</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">Documentation</Link></li>
                    <li><Link href="#" className="hover:text-primary">API</Link></li>
                    <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                    <li><Link href="#" className="hover:text-primary">Support</Link></li>
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Social</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-primary">Facebook</Link></li>
                    <li><Link href="#" className="hover:text-primary">LinkedIn</Link></li>
                    <li><Link href="#" className="hover:text-primary">Instagram</Link></li>
                    <li><Link href="#" className="hover:text-primary">X (Twitter)</Link></li>
                </ul>
            </div>
        </div>
      </footer>
    </div>
  );
}
