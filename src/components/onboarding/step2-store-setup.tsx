
// src/components/onboarding/step2-store-setup.tsx
'use client';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Step2StoreSetup() {
  const { formData, setFormData, nextStep, prevStep } = useOnboarding();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setIsAvailable(null);
  };
  
  const handleRadioChange = (id: 'currency' | 'language' | 'domainType', value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const checkAvailability = async () => {
    if (!formData.subdomain) {
        toast({
            variant: 'destructive',
            title: "Subdomain is empty",
            description: "Please enter a subdomain to check.",
        });
        return;
    }
    setIsChecking(true);
    try {
      // Mock availability check with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsAvailable(true);
      toast({
          title: "Subdomain available!",
          description: `${formData.subdomain}.paynze.app is yours.`,
      });
    } catch (error) {
        console.error("Availability check failed:", error);
        setIsAvailable(false);
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Could not check subdomain availability. Please try again.",
        });
    } finally {
        setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Store Setup</CardTitle>
        <CardDescription>Configure your online store settings and domain.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-3 rounded-md border p-4">
            <Label>Store Domain</Label>
            <RadioGroup value={formData.domainType} onValueChange={(v) => handleRadioChange('domainType', v)} className="flex flex-col space-y-2">
                <div className={cn("p-3 rounded-md border", formData.domainType === 'subdomain' && 'bg-muted')}>
                    <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="subdomain" id="subdomain-option" />
                        <Label htmlFor="subdomain-option">Use a free Paynze Subdomain</Label>
                    </div>
                     <div className="flex items-center space-x-2 pl-6">
                        <Input id="subdomain" placeholder="e.g. katos" value={formData.subdomain} onChange={handleInputChange} className="flex-1" disabled={formData.domainType !== 'subdomain'}/>
                         <span className="text-muted-foreground">.paynze.app</span>
                        <Button variant="outline" onClick={checkAvailability} disabled={formData.domainType !== 'subdomain' || !formData.subdomain || isChecking}>
                            {isChecking ? 'Checking...' : 'Check'}
                        </Button>
                    </div>
                    {isAvailable && formData.domainType === 'subdomain' && (
                        <p className="text-sm text-green-600 flex items-center gap-1 mt-2 pl-6">
                            <CheckCircle className="h-4 w-4" /> Your store will be available at {formData.subdomain}.paynze.app
                        </p>
                    )}
                </div>

                <div className={cn("p-3 rounded-md border", formData.domainType === 'custom' && 'bg-muted')}>
                    <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="custom" id="custom-domain-option" />
                        <Label htmlFor="custom-domain-option">Connect a Custom Domain you own</Label>
                    </div>
                    <div className="flex items-center space-x-2 pl-6">
                        <Input id="customDomain" placeholder="e.g. www.katostraders.com" value={formData.customDomain} onChange={handleInputChange} className="flex-1" disabled={formData.domainType !== 'custom'} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 pl-6">You will configure DNS records after sign-up.</p>
                </div>
            </RadioGroup>
        </div>


        <div className="space-y-3">
          <Label>Default Currency</Label>
          <RadioGroup value={formData.currency} onValueChange={(v) => handleRadioChange('currency', v)} className="flex space-x-4">
            <div className="flex items-center space-x-2"><RadioGroupItem value="UGX" id="ugx" /><Label htmlFor="ugx">UGX</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="KES" id="kes" /><Label htmlFor="kes">KES</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="TZS" id="tzs" /><Label htmlFor="tzs">TZS</Label></div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Primary Language</Label>
          <RadioGroup value={formData.language} onValueChange={(v) => handleRadioChange('language', v)} className="flex space-x-4">
            <div className="flex items-center space-x-2"><RadioGroupItem value="English" id="english" /><Label htmlFor="english">English</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Swahili" id="swahili" /><Label htmlFor="swahili">Swahili</Label></div>
          </RadioGroup>
        </div>

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
