
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';
import { themes } from '@/lib/themes';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({});
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);
    
    const selectTheme = (themeName: string) => {
        setSettings(prev => ({...prev, theme: themeName}));
    }

    const handleSave = () => {
        localStorage.setItem('onboardingData', JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('theme-changed'));
        toast({ title: 'Theme Updated', description: 'Your new theme has been applied.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Storefront Theme</CardTitle>
                <CardDescription>Choose a visual theme for your customer-facing online store.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {themes.map(theme => (
                    <div
                        key={theme.name}
                        className={cn(
                        'relative border-2 rounded-lg cursor-pointer transition-all duration-200',
                        settings.theme === theme.name ? 'border-primary scale-105 shadow-lg' : 'border-muted'
                        )}
                        onClick={() => selectTheme(theme.name)}
                    >
                        <div className="w-full h-32 bg-gray-200 rounded-t-md p-2">
                        <div className="w-full h-full rounded" style={{ background: theme.preview.background }}>
                            <div className="p-2 space-y-1">
                            <div className="h-4 rounded-sm" style={{ background: theme.preview.primary }}></div>
                            <div className="h-3 w-3/4 rounded-sm" style={{ background: theme.preview.accent }}></div>
                            <div className="h-3 w-1/2 rounded-sm" style={{ background: theme.preview.accent }}></div>
                            </div>
                        </div>
                        </div>
                        <div className="p-2 text-center">
                        <h3 className="text-sm font-semibold">{theme.name}</h3>
                        </div>

                        {settings.theme === theme.name && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Theme</Button>
            </CardFooter>
        </Card>
    );
}
