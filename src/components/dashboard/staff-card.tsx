
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Staff } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { MoreVertical, DollarSign } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';

export function StaffCard({ member, onAwardBonus }: { member: Staff, onAwardBonus: () => void }) {
  const { user } = useAuth();
  const canEditStaff = user?.permissions.staff.edit;

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 relative overflow-hidden">
        {member.status === 'Pending Verification' && (
           <div className="absolute top-0 right-0 h-16 w-16">
            <div className="absolute transform rotate-45 bg-yellow-400 text-center text-white font-semibold py-1 right-[-34px] top-[16px] w-[120px]">
              <span className="text-xs">Verify</span>
            </div>
          </div>
        )}
        <CardContent className="p-4 flex items-center gap-4">
          <Link href={`/dashboard/staff/${member.id}`} className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
             <span className={cn(
                "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background",
                member.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'
            )}></span>
          </Link>
          <div className="flex-1 overflow-hidden">
             <Link href={`/dashboard/staff/${member.id}`} className="block font-semibold truncate hover:underline">
                {member.name}
             </Link>
             <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
          {canEditStaff && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={onAwardBonus}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Award Bonus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )}
        </CardContent>
      </Card>
  );
}

    