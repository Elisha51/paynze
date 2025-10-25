

import { products, orders as mockOrders } from '@/lib/data';
import type { Order, Product } from '@/lib/types';
import { updateProduct } from './products';

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


export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 200));
  let updatedOrder: Order | undefined;
  orders = orders.map(order => {
    if (order.id === orderId) {
      updatedOrder = { ...order, ...updates };
      return updatedOrder;
    }
    return order;
  });
  if (!updatedOrder) {
    throw new Error('Order not found');
  }
  return updatedOrder;
}

export async function updateProductStock(sku: string, quantityChange: number, type: 'Sale' | 'Return' | 'Manual Adjustment' | 'Damage', reason: string) {
    let productToUpdate = products.find(p => p.sku === sku || p.variants.some(v => v.sku === sku));

    if (!productToUpdate) {
        console.warn(`Product with SKU ${sku} not found for stock adjustment.`);
        return;
    }

    const newAdjustment = {
        id: `adj-${Date.now()}`,
        date: new Date().toISOString(),
        type,
        quantity: quantityChange,
        reason,
        channel: 'Manual' as const
    };

    const variantIndex = productToUpdate.variants.findIndex(v => v.sku === sku);
    if (variantIndex > -1) {
        const variant = productToUpdate.variants[variantIndex];
        if (!variant.stockAdjustments) {
            variant.stockAdjustments = [];
        }
        variant.stockAdjustments.push(newAdjustment);

        // This is a simplification. In a real app, you'd find the correct location.
        if (variant.stockByLocation && variant.stockByLocation.length > 0) {
            variant.stockByLocation[0].stock.onHand += quantityChange;
            variant.stockByLocation[0].stock.available += quantityChange;
        }

        productToUpdate.variants[variantIndex] = variant;
    }

    await updateProduct(productToUpdate);
}
