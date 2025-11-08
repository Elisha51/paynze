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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

type Plan = 'Growth' | 'Pro' | 'Enterprise';

const plans: {
  name: Plan;
  price: string;
  priceAmount: number;
  features: string[];
}[] = [
  { name: 'Growth', price: 'Free', priceAmount: 0, features: ['Online Storefront', 'Unlimited Products', 'Basic Analytics', 'Manual Order Fulfillment'] },
  { name: 'Pro', price: '$25/mo', priceAmount: 25, features: ['All Growth features', 'Advanced Analytics', 'Affiliate Program', 'Marketing Automation'] },
  { name: 'Enterprise', price: 'Contact Us', priceAmount: 100, features: ['All Pro features', 'Custom Integrations', 'Developer API Access', 'Dedicated Support'] },
];

const mockBillingHistory = [
    { date: '2024-07-01', description: 'Pro Plan Subscription', amount: 25, status: 'Paid' },
    { date: '2024-06-01', description: 'Pro Plan Subscription', amount: 25, status: 'Paid' },
    { date: '2024-05-01', description: 'Pro Plan Subscription', amount: 25, status: 'Paid' },
]

export function BillingSettings() {
    const { user, setUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');

    const handlePlanChange = (newPlan: Plan) => {
        const onboardingDataRaw = localStorage.getItem('onboardingData');
        if (onboardingDataRaw) {
            const onboardingData = JSON.parse(onboardingDataRaw);
            onboardingData.plan = newPlan;
            localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        }
        
        if (user) {
            setUser({ ...user, plan: newPlan });
        }
        
        setIsUpgradeDialogOpen(false);
        setMobileMoneyNumber('');
        setIsProcessingPayment(false);

        toast({
            title: `Plan changed to ${newPlan}`,
            description: `Your features have been updated.`,
        });
    }

    const handleUpgrade = () => {
        if (!selectedPlan) return;
        setIsProcessingPayment(true);
        // Simulate API call for payment
        setTimeout(() => {
             handlePlanChange(selectedPlan);
        }, 2500);
    }
    
    const currentPlanIndex = plans.findIndex(p => p.name === user?.plan);
    const selectedPlanDetails = plans.find(p => p.name === selectedPlan);

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
                            ) : index > currentPlanIndex ? (
                                // Upgrade Button
                                <Dialog open={isUpgradeDialogOpen && selectedPlan === plan.name} onOpenChange={(isOpen) => { if (!isOpen) setIsUpgradeDialogOpen(false); }}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => { setSelectedPlan(plan.name); setIsUpgradeDialogOpen(true); }} className="w-full">Upgrade</Button>
                                    </DialogTrigger>
                                </Dialog>
                            ) : (
                                // Downgrade Button
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button onClick={() => setSelectedPlan(plan.name)} className="w-full" variant="outline">Downgrade</Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to downgrade to {plan.name}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You will lose access to premium features at the end of your current billing cycle.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handlePlanChange(plan.name)}>Confirm Downgrade</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>A record of your past subscription payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockBillingHistory.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell><Badge variant="default">{item.status}</Badge></TableCell>
                                    <TableCell className="text-right font-medium">${item.amount}.00</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Upgrade to {selectedPlanDetails?.name} Plan</DialogTitle>
                    <CardDescription>Confirm your payment to unlock new features.</CardDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                        <span className="font-semibold">Amount Due Today</span>
                        <span className="font-bold text-lg">{selectedPlanDetails?.price.replace('/mo', '')}</span>
                    </div>
                     <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="mobile-money">Mobile Money Number</Label>
                        <Input id="mobile-money" type="tel" placeholder="e.g. 0772123456" value={mobileMoneyNumber} onChange={(e) => setMobileMoneyNumber(e.target.value)} />
                        <p className="text-xs text-muted-foreground">A payment prompt will be sent to this number.</p>
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isProcessingPayment}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpgrade} disabled={isProcessingPayment || !mobileMoneyNumber}>
                        {isProcessingPayment ? 'Processing...' : 'Confirm & Pay'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </div>
    );
}
