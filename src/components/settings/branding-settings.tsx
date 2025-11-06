
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';
import { FileUploader } from '../ui/file-uploader';
import { ProductImage } from '@/lib/types';
import Image from 'next/image';

export function BrandingSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({});
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [e.target.id]: e.target.value }));
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
        toast({ title: 'Branding Settings Saved', description: 'Your branding has been updated.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Manage your store's name and logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Store Name</Label>
                    <Input id="businessName" value={settings.businessName || ''} onChange={handleInputChange} />
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
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
