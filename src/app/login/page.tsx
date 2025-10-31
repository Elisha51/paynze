
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuth } from '@/context/auth-context';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('onboarding') === 'success') {
      setShowOnboardingSuccess(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && user) {
        router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  const handleLogin = async () => {
    if (!email || !password) {
        toast({ variant: 'destructive', title: 'Please enter both email and password.' });
        return;
    }
    
    try {
        const allStaff = await getStaff();
        const userToLogin = allStaff.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (userToLogin) {
             // In a real app, you'd validate the password against a hash.
             // For this simulation, we'll accept any non-empty password.
            login(userToLogin);
        } else {
            toast({ variant: 'destructive', title: 'Invalid Credentials', description: 'No user found with that email address.'});
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'An unexpected error occurred.'});
    }
  }

  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Merchant Login</CardTitle>
          <CardDescription>
            Enter your email below to log in to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {showOnboardingSuccess && (
            <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Store Created!</AlertTitle>
                <AlertDescription>
                    Your new store is ready. Log in to continue to your dashboard.
                </AlertDescription>
            </Alert>
          )}
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
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/get-started" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
