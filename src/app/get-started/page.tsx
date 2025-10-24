// src/app/get-started/page.tsx
'use client';
import { OnboardingProvider, useOnboarding } from '@/context/onboarding-context';
import Step1BusinessInfo from '@/components/onboarding/step1-business-info';
import Step2StoreSetup from '@/components/onboarding/step2-store-setup';
import Step3Preferences from '@/components/onboarding/step3-preferences';
import Step4Theme from '@/components/onboarding/step4-theme';
import Step5Confirmation from '@/components/onboarding/step5-confirmation';
import { OnboardingLayout } from '@/components/layout/onboarding-layout';
import { Progress } from '@/components/ui/progress';

function OnboardingWizard() {
  const { step } = useOnboarding();
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const titles: { [key: number]: string } = {
    1: 'Business Information',
    2: 'Store Setup',
    3: 'Payments & Delivery',
    4: 'Choose a Theme',
    5: 'Review & Launch',
  };

  return (
    <OnboardingLayout>
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold tracking-wide text-primary uppercase">Step {step} of {totalSteps}</p>
          <h1 className="text-3xl font-bold font-headline">{titles[step]}</h1>
          <Progress value={progress} className="w-full h-2 mt-4 max-w-md mx-auto" />
        </div>

        {step === 1 && <Step1BusinessInfo />}
        {step === 2 && <Step2StoreSetup />}
        {step === 3 && <Step3Preferences />}
        {step === 4 && <Step4Theme />}
        {step === 5 && <Step5Confirmation />}
      </div>
    </OnboardingLayout>
  );
}

export default function GetStartedPage() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
