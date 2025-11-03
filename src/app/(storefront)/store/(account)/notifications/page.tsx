
'use client';
import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NotificationList } from '@/components/shared/notification-list';
import type { Notification } from '@/lib/types';


const mockCustomerNotifications: Notification[] = [
    { id: 'cust-notif-1', type: 'new-order', title: 'Order Delivered', description: 'Your order #ORD-3210 has been successfully delivered.', timestamp: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), read: true, link: '/store/account/orders/3210', archived: false },
    { id: 'cust-notif-2', type: 'low-stock', title: 'Out for Delivery', description: 'Your order #ORD-3205 is out for delivery and will arrive today.', timestamp: new Date(new Date().setHours(new Date().getHours() - 8)).toISOString(), read: false, link: '/store/account/orders/3205', archived: false },
    { id: 'cust-notif-3', type: 'task-assigned', title: 'Order Shipped', description: 'Your order #ORD-3205 has been shipped and is on its way to you.', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), read: true, link: '/store/account/orders/3205', archived: false },
    { id: 'cust-notif-4', type: 'new-order', title: 'Order Confirmed', description: 'Your order #ORD-3210 has been confirmed and is being processed.', timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), read: true, link: '/store/account/orders/3210', archived: false },
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(mockCustomerNotifications);
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');

    // Notification State Management
    const activeNotifications = useMemo(() => notifications.filter(n => !n.archived), [notifications]);
    const filteredNotifications = useMemo(() => {
        if (notificationFilter === 'unread') return activeNotifications.filter(n => !n.read);
        return activeNotifications;
    }, [activeNotifications, notificationFilter]);
    const unreadCount = useMemo(() => activeNotifications.filter(n => !n.read).length, [activeNotifications]);
    const markAsRead = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
    const markAllAsRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
    const archiveNotification = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n)), []);
    const archiveAllRead = useCallback(() => setNotifications(prev => prev.map(n => n.read ? { ...n, archived: true } : n)), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Stay up to date with your orders and account activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <NotificationList
            notifications={filteredNotifications}
            filter={notificationFilter}
            onFilterChange={setNotificationFilter}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onArchive={archiveNotification}
            onArchiveAllRead={archiveAllRead}
            unreadCount={unreadCount}
            isSheet={false}
        />
      </CardContent>
    </Card>
  );
}
