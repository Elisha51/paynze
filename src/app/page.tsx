
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, CreditCard, ShoppingCart, Truck, Users, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: 'COD & Mobile Money',
    description: 'Accept cash on delivery and mobile money payments from day one.',
  },
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: 'Delivery Integration',
    description: 'Manage your own deliveries or connect with local logistics partners.',
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    title: 'Wholesale Pricing',
    description: 'Set different price tiers for your retail and wholesale customers.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Customer Management',
    description: 'A mini-CRM to help you understand and communicate with your customers.',
  },
  {
    icon: <ShoppingCart className="h-8 w-8 text-primary" />,
    title: 'Subdomain & Branding',
    description: 'Get a unique yourname.paynze.app URL and customize your storefront.',
  },
];

const testimonials = [
    {
        name: 'Juma Kato',
        role: 'Kikuubo Traders, Kampala',
        quote: 'Paynze helped us get our wholesale business online in a week. Our sales have doubled since we started accepting mobile money.',
        avatar: 'https://picsum.photos/seed/juma/100/100',
    },
    {
        name: 'Amina Njoroge',
        role: 'Fabric Retailer, Nairobi',
        quote: 'Managing inventory and orders used to be a headache. With Paynze, everything is in one place and so much easier to track.',
        avatar: 'https://picsum.photos/seed/amina/100/100',
    }
]

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl font-headline">Paynze</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/get-started">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-24 lg:py-32 bg-gray-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                  Start Selling Online for Free
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  Join our community of over 100k entrepreneurs and begin selling. Don't think twice, this is the easiest way to start your online store.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/get-started">Sign Up for Free</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
                  <Image src="https://picsum.photos/seed/hero-paynze/600/400" alt="Paynze dashboard screenshot" width={600} height={400} className="rounded-md shadow-2xl" data-ai-hint="dashboard screenshot" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Get Started in 3 Simple Steps</h2>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-3 md:gap-12">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                           <span className="font-bold text-primary text-2xl">1</span>
                        </div>
                        <h3 className="text-xl font-bold">Sign Up & Name Your Store</h3>
                        <p className="text-muted-foreground">Create your account and choose a unique name for your online store in minutes.</p>
                    </div>
                     <div className="flex flex-col items-center text-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                           <span className="font-bold text-primary text-2xl">2</span>
                        </div>
                        <h3 className="text-xl font-bold">Add Your Products</h3>
                        <p className="text-muted-foreground">Easily upload your products, set prices, and manage your inventory.</p>
                    </div>
                     <div className="flex flex-col items-center text-center gap-4">
                        <div className="bg-primary/10 p-4 rounded-full">
                           <span className="font-bold text-primary text-2xl">3</span>
                        </div>
                        <h3 className="text-xl font-bold">Start Selling</h3>
                        <p className="text-muted-foreground">Accept payments online and in-store with mobile money and COD.</p>
                    </div>
                </div>
            </div>
        </section>


        {/* Core Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                Everything You Need to Succeed
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Paynze provides all the tools to run your business online and off.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Simple Pricing for Every Business</h2>
                </div>
                <div className="mx-auto grid max-w-md gap-8 lg:max-w-4xl lg:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline">Free</CardTitle>
                            <CardDescription>Get started with the essential features to run your business.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 grid gap-4">
                           <div className="text-4xl font-bold">Free</div>
                            <ul className="grid gap-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Basic Storefront</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> COD & Mobile Money</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Order Management</li>
                            </ul>
                        </CardContent>
                        <div className="p-6">
                           <Button className="w-full" asChild><Link href="/get-started">Start for Free</Link></Button>
                        </div>
                    </Card>
                    <Card className="flex flex-col border-primary">
                        <CardHeader>
                            <CardTitle className="font-headline">Premium</CardTitle>
                            <CardDescription>Unlock advanced features to scale your business.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 grid gap-4">
                           <div className="text-4xl font-bold">Coming Soon</div>
                           <ul className="grid gap-2 text-muted-foreground">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Everything in Free</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Custom Domain</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Advanced Analytics</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Wholesale Tiers</li>
                            </ul>
                        </CardContent>
                         <div className="p-6">
                           <Button className="w-full" disabled>Coming Soon</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
             <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Trusted by Businesses Like Yours</h2>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-12">
                   {testimonials.map(t => (
                        <Card key={t.name}>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground mb-4">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{t.name}</p>
                                        <p className="text-sm text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                   ))}
                </div>
            </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Paynze. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            About
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Help
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  );
}

    