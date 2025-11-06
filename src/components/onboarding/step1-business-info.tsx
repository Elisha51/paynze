// src/components/onboarding/step1-business-info.tsx
'use client';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { getCountryList } from '@/services/countries';

export default function Step1BusinessInfo() {
  const { formData, setFormData, nextStep } = useOnboarding();
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [countryCode, setCountryCode] = useState('+256');

  useEffect(() => {
    async function loadCountries() {
        const countryList = await getCountryList();
        setCountries(countryList);
        const defaultCountry = countryList.find(c => c.dialCode === countryCode);
        if (defaultCountry) {
            setFormData(prev => ({ ...prev, country: defaultCountry.name }));
        }
    }
    loadCountries();
  }, [countryCode, setFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, contactPhone: `${countryCode}${value}`}));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, businessType: value }));
  };

  const handleCountryCodeChange = (value: string) => {
      setCountryCode(value);
      const phoneInput = document.getElementById('contactPhone') as HTMLInputElement;
      if (phoneInput) {
          setFormData(prev => ({...prev, contactPhone: `${value}${phoneInput.value}`}));
      }
      const selectedCountry = countries.find(c => c.dialCode === value);
      if (selectedCountry) {
          setFormData(prev => ({ ...prev, country: selectedCountry.name }));
      }
  }

  return (
    <Card className="w-full max-w-2xl">
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
          <div className="flex items-center gap-2">
            <Select value={countryCode} onValueChange={handleCountryCodeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
              </SelectContent>
            </Select>
            <Input id="contactPhone" type="tel" placeholder="772 123456" onChange={handlePhoneInputChange} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={nextStep}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
