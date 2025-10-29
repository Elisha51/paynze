
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Users } from 'lucide-react';
import type { Staff } from '@/lib/types';
import Link from 'next/link';
import { StaffCard } from './staff-card';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function StaffWidget({ staff, isLoading, onAwardBonus }: { staff: Staff[], isLoading: boolean, onAwardBonus: (member: Staff) => void }) {
  const staffToShow = staff.slice(0, 3);
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
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {staffToShow.map(member => (
        <StaffCard key={member.id} member={member} onAwardBonus={() => onAwardBonus(member)} />
      ))}
      {staff.length > 3 && (
        <Link href="/dashboard/staff" className="flex h-full">
            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardContent className="p-4 flex items-center gap-4 h-full">
                    <Avatar className="h-12 w-12 bg-muted">
                        <AvatarFallback>
                            <Users className="h-6 w-6 text-muted-foreground"/>
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold truncate">View All Staff</p>
                        <p className="text-sm text-muted-foreground">{staff.length} members total</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
      )}
    </div>
  );
}
