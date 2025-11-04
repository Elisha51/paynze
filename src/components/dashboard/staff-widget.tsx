
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus } from 'lucide-react';
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
               <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (staff.length === 0) {
      return (
          <Card>
              <CardContent>
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
              </CardContent>
          </Card>
      )
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {staff.map(member => (
        <StaffCard key={member.id} member={member} />
      ))}
    </div>
  );
}
