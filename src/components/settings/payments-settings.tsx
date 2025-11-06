
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

export function PaymentsSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({
        paymentOptions: { cod: true, mobileMoney: false },
        payoutAccounts: { mtn: '', airtel: '' }
    });
    const { toast } = useToast();
    const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
    const [mtnCountryCode, setMtnCountryCode] = useState('+256');
    const [airtelCountryCode, setAirtelCountryCode] = useState('+256');

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedData = JSON.parse(data);
            setSettings(prev => ({...prev, ...parsedData}));
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

    const handlePayoutAccountChange = (provider: 'mtn' | 'airtel', value: string) => {
        setSettings(prev => ({
            ...prev,
            payoutAccounts: {
                ...(prev.payoutAccounts || {}),
                [provider]: value
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
                                    <Select value={mtnCountryCode} onValueChange={setMtnCountryCode}>
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
                                        value={settings.payoutAccounts?.mtn?.replace(mtnCountryCode, '') || ''}
                                        onChange={(e) => handlePayoutAccountChange('mtn', `${mtnCountryCode}${e.target.value}`)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Airtel Money Number</Label>
                                <div className="flex items-center gap-2">
                                    <Select value={airtelCountryCode} onValueChange={setAirtelCountryCode}>
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
                                        value={settings.payoutAccounts?.airtel?.replace(airtelCountryCode, '') || ''}
                                        onChange={(e) => handlePayoutAccountChange('airtel', `${airtelCountryCode}${e.target.value}`)}
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
