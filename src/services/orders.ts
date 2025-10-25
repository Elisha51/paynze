
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
  return [...orders];
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return orders.find(order => order.id === orderId);
}
