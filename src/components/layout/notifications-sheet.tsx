
'use client';
import { useNotifications } from '@/context/notification-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { BellRing, PackageX, Bell, Archive, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const iconMap: Record<string, React.ElementType> = {
    'task-assigned': BellRing,
    'low-stock': PackageX,
    'new-order': BellRing,
};

export function NotificationsSheet() {
    const { 
        filteredNotifications,
        filter,
        setFilter,
        markAsRead, 
        markAllAsRead, 
        archiveNotification,
        archiveAllRead,
        unreadCount 
    } = useNotifications();

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b">
                 <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
             <div className="flex items-center justify-between py-2 px-4 border-b">
                <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
                <div className="flex gap-2">
                    <Button variant="link" size="sm" onClick={archiveAllRead} disabled={filteredNotifications.filter(n => n.read).length === 0}>
                        <Archive className="mr-2 h-4 w-4"/>
                        Archive all read
                    </Button>
                    <Button variant="link" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                        Mark all as read
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="divide-y">
                    {filteredNotifications.map(notification => {
                        const Icon = iconMap[notification.type] || Bell;
                        return (
                            <div 
                                key={notification.id} 
                                className={cn(
                                    "p-4 space-y-1 hover:bg-muted/50 group",
                                    !notification.read && 'bg-primary/5'
                                )}
                            >
                                <div className="flex items-start gap-3">
                                     <Icon className="h-5 w-5 text-muted-foreground mt-1" />
                                     <div className="flex-1">
                                        <p className={cn("font-medium text-sm", !notification.read && 'font-bold')}>{notification.title}</p>
                                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        {notification.link && (
                                            <Button variant="link" size="sm" className="h-auto p-0 mt-1" asChild onClick={() => markAsRead(notification.id)}>
                                                <Link href={notification.link}>View Details</Link>
                                            </Button>
                                        )}
                                         <p className="text-xs text-muted-foreground pt-1">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                         </p>
                                     </div>
                                     <div className="flex flex-col items-center gap-2">
                                        {!notification.read && (
                                            <div onClick={() => markAsRead(notification.id)} className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 cursor-pointer" title="Mark as read" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => archiveNotification(notification.id)}
                                            title="Archive notification"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                     </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                 {filteredNotifications.length === 0 && (
                    <div className="text-center py-12 px-4">
                        <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 font-semibold">
                          {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {filter === 'unread' ? 'You have no unread notifications.' : 'New notifications will appear here.'}
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
