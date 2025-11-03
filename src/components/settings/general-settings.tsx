
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';
import { getCountryList } from '@/services/countries';

export function GeneralSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({});
    const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }

        async function loadCountries() {
            const countryList = await getCountryList();
            setCountries(countryList);
        }
        loadCountries();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({...prev, [e.target.id]: e.target.value}));
    };

    const handleSelectChange = (id: 'currency' | 'country', value: string) => {
        setSettings(prev => ({...prev, [id]: value}));
    };

    const handleSave = () => {
        localStorage.setItem('onboardingData', JSON.stringify(settings));
        toast({ title: 'Settings Saved', description: 'Your general settings have been updated.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your store's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Store Name</Label>
                    <Input id="businessName" value={settings.businessName || ''} onChange={handleInputChange} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input id="contactPhone" type="tel" value={settings.contactPhone || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country / Region</Label>
                        <Select value={settings.country} onValueChange={(v) => handleSelectChange('country', v)}>
                            <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="currency">Store Currency</Label>
                    <Select value={settings.currency} onValueChange={(v) => handleSelectChange('currency', v)}>
                        <SelectTrigger id="currency" className="w-[180px]">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UGX">UGX</SelectItem>
                            <SelectItem value="KES">KES</SelectItem>
                            <SelectItem value="TZS">TZS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
