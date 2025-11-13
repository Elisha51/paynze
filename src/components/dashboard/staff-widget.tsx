
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import type { Staff } from '@/lib/types';
import Link from 'next/link';
import { StaffCard } from './staff-card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { EmptyState } from '../ui/empty-state';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';

export function StaffWidget({ staff, isLoading }: { staff: Staff[], isLoading: boolean }) {
  const { user } = useAuth();
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border p-3 rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
  }
  
  const coreStaff = staff.filter(s => s.role !== 'Affiliate');

  return (
      <Card>
          <CardHeader>
              <CardTitle>Staff & Agents</CardTitle>
              <CardDescription>A quick overview of your team.</CardDescription>
          </CardHeader>
          <CardContent>
                {coreStaff.length === 0 ? (
                    <EmptyState 
                        icon={<UserPlus className="h-12 w-12 text-primary"/>}
                        title="No Staff Members Found"
                        description="You haven't added any staff members yet. Add your first team member to get started."
                        cta={ user?.permissions.staff.create &&
                            <Button asChild>
                                <Link href="/dashboard/staff/add">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Staff Member
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {coreStaff.slice(0, 3).map(member => (
                            <StaffCard key={member.id} member={member} />
                        ))}
                        <Link href="/dashboard/staff" className="block border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <Users className="h-8 w-8 text-muted-foreground mb-2"/>
                                <p className="font-semibold text-sm">View All Staff</p>
                                <p className="text-xs text-muted-foreground">Manage roles & permissions</p>
                            </div>
                        </Link>
                    </div>
                )}
          </CardContent>
      </Card>
  );
}

    