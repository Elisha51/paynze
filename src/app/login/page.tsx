
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuth } from '@/context/auth-context';
import { getStaff } from '@/services/staff';
import type { Staff } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  useEffect(() => {
    async function loadStaff() {
        const staffData = await getStaff();
        setStaff(staffData);
        if (staffData.length > 0) {
            setSelectedStaffId(staffData[0].id);
        }
    }
    loadStaff();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
        router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  const handleLogin = () => {
    if (selectedStaffId) {
        const userToLogin = staff.find(s => s.id === selectedStaffId);
        if (userToLogin) {
            login(userToLogin);
        }
    }
  }

  return (
    <AuthLayout>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Select a user to simulate logging in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="user-select">Select User Role</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger id="user-select">
                        <SelectValue placeholder="Select a user to log in as" />
                    </SelectTrigger>
                    <SelectContent>
                        {staff.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
              Login
            </Button>
            <div className="text-center text-sm text-muted-foreground">This is a simulated login for demonstration.</div>
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
