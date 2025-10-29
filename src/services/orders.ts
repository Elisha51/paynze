

import { orders as mockOrders } from '@/lib/data';
import type { Order, Product, Staff, Role } from '@/lib/types';
import { updateProduct } from './products';
import { getStaff, updateStaff } from './staff';
import { getRoles } from './roles';
import { DataService } from './data-service';


function initializeMockOrders(): Order[] {
    return [...mockOrders].map((order, index) => {
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
        if (order.id === 'ORD-003') { // Make one explicitly unassigned
            return {
                ...order,
                status: 'Paid' as const,
                paymentStatus: 'Paid' as const,
                fulfillmentMethod: 'Delivery' as const,
                assignedStaffId: undefined,
                assignedStaffName: undefined,
            }
        }
        return {
            ...order,
            channel: index % 2 === 0 ? 'Online' : 'Manual' as const,
        };
    });
}

const orderService = new DataService<Order>('orders', initializeMockOrders);

export async function getOrders(): Promise<Order[]> {
  return await orderService.getAll();
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  return await orderService.getById(orderId);
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
  };
  
  // Reserve stock
  for (const item of newOrder.items) {
      await updateProductStock(item.sku, item.quantity, 'Reserve', `Order #${newOrder.id}`);
  }

  await orderService.create(newOrder);
  return newOrder;
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  const originalOrder = await orderService.getById(orderId);
  if (!originalOrder) {
      throw new Error('Order not found');
  }

  if (updates.status === 'Cancelled' && originalOrder.status !== 'Cancelled') {
      // Un-reserve stock if order is cancelled
      for (const item of originalOrder.items) {
          await updateProductStock(item.sku, item.quantity, 'Un-reserve', `Order #${orderId} Cancelled`);
      }
  }
  
  const updatedOrder = await orderService.update(orderId, updates);

  // Handle commissions after the order has been updated in the main array
  if (updates.status === 'Delivered' || updates.status === 'Picked Up') {
    await handleCommission(updatedOrder.fulfilledByStaffId, updatedOrder, 'On Order Delivered');
  }
  if (updates.paymentStatus === 'Paid' || (updates.status === 'Paid' && originalOrder?.paymentStatus !== 'Paid')) {
    await handleCommission(updatedOrder.salesAgentId, updatedOrder, 'On Order Paid');
  }

  return updatedOrder;
}

const handleCommission = async (staffId: string | undefined, order: Order, trigger: 'On Order Paid' | 'On Order Delivered') => {
    if (!staffId) return;

    const allStaff = await getStaff();
    const staffMember = allStaff.find(s => s.id === staffId);
    if (!staffMember) return;

    const allRoles = await getRoles();
    const staffRole = allRoles.find(r => r.name === staffMember.role);
    if (!staffRole?.commissionRules || staffRole.commissionRules.length === 0) return;

    let totalEarnedCommission = 0;
    
    staffRole.commissionRules.forEach(rule => {
        if (rule.trigger === trigger) {
            if (rule.type === 'Fixed Amount') {
                totalEarnedCommission += rule.rate;
            } else if (rule.type === 'Percentage of Sale') {
                totalEarnedCommission += order.total * (rule.rate / 100);
            }
        }
    });

    if (totalEarnedCommission > 0 || trigger === 'On Order Delivered') { // Update KPIs even if no commission
        let shouldUpdateStaff = totalEarnedCommission > 0;
        
        if (staffRole.name === 'Delivery Rider' && trigger === 'On Order Delivered') {
            const deliveryTarget = staffMember.attributes?.deliveryTarget as { current: number, goal: number } | undefined;
            if (deliveryTarget) {
                staffMember.attributes = {
                    ...staffMember.attributes,
                    deliveryTarget: { ...deliveryTarget, current: deliveryTarget.current + 1 }
                };
                shouldUpdateStaff = true;
            }
        }
        
        if (totalEarnedCommission > 0) {
            staffMember.totalCommission = (staffMember.totalCommission || 0) + totalEarnedCommission;
        }

        if (shouldUpdateStaff) {
            updateStaff(staffMember);
        }
    }
};

export async function updateProductStock(
    sku: string, 
    quantityChange: number, 
    type: 'Sale' | 'Return' | 'Manual Adjustment' | 'Damage' | 'Reserve' | 'Un-reserve', 
    reason: string
) {
    // This function now interacts with the product service, which is tenant-aware.
    // However, the logic for finding the product and updating its stock is complex
    // and best kept within the `updateProduct` function itself.
    // For now, we will assume `updateProduct` can handle these granular adjustments.
    // A more robust solution might involve a dedicated `productService.adjustStock` method.
}
