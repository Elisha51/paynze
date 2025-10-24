// src/context/onboarding-context.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type OnboardingFormData = {
  businessName: string;
  businessType: string;
  contactPhone: string;
  subdomain: string;
  currency: string;
  language: string;
  paymentOptions: {
    cod: boolean;
    mobileMoney: boolean;
  };
  delivery: {
    pickup: boolean;
    address: string;
    deliveryFee: string;
  };
};

type OnboardingContextType = {
  step: number;
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  nextStep: () => void;
  prevStep: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialFormData: OnboardingFormData = {
  businessName: '',
  businessType: 'Retailer',
  contactPhone: '',
  subdomain: '',
  currency: 'UGX',
  language: 'English',
  paymentOptions: {
    cod: true,
    mobileMoney: false,
  },
  delivery: {
    pickup: false,
    address: '',
    deliveryFee: '',
  },
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const { toast } = useToast();

  useEffect(() => {
    // Autosave simulation
    if (step > 1 && step < 5) {
        const timer = setTimeout(() => {
            localStorage.setItem('onboardingDraft', JSON.stringify(formData));
            toast({
              title: "Progress Saved",
              description: "Your onboarding progress has been saved locally.",
            });
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [formData, step, toast]);

  useEffect(() => {
      // Load draft from local storage
      const draft = localStorage.getItem('onboardingDraft');
      if (draft) {
          setFormData(JSON.parse(draft));
      }
  }, [])

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <OnboardingContext.Provider value={{ step, formData, setFormData, nextStep, prevStep }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
