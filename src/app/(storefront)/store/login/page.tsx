
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getCustomerById, getCustomers } from '@/services/customers';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function StoreLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleLogin = async () => {
        if (!email) {
            toast({ variant: 'destructive', title: 'Please enter an email address.' });
            return;
        }

        // Simulate successful customer login by finding a user by email.
        const allCustomers = await getCustomers();
        const customer = allCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());

        if (customer) {
            localStorage.setItem('isCustomerLoggedIn', 'true');
            localStorage.setItem('loggedInCustomerId', customer.id);
            // Redirect to the intended page, or back to the store account.
            router.push(redirectUrl || '/store/account');
        } else {
             toast({ variant: 'destructive', title: 'Login Failed', description: 'No customer found with that email address.'});
        }
    }
    
    const handleTestLogin = async () => {
        // Specifically log in as Olivia Smith for demo purposes
        const customer = await getCustomerById('cust-02');
        if (customer) {
            localStorage.setItem('isCustomerLoggedIn', 'true');
            localStorage.setItem('loggedInCustomerId', customer.id);
            router.push(redirectUrl || '/store/account');
        } else {
            toast({ variant: 'destructive', title: 'Demo Login Failed', description: 'Test customer not found.'});
        }
    }

  return (
      <div className="container flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </Link>
                        </div>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" onClick={handleLogin}>
                        Login
                    </Button>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4 text-center">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <h4 className="font-semibold">For Testing Purposes</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Click below to bypass login and view the populated customer dashboard.</p>
                     <Button variant="secondary" className="w-full" onClick={handleTestLogin}>
                        Log in as Olivia Smith (Test User)
                    </Button>
                </div>
                <div className="mt-6 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/store/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
      </div>
  );
}
