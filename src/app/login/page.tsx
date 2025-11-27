
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
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuth } from '@/context/auth-context';
import { getStaff } from '@/services/staff';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Shield } from 'lucide-react';
import type { StaffRoleName } from '@/lib/types';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const onboardingSuccess = searchParams.get('onboarding') === 'success';

  const handleLoginAs = async (role: StaffRoleName) => {
    // Simulate login: find a user with the specified role and log them in directly.
    const allStaff = await getStaff();
    const userToLogin = allStaff.find(s => s.role === role);

    if (userToLogin) {
      login(userToLogin);
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: `Could not find a user with the role "${role}" to log in.`,
      });
    }
  };

  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Merchant Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onboardingSuccess && (
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Store Created!</AlertTitle>
                <AlertDescription className="text-green-700">
                    Your store is ready. Please log in to continue.
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
            <Button onClick={() => handleLoginAs('Admin')} type="submit" className="w-full">
              Login
            </Button>
            
            <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>Developer Controls</AlertTitle>
                <AlertDescription>
                    Use the buttons below to quickly log in as different user roles to test functionality.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" onClick={() => handleLoginAs('Manager')}>Login as Manager</Button>
                 <Button variant="outline" onClick={() => handleLoginAs('Agent')}>Login as Agent</Button>
            </div>

          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
