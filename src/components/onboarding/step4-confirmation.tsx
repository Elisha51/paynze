// src/components/onboarding/step4-confirmation.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Store, Globe, Wallet, Truck } from 'lucide-react';

export default function Step4Confirmation() {
  const { formData, prevStep } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();

  const handleLaunch = () => {
    localStorage.setItem('onboardingData', JSON.stringify(formData));
    toast({
        title: "Store Created!",
        description: "Welcome to Payze. You are now being redirected to your dashboard.",
        variant: "default"
    });
    setTimeout(() => {
        router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <Card className="col-span-2 md:col-span-1">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Store Preview & Confirmation</CardTitle>
            <CardDescription>Review your details below. If everything looks good, launch your store!</CardDescription>
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
                <p><strong>URL:</strong> {formData.subdomain}.payze.app</p>
                <p><strong>Currency:</strong> {formData.currency}</p>
                <p><strong>Language:</strong> {formData.language}</p>
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
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>Back</Button>
            <Button onClick={handleLaunch} className="bg-accent hover:bg-accent/90">Launch My Store</Button>
        </CardFooter>
        </Card>
        <div className="hidden md:block">
            <Card>
                <CardHeader>
                    <CardTitle>Live Store Preview</CardTitle>
                    <CardDescription>This is a mock preview of your new storefront.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-100 p-4 rounded-lg border">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Store className="h-8 w-8 text-gray-400"/>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{formData.businessName}</h2>
                                    <p className="text-sm text-gray-500">{formData.subdomain}.payze.app</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
