
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addAffiliate, getAffiliates } from '@/services/affiliates';
import { OnboardingFormData } from '@/lib/types';
import { StoreHeader } from '@/components/storefront/store-header';

export default function AffiliateSignupPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !uniqueId) {
        toast({ variant: 'destructive', title: "All fields are required." });
        return;
    }
    
    const existingAffiliates = await getAffiliates();
    const isCodeTaken = existingAffiliates.some(aff => aff.uniqueId.toUpperCase() === uniqueId.toUpperCase());
    
    if (isCodeTaken) {
        toast({ variant: 'destructive', title: "Unique code is already taken.", description: "Please choose a different code." });
        return;
    }

    try {
        await addAffiliate({
            name,
            contact,
            uniqueId: uniqueId.toUpperCase(),
            status: 'Pending',
            linkClicks: 0,
            conversions: 0,
            totalSales: 0,
            pendingCommission: 0,
            paidCommission: 0,
        });
        setIsSubmitted(true);
    } catch (error) {
        toast({ variant: 'destructive', title: "Submission failed.", description: "Please try again." });
    }
  };

  const pageTitle = `Become an Affiliate for ${settings?.businessName || 'the Store'}`;

  if (isSubmitted) {
      return (
         <div className="flex flex-col min-h-screen">
            <StoreHeader settings={settings} />
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <Card className="mx-auto max-w-sm text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Application Submitted!</CardTitle>
                        <CardDescription>
                            Thank you for applying. The store owner will review your application and approve it shortly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">You will be notified once your application is approved.</p>
                        <Button asChild variant="link"><Link href="/store">Back to Store</Link></Button>
                    </CardContent>
                </Card>
            </main>
        </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
        <StoreHeader settings={settings} />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                <CardDescription>
                    Join the affiliate program and earn commissions on sales you refer.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="contact">Payout Contact (Mobile Money #)</Label>
                    <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="uniqueId">Desired Unique Code</Label>
                    <Input id="uniqueId" value={uniqueId} onChange={(e) => setUniqueId(e.target.value)} placeholder="e.g. JUMA25" required />
                    </div>
                    <Button type="submit" className="w-full">
                    Apply Now
                    </Button>
                     <div className="mt-4 text-center text-sm">
                        Already an affiliate?{' '}
                        <Link href="/affiliate/login" className="underline">
                        Sign in
                        </Link>
                    </div>
                </form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
