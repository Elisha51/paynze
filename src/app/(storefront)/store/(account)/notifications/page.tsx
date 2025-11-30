
'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NotificationList } from '@/components/shared/notification-list';
import type { Notification, Order } from '@/lib/types';
import { getOrders } from '@/services/orders';


function generateNotificationsFromOrders(orders: Order[]): Notification[] {
  const notifications: Omit<Notification, 'id' | 'read' | 'archived'>[] = [];

  orders.forEach(order => {
    // Notification for order placement
    notifications.push({
      type: 'new-order',
      title: `Order #${order.id} Confirmed`,
      description: `Your order for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total)} has been confirmed.`,
      timestamp: new Date(order.date).toISOString(),
      link: `/store/account/orders/${order.id}`,
    });

    // Notification for shipping
    if (order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Picked Up' || order.status === 'Attempted Delivery') {
      const shipDate = new Date(order.date);
      shipDate.setHours(shipDate.getHours() + 1); // Simulate 1 hour after order
      notifications.push({
        type: 'task-assigned',
        title: `Order #${order.id} Shipped`,
        description: 'Your order is on its way to you.',
        timestamp: shipDate.toISOString(),
        link: `/store/account/orders/${order.id}`,
      });
    }

    // Notification for delivery
    if (order.status === 'Delivered' || order.status === 'Picked Up') {
        const deliveryDate = new Date(order.date);
        deliveryDate.setHours(deliveryDate.getHours() + 6); // Simulate 6 hours after order
         notifications.push({
            type: 'new-order',
            title: `Order #${order.id} Delivered`,
            description: 'Your order has been successfully delivered.',
            timestamp: deliveryDate.toISOString(),
            link: `/store/account/orders/${order.id}`,
        });
    }
  });

  return notifications
    .map((n, index) => ({ ...n, id: `cust-notif-${index}`, read: index > 2, archived: false }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
            if(loggedInCustomerId) {
                const allOrders = await getOrders();
                const customerOrders = allOrders.filter(o => o.customerId === loggedInCustomerId);
                const generatedNotifications = generateNotificationsFromOrders(customerOrders);
                setNotifications(generatedNotifications);
            }
            setIsLoading(false);
        }
        loadData();
    }, []);

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
