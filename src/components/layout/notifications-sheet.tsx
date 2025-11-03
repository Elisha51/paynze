
'use client';
import { useNotifications } from '@/context/notification-context';
import { NotificationList } from '../shared/notification-list';


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
        <NotificationList
            notifications={filteredNotifications}
            filter={filter}
            onFilterChange={setFilter}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onArchive={archiveNotification}
            onArchiveAllRead={archiveAllRead}
            unreadCount={unreadCount}
        />
    );
}
