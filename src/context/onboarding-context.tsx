// src/context/onboarding-context.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { themes } from '@/lib/themes';

export type OnboardingFormData = {
  plan: 'Free' | 'Premium';
  businessName: string;
  businessType: string;
  contactPhone: string;
  subdomain: string;
  currency: string;
  language: string;
  theme: string;
  paymentOptions: {
    cod: boolean;
    mobileMoney: boolean;
  };
  delivery: {
    pickup: boolean;
    address: string;
    deliveryFee: string;
  };
  inventory?: {
    enableLowStockAlerts?: boolean;
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
  plan: 'Premium',
  businessName: '',
  businessType: 'Retailer',
  contactPhone: '',
  subdomain: '',
  currency: 'UGX',
  language: 'English',
  theme: themes[0].name,
  paymentOptions: {
    cod: true,
    mobileMoney: false,
  },
  delivery: {
    pickup: false,
    address: '',
    deliveryFee: '',
  },
  inventory: {
    enableLowStockAlerts: true,
  }
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const { toast } = useToast();

  useEffect(() => {
    // Autosave simulation
    if (step > 1 && step < 6) { // Now 6 steps with confirmation
        const timer = setTimeout(() => {
            localStorage.setItem('onboardingDraft', JSON.stringify(formData));
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [formData, step, toast]);

  useEffect(() => {
      // Load draft from local storage
      const draft = localStorage.getItem('onboardingDraft');
      if (draft) {
          try {
            const parsedDraft = JSON.parse(draft);
            setFormData(parsedDraft);
             toast({
              title: "Draft Loaded",
              description: "We've loaded your previously saved progress.",
            });
          } catch (e) {
            console.error("Could not parse onboarding draft", e);
          }
      }
  }, [toast])

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
