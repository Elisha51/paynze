// src/app/get-started/page.tsx
'use client';
import { OnboardingProvider, useOnboarding } from '@/context/onboarding-context';
import Step1BusinessInfo from '@/components/onboarding/step1-business-info';
import Step2StoreSetup from '@/components/onboarding/step2-store-setup';
import Step3Preferences from '@/components/onboarding/step3-preferences';
import Step4Confirmation from '@/components/onboarding/step4-confirmation';
import { OnboardingLayout } from '@/components/layout/onboarding-layout';
import { Progress } from '@/components/ui/progress';

function OnboardingWizard() {
  const { step } = useOnboarding();
  const progress = (step / 4) * 100;

  return (
    <OnboardingLayout>
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="mb-2 text-sm text-muted-foreground">Step {step} of 4</p>
          <Progress value={progress} className="w-full h-2" />
        </div>

        {step === 1 && <Step1BusinessInfo />}
        {step === 2 && <Step2StoreSetup />}
        {step === 3 && <Step3Preferences />}
        {step === 4 && <Step4Confirmation />}
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
