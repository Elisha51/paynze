

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Staff } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export function StaffCard({ member }: { member: Staff }) {
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Link href={`/dashboard/staff/${member.id}`} className="block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
             <span className={cn(
                "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background",
                member.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'
            )}></span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold truncate">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
            {member.status === 'Pending Verification' && (
                <Badge variant="secondary" className="mt-1">Pending</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
