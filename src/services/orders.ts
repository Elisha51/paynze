

import { products, orders as mockOrders } from '@/lib/data';
import type { Order, Product, Staff } from '@/lib/types';
import { updateProduct } from './products';
import { getStaff, updateStaff } from './staff';

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

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
  };
  
  // Reserve stock
  for (const item of newOrder.items) {
      await updateProductStock(item.sku, item.quantity, 'Reserve', `Order #${newOrder.id}`);
  }

  orders.unshift(newOrder);
  return newOrder;
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const originalOrder = orders.find(o => o.id === orderId);
  let updatedOrder: Order | undefined;

  if (originalOrder && updates.status === 'Cancelled' && originalOrder.status !== 'Cancelled') {
      // Un-reserve stock if order is cancelled
      for (const item of originalOrder.items) {
          await updateProductStock(item.sku, item.quantity, 'Un-reserve', `Order #${orderId} Cancelled`);
      }
  }

  // If a staff member fulfilled the order, update their performance metrics
  if (updates.status === 'Delivered' && updates.fulfilledByStaffId) {
    const allStaff = await getStaff();
    const staffMember = allStaff.find(s => s.id === updates.fulfilledByStaffId);

    if (staffMember && staffMember.role === 'Delivery Rider') {
        const deliveryTarget = staffMember.attributes?.deliveryTarget as { current: number; goal: number } | undefined;
        if (deliveryTarget) {
            const newAttributes = {
                ...staffMember.attributes,
                deliveryTarget: {
                    ...deliveryTarget,
                    current: deliveryTarget.current + 1,
                },
            };
            await updateStaff({ ...staffMember, attributes: newAttributes });
        }
    }
  }

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

export async function updateProductStock(
    sku: string, 
    quantityChange: number, 
    type: 'Sale' | 'Return' | 'Manual Adjustment' | 'Damage' | 'Reserve' | 'Un-reserve', 
    reason: string
) {
    let productToUpdate = products.find(p => p.sku === sku || p.variants.some(v => v.sku === sku));

    if (!productToUpdate) {
        console.warn(`Product with SKU ${sku} not found for stock adjustment.`);
        return;
    }

    const newAdjustment = {
        id: `adj-${Date.now()}`,
        date: new Date().toISOString(),
        type,
        quantity: type === 'Sale' ? -quantityChange : quantityChange,
        reason,
        channel: 'Manual' as const
    };

    const variantIndex = productToUpdate.variants.findIndex(v => v.sku === sku);
    
    if (variantIndex > -1) {
        const variant = productToUpdate.variants[variantIndex];
        if (!variant.stockAdjustments) {
            variant.stockAdjustments = [];
        }

        // We only add a formal adjustment for persistent changes
        if (type !== 'Reserve' && type !== 'Un-reserve') {
            variant.stockAdjustments.push(newAdjustment);
        }

        // This is a simplification. In a real app, you'd find the correct location.
        if (variant.stockByLocation && variant.stockByLocation.length > 0) {
            const stock = variant.stockByLocation[0].stock;
            switch(type) {
                case 'Reserve':
                    stock.available -= quantityChange;
                    stock.reserved += quantityChange;
                    break;
                case 'Un-reserve':
                    stock.available += quantityChange;
                    stock.reserved -= quantityChange;
                    break;
                case 'Sale': // This happens on fulfillment (delivery/pickup)
                    stock.onHand -= quantityChange;
                    stock.reserved -= quantityChange; // The reservation is now fulfilled
                    break;
                case 'Return':
                    stock.onHand += quantityChange;
                    stock.available += quantityChange;
                    break;
                case 'Damage':
                    stock.onHand -= quantityChange;
                    stock.damaged += quantityChange;
                    break;
                case 'Manual Adjustment':
                    // For manual changes that can be positive or negative
                    stock.onHand += newAdjustment.quantity;
                    stock.available += newAdjustment.quantity;
                    break;
            }
             productToUpdate.variants[variantIndex] = variant;
        }
    }

    await updateProduct(productToUpdate);
}
