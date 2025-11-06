'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';

const initialSettings: Partial<OnboardingFormData> = {
    paymentOptions: { cod: true, mobileMoney: false },
    payoutAccounts: { mtn: '', airtel: '' }
};

export function PaymentsSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({});
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedData = JSON.parse(data);
            setSettings({
                ...initialSettings,
                ...parsedData,
                paymentOptions: { ...initialSettings.paymentOptions, ...parsedData.paymentOptions },
                payoutAccounts: { ...initialSettings.payoutAccounts, ...parsedData.payoutAccounts },
            });
        } else {
            setSettings(initialSettings);
        }
    }, []);

    const handleSwitchChange = (id: keyof OnboardingFormData['paymentOptions'], checked: boolean) => {
        setSettings(prev => ({...prev, paymentOptions: { ...(prev.paymentOptions || {}), [id]: checked } as OnboardingFormData['paymentOptions'] }));
    };
    
    const handlePayoutAccountChange = (provider: 'mtn' | 'airtel', value: string) => {
        setSettings(prev => ({
            ...prev, 
            payoutAccounts: {
                ...(prev.payoutAccounts || {}), 
                [provider]: value
            }
        }));
    };

    const handleSave = () => {
        localStorage.setItem('onboardingData', JSON.stringify(settings));
        toast({ title: 'Payment Settings Saved' });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Payment Methods</CardTitle>
                    <CardDescription>Configure the payment methods available to your customers at checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="cod" className="flex flex-col space-y-1">
                        <span>Cash on Delivery</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs">Accept cash when you deliver the order.</span>
                        </Label>
                        <Switch id="cod" checked={settings.paymentOptions?.cod} onCheckedChange={(c) => handleSwitchChange('cod', c)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor="mobileMoney" className="flex flex-col space-y-1">
                        <span>Mobile Money</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs">Accept MTN, Airtel, M-Pesa, and other mobile money providers.</span>
                        </Label>
                        <Switch id="mobileMoney" checked={settings.paymentOptions?.mobileMoney} onCheckedChange={(c) => handleSwitchChange('mobileMoney', c)} />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </CardFooter>
            </Card>

            {settings.paymentOptions?.mobileMoney && (
                <>
                    <Separator />
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout Accounts</CardTitle>
                            <CardDescription>Specify the mobile money accounts where you will receive your funds.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="mtn">MTN Mobile Money Number</Label>
                                <Input 
                                    id="mtn"
                                    type="tel" 
                                    placeholder="+256772123456" 
                                    value={settings.payoutAccounts?.mtn || ''}
                                    onChange={(e) => handlePayoutAccountChange('mtn', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="airtel">Airtel Money Number</Label>
                                <Input
                                    id="airtel"
                                    type="tel" 
                                    placeholder="+256702987654"
                                    value={settings.payoutAccounts?.airtel || ''}
                                    onChange={(e) => handlePayoutAccountChange('airtel', e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </>
            )}
        </div>
    );
}
