
'use client';
import { useNotifications } from '@/context/notification-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { BellRing, PackageX } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
    'task-assigned': BellRing,
    'low-stock': PackageX,
    'new-order': BellRing,
};

export function NotificationsSheet() {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between py-2 border-b">
                <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
                <Button variant="link" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                    Mark all as read
                </Button>
            </div>
            <ScrollArea className="flex-1 -mx-6">
                <div className="divide-y">
                    {notifications.map(notification => {
                        const Icon = iconMap[notification.type] || BellRing;
                        return (
                            <div 
                                key={notification.id} 
                                className={cn(
                                    "p-3 px-6 space-y-1 hover:bg-muted/50",
                                    !notification.read && 'bg-primary/5'
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start gap-3">
                                     <Icon className="h-5 w-5 text-muted-foreground mt-1" />
                                     <div className="flex-1">
                                        <p className={cn("font-medium text-sm", !notification.read && 'font-bold')}>{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        {notification.link && (
                                            <Button variant="link" size="sm" className="h-auto p-0 mt-1" asChild>
                                                <Link href={notification.link}>View Details</Link>
                                            </Button>
                                        )}
                                         <p className="text-xs text-muted-foreground pt-1">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                     </div>
                                      {!notification.read && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                                      )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                 {notifications.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">You have no notifications.</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
