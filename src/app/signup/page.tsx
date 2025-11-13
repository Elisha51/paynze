
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
import { addStaff } from '@/services/staff';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
        toast({
            variant: 'destructive',
            title: 'All fields are required.',
        });
        return;
    }
    
    // In a real app, you'd have password validation here.

    try {
        // Create the user with an 'Admin' role by default for the new tenant.
        const newUser = await addStaff({
            name,
            email,
            role: 'Admin',
            status: 'Active',
            // In a real app, password would be hashed on the server.
        });
        
        // Automatically log the user in after successful registration.
        login(newUser);

    } catch (error) {
        console.error("Signup failed:", error);
        toast({
            variant: 'destructive',
            title: 'Signup Failed',
            description: 'This email may already be in use. Please try another.',
        });
    }
  };

  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Enter your details to get started with Paynze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleSignup} type="submit" className="w-full">
              Create Account
            </Button>
            <Button variant="outline" className="w-full">
              Sign up with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
