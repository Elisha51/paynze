
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';

export function PaymentsSettings() {
    const [settings, setSettings] = useState<OnboardingFormData['paymentOptions']>({
        cod: true,
        mobileMoney: false,
    });
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedData = JSON.parse(data);
            if (parsedData.paymentOptions) {
                setSettings(parsedData.paymentOptions);
            }
        }
    }, []);

    const handleSwitchChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({...prev, [id]: checked }));
    };

    const handleSave = () => {
        const data = localStorage.getItem('onboardingData');
        const fullSettings = data ? JSON.parse(data) : {};
        fullSettings.paymentOptions = settings;
        localStorage.setItem('onboardingData', JSON.stringify(fullSettings));
        toast({ title: 'Payment Settings Saved' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure the payment methods available to your customers at checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="cod" className="flex flex-col space-y-1">
                      <span>Cash on Delivery</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Accept cash when you deliver the order.</span>
                    </Label>
                    <Switch id="cod" checked={settings.cod} onCheckedChange={(c) => handleSwitchChange('cod', c)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="mobileMoney" className="flex flex-col space-y-1">
                      <span>Mobile Money</span>
                      <span className="font-normal leading-snug text-muted-foreground text-xs">Accept MTN, Airtel, M-Pesa, and other mobile money providers.</span>
                    </Label>
                    <Switch id="mobileMoney" checked={settings.mobileMoney} onCheckedChange={(c) => handleSwitchChange('mobileMoney', c)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
