
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, ArrowRight } from 'lucide-react';
import type { Staff } from '@/lib/types';
import Link from 'next/link';
import { StaffCard } from './staff-card';

export function StaffWidget({ staff, isLoading }: { staff: Staff[], isLoading: boolean }) {
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
        <StaffCard key={member.id} member={member} />
      ))}
      {staff.length > 3 && (
        <Link href="/dashboard/staff" className="flex">
            <Card className="flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer w-full">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                    <ArrowRight className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-semibold">View All Staff</h3>
                    <p className="text-sm text-muted-foreground">{staff.length} members total</p>
                </CardContent>
            </Card>
        </Link>
      )}
    </div>
  );
}
