'use client';

import { Card, CardContent } from '@/components/ui/card';
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
  
  const coreStaff = staff.filter(s => s.role !== 'Affiliate');

  if (coreStaff.length === 0) {
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
  
  const displayedStaff = coreStaff.slice(0, 3);
  
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {displayedStaff.map(member => (
        <div key={member.id} className="col-span-1">
            <StaffCard member={member} />
        </div>
      ))}
       <div className="col-span-2 sm:col-span-1 h-full">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <Link href="/dashboard/staff" className="block h-full">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
                        <Avatar className="h-12 w-12 bg-muted">
                            <AvatarFallback className="bg-transparent">
                                <Users className="h-6 w-6 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold truncate">View All Staff</p>
                            <p className="text-sm text-muted-foreground">Manage roles & permissions</p>
                        </div>
                         <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Link>
            </Card>
      </div>
    </div>
  );
}
