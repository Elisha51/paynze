import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingCart, Users, Truck, MessageCircle, BarChart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <ShoppingCart className="h-8 w-8 text-primary" />,
    title: 'Instant Online Store',
    description: 'Go from zero to a fully functional online store in minutes with your own subdomain.',
  },
  {
    icon: <Image src="/mobile-money.svg" alt="Mobile Money" width={32} height={32} />,
    title: 'Mobile Money Ready',
    description: 'Accept payments seamlessly with MPesa, MTN MoMo, and Airtel Money integrations.',
  },
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: 'Delivery Management',
    description: 'Manage your own deliveries or integrate with local logistics partners effortlessly.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Mini-CRM',
    description: 'Understand your customers and communicate with them directly via WhatsApp and SMS.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Inventory & Orders',
    description: 'A powerful dashboard to manage your products, track inventory, and process orders.',
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
    title: 'Offline First',
    description: 'Our PWA storefront works even with intermittent internet, so you never miss a sale.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl font-headline">AfriStore</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="African marketplace"
              fill
              className="object-cover -z-10"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 rounded-lg bg-background/80 backdrop-blur-sm p-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Your Business, Online in Minutes.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    AfriStore is the all-in-one platform for East African merchants. Build your store, accept mobile money, manage customers, and grow your brand.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Start Free - Create Store</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Built for Commerce in East Africa
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide all the tools you need to succeed online, tailored for the local market.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} AfriStore. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
