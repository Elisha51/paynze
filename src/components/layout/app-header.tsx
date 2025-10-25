
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

type AppHeaderProps = {
    onboardingData: OnboardingFormData | null;
}

export default function AppHeader({ onboardingData }: AppHeaderProps) {
    const getInitials = (name: string) => {
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
        {/* Search form removed */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src="https://picsum.photos/seed/admin/40/40" alt="Admin" />
              <AvatarFallback>{onboardingData ? getInitials(onboardingData.businessName) : 'AD'}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{onboardingData?.businessName || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild><Link href="/dashboard/my-tasks">My Tasks</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/dashboard/my-profile">My Profile</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/login">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
