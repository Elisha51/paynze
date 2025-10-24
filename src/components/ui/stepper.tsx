
'use client';

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center w-full">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                currentStep > index ? "bg-primary text-primary-foreground" :
                currentStep === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border"
              )}
            >
              {currentStep > index ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <p className={cn(
                "text-xs mt-2 text-center",
                currentStep >= index ? "font-semibold text-foreground" : "text-muted-foreground"
            )}>{step.label}</p>
          </div>

          {index < steps.length - 1 && (
            <div className={cn(
                "flex-1 h-1 mx-4 transition-colors duration-300",
                currentStep > index ? "bg-primary" : "bg-muted"
            )}></div>
          )}
        </div>
      ))}
    </div>
  );
}
