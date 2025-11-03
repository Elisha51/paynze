
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/layout/auth-layout';

export default function AffiliateLoginPage() {
  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Affiliate Login</CardTitle>
          <CardDescription>
            Enter your email to log in to your affiliate dashboard.
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
            <Button type="submit" className="w-full" asChild>
                <Link href="/affiliate/dashboard">Login</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Not an affiliate yet?{' '}
            <Link href="/affiliate-signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

    