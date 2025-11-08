
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { OnboardingFormData } from '@/lib/types';
import { CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Plan = 'Growth' | 'Pro' | 'Enterprise';

const plans: {
  name: Plan;
  price: string;
  features: string[];
  isCurrent?: boolean;
}[] = [
  { name: 'Growth', price: 'Free', features: ['Online Storefront', 'Unlimited Products', 'Basic Analytics', 'Manual Order Fulfillment'] },
  { name: 'Pro', price: '$25/mo', features: ['All Growth features', 'Advanced Analytics', 'Affiliate Program', 'Marketing Automation'] },
  { name: 'Enterprise', price: 'Contact Us', features: ['All Pro features', 'Custom Integrations', 'Developer API Access', 'Dedicated Support'] },
];

export function BillingSettings() {
    const { user, setUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handlePlanChange = () => {
        if (!selectedPlan) return;

        const onboardingDataRaw = localStorage.getItem('onboardingData');
        if (onboardingDataRaw) {
            const onboardingData = JSON.parse(onboardingDataRaw);
            onboardingData.plan = selectedPlan;
            localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        }
        
        if (user) {
            setUser({ ...user, plan: selectedPlan });
        }

        toast({
            title: `Plan changed to ${selectedPlan}`,
            description: `Your features have been updated.`,
        });
        setSelectedPlan(null);
    }
    
    const currentPlanIndex = plans.findIndex(p => p.name === user?.plan);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You are currently on the <span className="font-semibold text-primary">{user?.plan}</span> plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Manage your subscription and view feature availability below.</p>
                </CardContent>
            </Card>

            <AlertDialog>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <Card key={plan.name} className={cn("flex flex-col", user?.plan === plan.name && "border-primary ring-2 ring-primary")}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className={cn("h-6 w-6", user?.plan === plan.name && "text-primary")} />
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">{plan.price}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {user?.plan === plan.name ? (
                                    <Button disabled className="w-full">Current Plan</Button>
                                ) : (
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            onClick={() => setSelectedPlan(plan.name)}
                                            className="w-full"
                                            variant={index > currentPlanIndex ? 'default' : 'outline'}
                                        >
                                            {index > currentPlanIndex ? 'Upgrade' : 'Downgrade'}
                                        </Button>
                                    </AlertDialogTrigger>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to change your subscription plan to <span className="font-bold text-foreground">{selectedPlan}</span>.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPlan(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePlanChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
