
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData, ProductImage } from '@/lib/types';
import { getCountryList } from '@/services/countries';
import { FileUploader } from '../ui/file-uploader';
import { Separator } from '../ui/separator';

export function GeneralSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({});
    const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
    const [countryCode, setCountryCode] = useState('+256');
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
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({...prev, [e.target.id]: Number(e.target.value) || 0}));
    };

    const handleSelectChange = (id: 'currency' | 'country', value: string) => {
        setSettings(prev => ({...prev, [id]: value}));
    };

    const handleLogoChange = (files: (File | ProductImage)[]) => {
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                 setSettings(prev => ({...prev, logoUrl: e.target?.result as string}));
            };
            if (file instanceof File) {
                 reader.readAsDataURL(file);
            }
        } else {
            setSettings(prev => ({...prev, logoUrl: undefined}));
        }
    }

    const handleSave = () => {
        localStorage.setItem('onboardingData', JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('theme-changed'));
        toast({ title: 'Settings Saved', description: 'Your general settings have been updated.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your store's basic information, logo, and location.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Store Name</Label>
                    <Input id="businessName" value={settings.businessName || ''} onChange={handleInputChange} placeholder="e.g. Kato Traders"/>
                </div>
                 <div className="space-y-2">
                    <Label>Logo</Label>
                    <FileUploader 
                        files={settings.logoUrl ? [{ id: 'logo', url: settings.logoUrl }] : []}
                        onFilesChange={handleLogoChange}
                        maxFiles={1}
                        accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.svg'] }}
                    />
                    <p className="text-sm text-muted-foreground">Recommended: Square image, at least 256x256px.</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <div className="flex items-center gap-2">
                            <Select value={countryCode} onValueChange={setCountryCode}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Code" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input id="contactPhone" type="tel" value={settings.contactPhone || ''} onChange={handleInputChange} placeholder="e.g. 772123456"/>
                        </div>
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
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" value={settings.taxRate || ''} onChange={handleNumberChange} className="w-[180px]" placeholder="e.g. 18"/>
                    <p className="text-sm text-muted-foreground">This rate will be applied to products marked as taxable.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
