

import type { Notification, Order } from '@/lib/types';
import { subHours, subMinutes, subDays } from 'date-fns';
import { getOrders } from './orders';
import { DataService } from './data-service';

// This service is now specifically for MERCHANT notifications.

const initializeMockMerchantNotifications: () => Promise<Notification[]> = async () => {
    const orders = await getOrders();
    const newOrders = orders.filter(o => o.status === 'Awaiting Payment' || o.status === 'Paid').slice(0, 2);

    const generatedNotifications: Omit<Notification, 'archived'>[] = [];

    newOrders.forEach((order, index) => {
        generatedNotifications.push({
            id: `notif_new_order_${order.id}`,
            type: 'new-order',
            title: `New Order #${order.id}`,
            description: `You've received a new order for ${order.currency} ${order.total} from ${order.customerName}.`,
            timestamp: subMinutes(new Date(), 15 * (index + 1)).toISOString(),
            read: false,
            link: `/dashboard/orders/${order.id}`,
        });
    });

    generatedNotifications.push({
        id: 'notif_low_stock_1',
        type: 'low-stock',
        title: 'Low Stock Warning',
        description: 'Product "Handmade Leather Shoes - Size 42" is low on stock (2 available).',
        timestamp: subHours(new Date(), 2).toISOString(),
        read: false,
        link: '/dashboard/products/SHOE-002',
    });
     generatedNotifications.push({
        id: 'notif_completed_1',
        type: 'new-order',
        title: 'Order #ORD-001 completed',
        description: 'Peter Jones successfully delivered the order to Olivia Smith.',
        timestamp: subDays(new Date(), 1).toISOString(),
        read: true,
        link: '/dashboard/orders/ORD-001',
    });
    
    return generatedNotifications.map(n => ({...n, archived: false })).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const notificationService = new DataService<Notification>('notifications', initializeMockMerchantNotifications);

export async function getNotifications(): Promise<Notification[]> {
    return await notificationService.getAll();
}

export async function addNotification(notification: Omit<Notification, 'id' | 'read' | 'timestamp' | 'archived'>): Promise<Notification> {
    const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        read: false,
        archived: false,
        timestamp: new Date().toISOString(),
    };
    return await notificationService.create(newNotification, { prepend: true });
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
    return await notificationService.update(id, { read: true });
}

export async function markAllNotificationsAsRead(): Promise<void> {
    const notifications = await notificationService.getAll();
    for (const notification of notifications) {
        if (!notification.read) {
            await notificationService.update(notification.id, { read: true });
        }
    }
}
