
// src/components/onboarding/step2-store-setup.tsx
'use client';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface AvailabilityResponse {
  isAvailable: boolean;
  message: string;
}

export default function Step2StoreSetup() {
  const { formData, setFormData, nextStep, prevStep } = useOnboarding();
  
  // State management for the availability check
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, [id]: sanitizedValue }));
    // Reset validation state on input change
    setIsAvailable(null);
    setError(null);
    setValidationMessage(null);
  };
  
  const handleRadioChange = (id: 'currency' | 'language' | 'domainType', value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const checkAvailability = async () => {
    // 1. Initial State Reset
    setError(null);
    setValidationMessage(null);
    setIsAvailable(null);
    setIsLoading(true);

    if (!formData.subdomain) {
      setError("Subdomain cannot be empty.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Mock API Call
      await new Promise(resolve => setTimeout(resolve, 750));

      // 3. Mock HTTP Error Check
      if (formData.subdomain === 'admin' || formData.subdomain === 'error') {
        throw new Error(`The subdomain '${formData.subdomain}' is reserved or invalid.`);
      }
      
      // 4. Mock Success Handling
      const isTaken = ['store', 'shop', 'test'].includes(formData.subdomain);
      const data: AvailabilityResponse = {
        isAvailable: !isTaken,
        message: isTaken 
          ? `Sorry, '${formData.subdomain}' is already taken.`
          : `Success! '${formData.subdomain}' is available.`
      };
      
      setIsAvailable(data.isAvailable);
      setValidationMessage(data.message);

    } catch (error) {
      // 5. Catch Errors
      console.error("Availability check failed:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsAvailable(false); // Assume unavailable on error

    } finally {
      // 6. Cleanup
      setIsLoading(false);
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
                        <Button variant="outline" onClick={checkAvailability} disabled={formData.domainType !== 'subdomain' || !formData.subdomain || isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Check'}
                        </Button>
                    </div>
                     {formData.domainType === 'subdomain' && (
                        <div className="pl-6 pt-2 text-sm">
                            {isAvailable === true && validationMessage && (
                                <p className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" /> {validationMessage}
                                </p>
                            )}
                            {isAvailable === false && validationMessage && !error && (
                                <p className="text-destructive flex items-center gap-1">
                                    <XCircle className="h-4 w-4" /> {validationMessage}
                                </p>
                            )}
                             {error && (
                                <p className="text-destructive flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" /> {error}
                                </p>
                            )}
                        </div>
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
        <Button onClick={nextStep} disabled={formData.domainType === 'subdomain' && isAvailable !== true}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
