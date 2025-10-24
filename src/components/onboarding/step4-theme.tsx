// src/components/onboarding/step4-theme.tsx
'use client';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { themes } from '@/lib/themes';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Step4Theme() {
  const { formData, setFormData, nextStep, prevStep } = useOnboarding();

  const selectTheme = (themeName: string) => {
    setFormData(prev => ({ ...prev, theme: themeName }));
  };

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themes.map(theme => (
              <div
                key={theme.name}
                className={cn(
                  'relative border-2 rounded-lg cursor-pointer transition-all duration-200',
                  formData.theme === theme.name ? 'border-primary scale-105' : 'border-muted'
                )}
                onClick={() => selectTheme(theme.name)}
              >
                <div className="w-full h-32 bg-gray-200 rounded-t-md p-2">
                  <div className="w-full h-full rounded" style={{ background: theme.preview.background }}>
                    <div className="p-2 space-y-1">
                      <div className="h-4 rounded-sm" style={{ background: theme.preview.primary }}></div>
                      <div className="h-3 w-3/4 rounded-sm" style={{ background: theme.preview.accent }}></div>
                      <div className="h-3 w-1/2 rounded-sm" style={{ background: theme.preview.accent }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-2 text-center">
                  <h3 className="text-sm font-semibold">{theme.name}</h3>
                </div>

                {formData.theme === theme.name && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={prevStep}>Back</Button>
          <Button onClick={nextStep}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
