
import type { Notification, Order } from '@/lib/types';
import { subHours, subMinutes, subDays } from 'date-fns';
import { getStaffOrders } from './staff';
import { DataService } from './data-service';

const initializeMockNotifications: (userId: string) => Promise<Notification[]> = async (userId: string) => {
    const assignedOrders = await getStaffOrders(userId);
    const todoOrders = assignedOrders.filter(order => !['Delivered', 'Picked Up', 'Cancelled'].includes(order.status));

    const generatedNotifications: Notification[] = [];

    // Create notifications for each "to do" order
    todoOrders.forEach((order, index) => {
        generatedNotifications.push({
            id: `notif_task_${order.id}`,
            type: 'task-assigned',
            title: `New delivery assigned: Order #${order.id}`,
            description: `A new delivery for customer ${order.customerName} has been assigned to you.`,
            timestamp: subMinutes(new Date(), 5 * (index + 1)).toISOString(),
            read: false,
            link: `/dashboard/orders/${order.id}`,
        });
    });

    // Add some other generic notifications for variety
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
        description: 'You successfully delivered the order to Olivia Smith.',
        timestamp: subDays(new Date(), 1).toISOString(),
        read: true,
        link: '/dashboard/orders/ORD-001',
    });
    
    return generatedNotifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// @ts-ignore
const notificationService = new DataService<Notification>('notifications', initializeMockNotifications);

export async function getNotifications(): Promise<Notification[]> {
    // In a real app, you'd fetch this for the logged-in user.
    return await notificationService.getAll();
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
