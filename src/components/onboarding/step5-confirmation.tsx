// src/components/onboarding/step5-confirmation.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Store, Globe, Wallet, Truck, Paintbrush } from 'lucide-react';
import { themes } from '@/themes';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { addStaff } from '@/services/staff';

export default function Step5Confirmation() {
  const { formData, prevStep } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();

  const selectedTheme = themes.find(t => t.name === formData.theme) || themes[0];

  const handleLaunch = async () => {
    // 1. Save final onboarding data to localStorage for the new tenant
    localStorage.setItem('onboardingData', JSON.stringify(formData));
    
    // 2. Create the first user (Account Owner) for this new tenant
    await addStaff({
        name: formData.businessName, // Or collect a personal name in step 1
        email: 'admin@' + formData.subdomain + '.com', // Simulated email
        role: 'Admin',
        status: 'Active',
    });

    // 3. Show success and redirect to login
    toast({
        title: "Store Created!",
        description: "Welcome to Paynze. Please log in to access your new dashboard.",
        variant: "default",
        duration: 5000,
    });
    
    // Redirect to login page with a success flag
    router.push('/login?onboarding=success');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Review & Confirm</CardTitle>
                <CardDescription>If everything looks good, launch your store!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Business Details</h3>
                    <p><strong>Name:</strong> {formData.businessName}</p>
                    <p><strong>Type:</strong> {formData.businessType}</p>
                    <p><strong>Phone:</strong> {formData.contactPhone}</p>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Store Details</h3>
                    <p><strong>URL:</strong> {formData.subdomain}.paynze.app</p>
                    <p><strong>Currency:</strong> {formData.currency}</p>
                    <p><strong>Theme:</strong> {formData.theme}</p>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Payments</h3>
                    <div className="flex flex-col">
                        {formData.paymentOptions.cod && <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Cash on Delivery</span>}
                        {formData.paymentOptions.mobileMoney && <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-accent" /> Mobile Money</span>}
                    </div>
                </div>
                <div className="space-y-2 p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Delivery</h3>
                    {formData.delivery.pickup && <p><strong>Pickup Address:</strong> {formData.delivery.address}</p>}
                    {formData.delivery.deliveryFee && <p><strong>Delivery Fee:</strong> {formData.delivery.deliveryFee} {formData.currency}</p>}
                    {!formData.delivery.pickup && !formData.delivery.deliveryFee && <p className="text-sm text-muted-foreground">No delivery options configured.</p>}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button onClick={handleLaunch} className="bg-accent hover:bg-accent/90">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Launch My Store
                </Button>
            </CardFooter>
        </Card>
        <div className="hidden lg:block">
            <Card>
                <CardHeader>
                    <CardTitle>Live Store Preview</CardTitle>
                    <CardDescription>A glimpse of your new storefront.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div 
                        className="p-4 rounded-lg border w-full h-[450px] overflow-hidden"
                        style={{ background: selectedTheme.preview.background }}
                    >
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md w-full h-full transform scale-[0.9] origin-top">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: selectedTheme.preview.primary }}>
                                    <Store className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{formData.businessName || "Your Store"}</h2>
                                    <p className="text-xs text-gray-500">{formData.subdomain || "your-store"}.paynze.app</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[1,2,3,4].map((i) => (
                                    <div key={i}>
                                        <div className="aspect-square w-full rounded" style={{ background: selectedTheme.preview.accent }}>
                                            <Image src={`https://picsum.photos/seed/product${i}/200`} width={200} height={200} alt="product" className="rounded opacity-50 mix-blend-multiply object-cover w-full h-full"/>
                                        </div>
                                        <div className="mt-1.5 h-3 w-3/4 rounded-sm" style={{ background: selectedTheme.preview.primary }}></div>
                                        <div className="mt-1 h-2 w-1/2 rounded-sm" style={{ background: selectedTheme.preview.accent }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
