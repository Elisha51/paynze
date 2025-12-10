'use client';

import { OnboardingProvider } from '@/context/onboarding-context';
import { AuthProvider } from '@/context/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        <OnboardingProvider>
            {children}
        </OnboardingProvider>
    </AuthProvider>
  );
}
