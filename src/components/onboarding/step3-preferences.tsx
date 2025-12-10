
// src/components/onboarding/step3-preferences.tsx
'use client';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Banknote, Truck } from 'lucide-react';

export default function Step3Preferences() {
  const { formData, setFormData, nextStep, prevStep } = useOnboarding();

  const handleSwitchChange = (id: keyof typeof formData.paymentOptions | keyof typeof formData.delivery, checked: boolean) => {
    if (id === 'pickup') {
      setFormData(prev => ({
        ...prev,
        delivery: { ...prev.delivery, [id]: checked }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        paymentOptions: { ...prev.paymentOptions, [id]: checked }
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
     setFormData(prev => ({
        ...prev,
        delivery: { ...prev.delivery, [id]: value }
      }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Payments & Delivery</CardTitle>
        <CardDescription>Set up your initial payment and delivery options. You can add more later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
            <CardHeader className="flex-row gap-4 items-center">
                <Banknote className="h-6 w-6 text-primary"/>
                <div>
                    <CardTitle className="text-lg">Payment Options</CardTitle>
                    <CardDescription className="text-xs">Choose how your customers will pay.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="cod" className="flex flex-col space-y-1">
                      <span>Enable Cash on Delivery</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Accept cash when you deliver the order.</span>
                    </Label>
                    <Switch id="cod" checked={formData.paymentOptions.cod} onCheckedChange={(c) => handleSwitchChange('cod', c)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="mobileMoney" className="flex flex-col space-y-1">
                      <span>Enable Mobile Money</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Accept MTN, Airtel, M-Pesa. Requires setup after onboarding.</span>
                    </Label>
                    <Switch id="mobileMoney" checked={formData.paymentOptions.mobileMoney} onCheckedChange={(c) => handleSwitchChange('mobileMoney', c)} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row gap-4 items-center">
                <Truck className="h-6 w-6 text-primary"/>
                <div>
                    <CardTitle className="text-lg">Delivery & Pickup</CardTitle>
                    <CardDescription className="text-xs">Define how customers will receive their orders.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                     <Label htmlFor="pickup" className="flex flex-col space-y-1">
                      <span>Enable In-store Pickup</span>
                       <span className="font-normal leading-snug text-muted-foreground text-xs">Allow customers to collect from you.</span>
                    </Label>
                    <Switch id="pickup" checked={formData.delivery.pickup} onCheckedChange={(c) => handleSwitchChange('pickup', c)} />
                </div>
                {formData.delivery.pickup && (
                    <div className="space-y-2 pl-4">
                        <Label htmlFor="address">Pickup Address (Required)</Label>
                        <Input id="address" placeholder="e.g., Shop 14, Kikuubo Lane, Kampala" value={formData.delivery.address} onChange={handleInputChange} required />
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Flat Delivery Fee (optional)</Label>
                     <span className="font-normal leading-snug text-muted-foreground text-xs db-block">Charge a single fee for all deliveries. Leave blank for free delivery.</span>
                    <Input id="deliveryFee" type="number" placeholder="Enter amount" value={formData.delivery.deliveryFee} onChange={handleInputChange} />
                </div>
            </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
