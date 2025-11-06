
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
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>(initialSettings);
    const { toast } = useToast();

    useEffect(() => {
        const storedData = localStorage.getItem('onboardingData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setSettings(prev => ({
                ...prev,
                ...parsedData,
                paymentOptions: { ...prev.paymentOptions, ...parsedData.paymentOptions },
                payoutAccounts: { ...prev.payoutAccounts, ...parsedData.payoutAccounts },
            }));
        }
    }, []);

    const handleSwitchChange = (id: keyof OnboardingFormData['paymentOptions'], checked: boolean) => {
        setSettings(prev => ({
            ...prev,
            paymentOptions: { 
                ...(prev.paymentOptions || { cod: false, mobileMoney: false }), 
                [id]: checked 
            }
        }));
    };
    
    const handlePayoutAccountChange = (provider: 'mtn' | 'airtel', value: string) => {
        setSettings(prev => ({
            ...prev, 
            payoutAccounts: {
                ...(prev.payoutAccounts || { mtn: '', airtel: '' }), 
                [provider]: value
            }
        }));
    };

    const handleSave = () => {
         const currentDataRaw = localStorage.getItem('onboardingData');
         const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : {};
         const updatedData = { ...currentData, ...settings };
        localStorage.setItem('onboardingData', JSON.stringify(updatedData));
        toast({ title: 'Payment Settings Saved' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure payment methods for your customers and your payout accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Customer Payment Methods</h3>
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
                </div>

                {settings.paymentOptions?.mobileMoney && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                             <h3 className="font-medium text-sm text-muted-foreground">Your Payout Accounts</h3>
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
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
