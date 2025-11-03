
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';

export function ShippingSettings() {
  const [deliverySettings, setDeliverySettings] = useState<OnboardingFormData['delivery']>({
      pickup: false,
      address: '',
      deliveryFee: '',
  });
  const { toast } = useToast();
  
  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.delivery) {
            setDeliverySettings(parsedData.delivery);
        }
    }
  }, []);

  const handleToggle = (id: keyof OnboardingFormData['delivery']) => {
    setDeliverySettings(prev => ({ ...prev, [id]: !prev[id as 'pickup'] }) );
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliverySettings(prev => ({...prev, [e.target.id]: e.target.value}));
  };
  
  const handleSave = () => {
    const data = localStorage.getItem('onboardingData');
    const fullSettings = data ? JSON.parse(data) : {};
    fullSettings.delivery = deliverySettings;
    localStorage.setItem('onboardingData', JSON.stringify(fullSettings));
    toast({ title: 'Shipping Settings Saved' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping & Delivery</CardTitle>
        <CardDescription>Configure how your customers receive their orders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label className="font-semibold">In-store Pickup</Label>
                <p className="text-xs text-muted-foreground">Allow customers to collect their orders from your location.</p>
            </div>
            <Switch
                checked={deliverySettings.pickup}
                onCheckedChange={() => handleToggle('pickup')}
            />
        </div>
        {deliverySettings.pickup && (
            <div className="space-y-2 pl-4">
                <Label htmlFor="address">Pickup Address</Label>
                <Input id="address" value={deliverySettings.address} onChange={handleInputChange} />
            </div>
        )}
        <div className="rounded-lg border p-4 space-y-2">
            <Label htmlFor="deliveryFee" className="font-semibold">Flat Rate Delivery</Label>
            <p className="text-xs text-muted-foreground">Charge a single fixed fee for all deliveries.</p>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">UGX</span>
                <Input
                    type="number"
                    id="deliveryFee"
                    value={deliverySettings.deliveryFee}
                    onChange={handleInputChange}
                    className="w-48 pl-10 h-9"
                    placeholder="e.g. 10000"
                />
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
