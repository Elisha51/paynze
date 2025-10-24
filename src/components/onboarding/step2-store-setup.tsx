
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

export default function Step2StoreSetup() {
  const { formData, setFormData, nextStep, prevStep } = useOnboarding();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setIsAvailable(null);
  };
  
  const handleRadioChange = (id: 'currency' | 'language', value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const checkAvailability = () => {
    // Mock availability check
    setTimeout(() => {
        setIsAvailable(true);
        toast({
            title: "Subdomain available!",
            description: `katos.paynze.app is yours.`,
        });
    }, 500)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Store Setup</CardTitle>
        <CardDescription>Configure your online store settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subdomain">Desired Subdomain</Label>
          <div className="flex items-center space-x-2">
            <Input id="subdomain" placeholder="e.g. katos" value={formData.subdomain} onChange={handleInputChange} className="flex-1" />
             <span className="text-muted-foreground">.paynze.app</span>
            <Button variant="outline" onClick={checkAvailability}>Check Availability</Button>
          </div>
           {isAvailable && (
              <p className="text-sm text-accent flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Your store will be available at {formData.subdomain}.paynze.app
              </p>
           )}
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
