
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';
import { CheckCircle, AlertTriangle, Copy, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export function DomainSettings() {
    const [settings, setSettings] = useState<Partial<OnboardingFormData>>({});
    const [verificationState, setVerificationState] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle');
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const handleRadioChange = (value: string) => {
        setSettings(prev => ({ ...prev, domainType: value as 'subdomain' | 'custom' }));
        setVerificationState('idle'); // Reset verification on type change
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({...prev, [e.target.id]: e.target.value}));
        setVerificationState('idle'); // Reset verification on input change
    };

    const handleSave = () => {
        localStorage.setItem('onboardingData', JSON.stringify(settings));
        toast({ title: 'Settings Saved', description: 'Your domain settings have been updated.' });
    };

    const handleVerify = () => {
        if (settings.domainType !== 'custom' || !settings.customDomain) {
            toast({ variant: 'destructive', title: 'Please enter a custom domain.'});
            return;
        }
        setVerificationState('pending');
        // Simulate DNS check
        setTimeout(() => {
            // In a real app, you'd make an API call to check DNS records
            const success = Math.random() > 0.3; // 70% chance of success
            if (success) {
                setVerificationState('verified');
                toast({ title: 'Domain Verified!', description: 'Your custom domain is now connected.'});
            } else {
                setVerificationState('failed');
                toast({ variant: 'destructive', title: 'Verification Failed', description: 'We could not verify your DNS records. Please check them and try again.'});
            }
        }, 2000);
    }
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Domain Management</CardTitle>
                <CardDescription>Configure the domain for your online storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup value={settings.domainType} onValueChange={handleRadioChange} className="space-y-4">
                    <Label className={cn("border rounded-lg p-4 transition-colors", settings.domainType === 'subdomain' && 'border-primary bg-muted/50')}>
                        <div className="flex items-center space-x-2 mb-2">
                             <RadioGroupItem value="subdomain" id="r1" />
                             <span className="font-semibold">Use a free Paynze subdomain</span>
                        </div>
                        <div className="pl-6 space-y-2">
                             <div className="flex items-center space-x-2">
                                <Input id="subdomain" value={settings.subdomain || ''} onChange={handleInputChange} className="max-w-xs" />
                                <span className="text-muted-foreground">.paynze.app</span>
                            </div>
                        </div>
                    </Label>
                     <Label className={cn("border rounded-lg p-4 transition-colors", settings.domainType === 'custom' && 'border-primary bg-muted/50')}>
                         <div className="flex items-center space-x-2 mb-2">
                             <RadioGroupItem value="custom" id="r2" />
                            <span className="font-semibold">Connect your own domain</span>
                         </div>
                          <div className="pl-6 space-y-2">
                            <Input id="customDomain" placeholder="e.g. www.mystore.com" value={settings.customDomain || ''} onChange={handleInputChange} className="max-w-xs" />
                        </div>
                    </Label>
                </RadioGroup>

                {settings.domainType === 'custom' && settings.customDomain && verificationState !== 'verified' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                Connect Your Custom Domain
                            </CardTitle>
                            <CardDescription>
                                To connect your domain, log in to your domain provider (e.g., GoDaddy, Namecheap) and add the following records.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-semibold">Step 1: Add a TXT Record</Label>
                                <p className="text-xs text-muted-foreground">This record verifies that you own the domain.</p>
                                <div className="grid grid-cols-4 gap-2 p-2 font-mono text-sm bg-muted rounded-md">
                                    <span className="text-muted-foreground col-span-1">Type</span>
                                    <span className="font-bold col-span-3">TXT</span>
                                    <span className="text-muted-foreground col-span-1">Host/Name</span>
                                    <span className="font-bold col-span-3">@</span>
                                    <span className="text-muted-foreground col-span-1">Value</span>
                                    <div className="flex items-center gap-2 col-span-3">
                                        <span className="truncate">paynze-verification=abc123xyz789</span>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard('paynze-verification=abc123xyz789')}><Copy className="h-3 w-3"/></Button>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                             <div className="space-y-2">
                                <Label className="font-semibold">Step 2: Add a CNAME Record</Label>
                                <p className="text-xs text-muted-foreground">This record points your domain to your Paynze store.</p>
                                 <div className="grid grid-cols-4 gap-2 p-2 font-mono text-sm bg-muted rounded-md">
                                    <span className="text-muted-foreground col-span-1">Type</span>
                                    <span className="font-bold col-span-3">CNAME</span>
                                    <span className="text-muted-foreground col-span-1">Host/Name</span>
                                    <span className="font-bold col-span-3">www</span>
                                    <span className="text-muted-foreground col-span-1">Value</span>
                                    <div className="flex items-center gap-2 col-span-3">
                                        <span className="truncate">cname.paynze.com</span>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard('cname.paynze.com')}><Copy className="h-3 w-3"/></Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold">Step 3: Verify Connection</Label>
                                <p className="text-xs text-muted-foreground">After adding both records, click verify. It can sometimes take up to 24 hours for DNS changes to apply worldwide.</p>
                            </div>
                            <Button onClick={handleVerify} disabled={verificationState === 'pending'}>
                                {verificationState === 'pending' ? 'Verifying...' : 'Verify Connection'}
                            </Button>
                             {verificationState === 'failed' && (
                                <div className="text-sm text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Verification failed. Please double-check your records and try again.</span>
                                </div>
                             )}
                        </CardFooter>
                    </Card>
                )}
                 {settings.domainType === 'custom' && verificationState === 'verified' && (
                     <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 mt-1"/>
                        <div>
                            <h4 className="font-semibold">Domain Connected!</h4>
                            <p className="text-sm">Your store is now live at <strong>{settings.customDomain}</strong>. We will continue to manage the SSL certificate for you.</p>
                            <Button variant="link" asChild className="p-0 h-auto text-green-800">
                                <a href={`https://${settings.customDomain}`} target="_blank" rel="noopener noreferrer">Visit Store <ExternalLink className="ml-1 h-4 w-4"/></a>
                            </Button>
                        </div>
                     </div>
                 )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}
