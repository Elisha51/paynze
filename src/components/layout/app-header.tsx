
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { SidebarTrigger } from '../ui/sidebar';
import Link from 'next/link';
import { type OnboardingFormData } from '@/context/onboarding-context';
import { NotificationBell } from './notification-bell';
import { ClipboardCheck, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import React, { useEffect, useState } from 'react';
import { getStaffOrders } from '@/services/staff';
import type { Order } from '@/lib/types';
import { getTodos } from '@/services/todos';
import { useAuth } from '@/context/auth-context';
import { getInitials } from '@/lib/utils';
import { Input } from '../ui/input';

type AppHeaderProps = {
    onboardingData: OnboardingFormData | null;
    isDevMode: boolean;
}

export default function AppHeader({ onboardingData, isDevMode }: AppHeaderProps) {
    const { user } = useAuth();
    const [taskCount, setTaskCount] = useState(0);

    useEffect(() => {
        async function loadTaskCount() {
            if (!user) return;
            const [assignedOrders, personalTodos] = await Promise.all([
              getStaffOrders(user.id),
              getTodos()
            ]);
            const todoOrders = assignedOrders.filter(order => !['Delivered', 'Picked Up', 'Cancelled'].includes(order.status));
            const openTodos = personalTodos.filter(todo => todo.status === 'To Do');
            setTaskCount(todoOrders.length + openTodos.length);
        }
        loadTaskCount();
    }, [user]);

    const getMyInitials = (name: string) => {
        if (!name) return 'AD';
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[1][0];
        }
        return name.substring(0, 2);
    }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden" />
      
      <div className="w-full flex-1">
        {/* Search has been removed from here */}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full relative">
            <Link href="/dashboard/my-tasks">
                <ClipboardCheck className="h-5 w-5" />
                {taskCount > 0 && (
                    <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-1 text-xs"
                    >
                        {taskCount}
                    </Badge>
                )}
                <span className="sr-only">My Tasks</span>
            </Link>
        </Button>

        <NotificationBell />

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{user ? getMyInitials(user.name) : '...'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/my-profile">My Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/dashboard/my-tasks">My Tasks</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/login">Logout</Link>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
