
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function CustomerLoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, you'd have authentication logic here.
    // For this simulation, we'll just redirect to the account page.
    router.push('/store/account');
  };

  return (
      <div className="container py-12">
        <Card className="mx-auto max-w-sm">
            <CardHeader>
            <CardTitle className="text-2xl">Customer Login</CardTitle>
            <CardDescription>
                Enter your email and password to access your account.
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
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" onClick={handleLogin}>
                    Login
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
                Don't have an account?{' '}
                <Link href="/store/signup" className="underline">
                Sign up
                </Link>
            </div>
            </CardContent>
        </Card>
      </div>
  );
}
