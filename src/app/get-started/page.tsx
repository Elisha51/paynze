
// src/app/get-started/page.tsx
'use client';
import { OnboardingProvider, useOnboarding } from '@/context/onboarding-context';
import Step1BusinessInfo from '@/components/onboarding/step1-business-info';
import Step2StoreSetup from '@/components/onboarding/step2-store-setup';
import Step3Preferences from '@/components/onboarding/step3-preferences';
import { ThemeSelector } from '@/themes/theme-selector';
import Step5Confirmation from '@/components/onboarding/step5-confirmation';
import { OnboardingLayout } from '@/components/layout/onboarding-layout';
import { Progress } from '@/components/ui/progress';
import Step3CatalogUpload from '@/components/onboarding/step3-catalog-upload';

function OnboardingWizard() {
  const { step } = useOnboarding();
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const titles: { [key: number]: string } = {
    1: 'Business Information',
    2: 'Store Setup',
    3: 'Upload Your Catalog',
    4: 'Configure Payments & Delivery',
    5: 'Choose a Theme',
    6: 'Review & Launch',
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BusinessInfo />;
      case 2:
        return <Step2StoreSetup />;
      case 3:
        return <Step3CatalogUpload />;
      case 4:
        return <Step3Preferences />; // This is now for Payments & Delivery
      case 5:
        return <ThemeSelector />;
      case 6:
        return <Step5Confirmation />;
      default:
        return <Step1BusinessInfo />;
    }
  };

  return (
    <OnboardingLayout>
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold tracking-wide text-primary uppercase">Step {step} of {totalSteps}</p>
          <h1 className="text-3xl font-bold font-headline">{titles[step]}</h1>
          <Progress value={progress} className="w-full h-2 mt-4 max-w-md mx-auto" />
        </div>
        
        <div className="flex items-start justify-center">
            {renderStep()}
        </div>

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
