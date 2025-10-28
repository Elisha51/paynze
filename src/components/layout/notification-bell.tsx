
'use client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useNotifications } from '@/context/notification-context';
import { NotificationsSheet } from './notifications-sheet';

export function NotificationBell() {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-1 text-xs"
                >
                    {unreadCount}
                </Badge>
                )}
                <span className="sr-only">Toggle notifications</span>
            </Button>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <NotificationsSheet />
        </SheetContent>
    </Sheet>
  );
}
