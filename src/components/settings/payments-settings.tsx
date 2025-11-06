
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getCountryList } from '@/services/countries';

const initialSettings: Partial<OnboardingFormData> = {
    paymentOptions: { cod: true, mobileMoney: false },
    payoutAccounts: { mtn: '', airtel: '' }
};

export function PaymentsSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>(initialSettings);
    const { toast } = useToast();
    const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
    
    // Derived state for country codes to avoid complex logic in useEffect dependencies
    const mtnCountryCode = settings.payoutAccounts?.mtn?.match(/^\+\d+/)?.[0] || '+256';
    const airtelCountryCode = settings.payoutAccounts?.airtel?.match(/^\+\d+/)?.[0] || '+256';
    
    // Local state for input fields to avoid controlled/uncontrolled issues
    const [mtnNumber, setMtnNumber] = useState('');
    const [airtelNumber, setAirtelNumber] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedData = JSON.parse(data);
            // Deep merge to ensure all keys are present
            setSettings(prev => ({
                ...prev,
                ...parsedData,
                paymentOptions: { ...prev.paymentOptions, ...parsedData.paymentOptions },
                payoutAccounts: { ...prev.payoutAccounts, ...parsedData.payoutAccounts },
            }));

            // Initialize local input state from loaded data
            const loadedMtnCode = parsedData.payoutAccounts?.mtn?.match(/^\+\d+/)?.[0] || '+256';
            const loadedAirtelCode = parsedData.payoutAccounts?.airtel?.match(/^\+\d+/)?.[0] || '+256';
            setMtnNumber(parsedData.payoutAccounts?.mtn?.replace(loadedMtnCode, '') || '');
            setAirtelNumber(parsedData.payoutAccounts?.airtel?.replace(loadedAirtelCode, '') || '');
        }
        async function loadCountries() {
            const countryList = await getCountryList();
            setCountries(countryList);
        }
        loadCountries();
    }, []);

    const handleSwitchChange = (id: keyof OnboardingFormData['paymentOptions'], checked: boolean) => {
        setSettings(prev => ({...prev, paymentOptions: { ...prev.paymentOptions, [id]: checked } as OnboardingFormData['paymentOptions'] }));
    };

    const handlePayoutAccountChange = (provider: 'mtn' | 'airtel', numberValue: string) => {
        const countryCode = provider === 'mtn' ? mtnCountryCode : airtelCountryCode;
        if (provider === 'mtn') {
            setMtnNumber(numberValue);
        } else {
            setAirtelNumber(numberValue);
        }
        
        setSettings(prev => ({
            ...prev,
            payoutAccounts: {
                ...(prev.payoutAccounts || {}),
                [provider]: `${countryCode}${numberValue}`
            }
        }));
    }

    const handleCountryCodeChange = (provider: 'mtn' | 'airtel', newCode: string) => {
        const numberValue = provider === 'mtn' ? mtnNumber : airtelNumber;
        setSettings(prev => ({
            ...prev,
            payoutAccounts: {
                ...(prev.payoutAccounts || {}),
                [provider]: `${newCode}${numberValue}`
            }
        }));
    }

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
                                <Label>MTN Mobile Money Number</Label>
                                <div className="flex items-center gap-2">
                                    <Select value={mtnCountryCode} onValueChange={(v) => handleCountryCodeChange('mtn', v)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <Input 
                                        type="tel" 
                                        placeholder="772 123456" 
                                        value={mtnNumber}
                                        onChange={(e) => handlePayoutAccountChange('mtn', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Airtel Money Number</Label>
                                <div className="flex items-center gap-2">
                                    <Select value={airtelCountryCode} onValueChange={(v) => handleCountryCodeChange('airtel', v)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Code" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <Input 
                                        type="tel" 
                                        placeholder="702 987654"
                                        value={airtelNumber}
                                        onChange={(e) => handlePayoutAccountChange('airtel', e.target.value)}
                                    />
                                </div>
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
