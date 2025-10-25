

import { orders as mockOrders } from '@/lib/data';
import type { Order } from '@/lib/types';

let orders: Order[] = [...mockOrders];


// In a real app, this would fetch from an API.
// const apiBaseUrl = config.apiBaseUrl;
// const response = await fetch(`${apiBaseUrl}/orders`);
// const data = await response.json();
// return data;

export async function getOrders(): Promise<Order[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Add assignments to mock data
  const assignedOrders = orders.map((order, index) => {
      if (index === 0) { // Assign the first order for delivery
          return {
              ...order,
              assignedStaffId: 'staff-003',
              assignedStaffName: 'Peter Jones',
              fulfilledByStaffId: 'staff-003',
              fulfilledByStaffName: 'Peter Jones',
              channel: 'Online' as const,
          };
      }
      if (index === 1) { // Mark second order as a pickup
          return {
              ...order,
              status: 'Picked Up' as const,
              fulfillmentMethod: 'Pickup' as const,
              fulfilledByStaffId: 'staff-002', // Sales agent handled the pickup
              fulfilledByStaffName: 'Jane Smith',
              channel: 'Manual' as const,
          }
      }
      if (index === 2) {
          return {
              ...order,
              status: 'Ready for Pickup' as const,
              fulfillmentMethod: 'Pickup' as const,
              channel: 'Online' as const,
          }
      }
      return {
          ...order,
          channel: index % 2 === 0 ? 'Online' : 'Manual' as const,
      };
  });
  return [...assignedOrders];
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allOrders = await getOrders();
  return allOrders.find(order => order.id === orderId);
}
