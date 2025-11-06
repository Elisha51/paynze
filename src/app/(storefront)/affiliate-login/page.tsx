
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getAffiliates } from '@/services/affiliates';

export default function AffiliateLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    // This is a simulation. A real app would verify credentials.
    // We'll find the affiliate by email and check their status.
    const allAffiliates = await getAffiliates();
    const affiliate = allAffiliates.find(a => a.contact.includes('123456')); // Simulate finding by contact/email

    if (affiliate) {
        // Store a mock session identifier
        localStorage.setItem('loggedInAffiliateId', affiliate.id);
        router.push('/affiliate/dashboard');
    } else {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid credentials. Please try again.',
        });
    }
  };

  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Affiliate Login</CardTitle>
          <CardDescription>
            Enter your credentials to log in to your affiliate dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email or Contact</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. 0772123456"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
                Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Not an affiliate yet?{' '}
            <Link href="/store/affiliate-signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
