// src/components/onboarding/step1-business-info.tsx
'use client';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function Step1BusinessInfo() {
  const { formData, setFormData, nextStep } = useOnboarding();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, businessType: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Business Information</CardTitle>
        <CardDescription>Tell us a bit about your business.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" placeholder="e.g. Kato Traders" value={formData.businessName} onChange={handleInputChange} />
        </div>

        <div className="space-y-3">
          <Label>Business Type</Label>
          <RadioGroup value={formData.businessType} onValueChange={handleRadioChange} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Wholesaler" id="wholesaler" />
              <Label htmlFor="wholesaler">Wholesaler</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Retailer" id="retailer" />
              <Label htmlFor="retailer">Retailer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Stockist" id="stockist" />
              <Label htmlFor="stockist">Stockist</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input id="contactPhone" type="tel" placeholder="+256 772 123456" value={formData.contactPhone} onChange={handleInputChange} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
