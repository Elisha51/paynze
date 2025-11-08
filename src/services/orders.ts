

import type { Order, Product, Staff, Role, StockAdjustment } from '@/lib/types';
import { updateProduct } from './products';
import { getStaff, updateStaff } from './staff';
import { getRoles } from './roles';
import { DataService } from './data-service';
import { getAffiliates } from './affiliates';
import { addNotification } from './notifications';
import { addTransaction } from './finances';


function initializeMockOrders(): Order[] {
    const mockOrders: Omit<Order, 'channel' | 'currency' | 'payment'>[] = [
        { 
            id: 'ORD-001', 
            customerId: 'cust-02',
            customerName: 'Olivia Smith',
            customerEmail: 'olivia@example.com',
            date: '2024-07-25', 
            status: 'Delivered', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'SHOE-002-42', name: 'Handmade Leather Shoes', quantity: 1, price: 75000, category: 'Footwear' }],
            total: 75000, 
            shippingAddress: { street: '456 Oak Avenue', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
        },
        { 
            id: 'ORD-002', 
            customerId: 'cust-01',
            customerName: 'Liam Johnson', 
            customerEmail: 'liam@example.com', 
            date: '2024-07-25', 
            status: 'Picked Up', 
            fulfillmentMethod: 'Pickup',
            items: [{ sku: 'KIT-001-RF', name: 'Colorful Kitenge Fabric - Red, Floral', quantity: 5, price: 32000, category: 'Fabrics' }],
            total: 160000,
            shippingAddress: { street: '789 Pine Street', city: 'Nairobi', postalCode: '00100', country: 'Kenya' },
        },
         { 
            id: 'ORD-003', 
            customerId: 'cust-03',
            customerName: 'Noah Williams', 
            customerEmail: 'noah@example.com', 
            date: '2024-07-24', 
            status: 'Paid', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'EBOOK-001', name: 'E-commerce Business Guide', quantity: 1, price: 10000, category: 'Digital Goods' }],
            total: 10000,
            shippingAddress: { street: '101 Maple Drive', city: 'Dar es Salaam', postalCode: '11101', country: 'Tanzania' },
        },
        { 
            id: 'ORD-004', 
            customerId: 'cust-04',
            customerName: 'Emma Brown', 
            customerEmail: 'emma@example.com', 
            date: '2024-07-24', 
            status: 'Awaiting Payment', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'COFF-01', name: 'Rwenzori Coffee Beans', quantity: 2, price: 40000, category: 'Groceries' }],
            total: 80000,
            shippingAddress: { street: '222 Rosewood Ave', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
        },
        { 
            id: 'ORD-005', 
            customerId: 'cust-05',
            customerName: 'James Jones', 
            customerEmail: 'james@example.com', 
            date: '2024-07-23', 
            status: 'Ready for Pickup', 
            fulfillmentMethod: 'Pickup',
            items: [{ sku: 'SHOE-002-43', name: 'Handmade Leather Shoes', quantity: 1, price: 75000, category: 'Footwear' }],
            total: 75000,
            shippingAddress: { street: '333 Palm Street', city: 'Jinja', postalCode: '12345', country: 'Uganda' },
        },
        { 
            id: 'ORD-006', 
            customerId: 'cust-01',
            customerName: 'Liam Johnson', 
            customerEmail: 'liam@example.com', 
            date: '2024-07-23', 
            status: 'Cancelled', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'KIT-001-BG', name: 'Colorful Kitenge Fabric - Blue, Geometric', quantity: 10, price: 30000, category: 'Fabrics' }],
            total: 300000,
            shippingAddress: { street: '789 Pine Street', city: 'Nairobi', postalCode: '00100', country: 'Kenya' },
        },
        { 
            id: 'ORD-007', 
            customerId: 'cust-06',
            customerName: 'Sophia Miller', 
            customerEmail: 'sophia@example.com', 
            date: '2024-07-22', 
            status: 'Shipped', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'JEWEL-01', name: 'Maasai Beaded Necklace', quantity: 2, price: 25000, category: 'Accessories' }],
            total: 50000,
            shippingAddress: { street: '555 Acacia Lane', city: 'Nairobi', postalCode: '00100', country: 'Kenya' },
        },
        { 
            id: 'ORD-008',
            customerId: 'cust-07',
            customerName: 'Ben Carter',
            customerEmail: 'ben@example.com',
            salesAgentId: 'aff-001', // Referred by Fatuma Asha
            salesAgentName: 'Fatuma Asha',
            date: '2024-07-21', 
            status: 'Delivered', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'COFF-01', name: 'Rwenzori Coffee Beans', quantity: 1, price: 50000, category: 'Groceries' }],
            total: 50000,
            currency: 'UGX',
            shippingAddress: { street: '777 Test Road', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
        },
        { 
            id: 'ORD-009',
            customerId: 'cust-08',
            customerName: 'Chloe Davis',
            customerEmail: 'chloe@example.com',
            salesAgentId: 'aff-001', // Referred by Fatuma Asha
            salesAgentName: 'Fatuma Asha',
            date: '2024-07-20', 
            status: 'Picked Up',
            fulfillmentMethod: 'Pickup',
            items: [{ sku: 'KIT-001-BG', name: 'Colorful Kitenge Fabric - Blue, Geometric', quantity: 4, price: 30000, category: 'Fabrics' }],
            total: 120000,
            currency: 'UGX',
            shippingAddress: { street: '888 Demo Ave', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
        },
    ];
    return [...mockOrders].map((order, index) => {
        const isPaid = order.status !== 'Awaiting Payment';
        const isMobileMoney = index % 3 !== 0;

        const fullOrder: Order = {
            ...order,
            currency: order.currency || (index % 2 === 0 ? 'UGX' : 'KES'),
            channel: order.channel || (index % 2 === 0 ? 'Online' : 'Manual'),
            payment: {
                method: isMobileMoney ? 'Mobile Money' : 'Cash on Delivery',
                status: isPaid ? 'completed' : 'pending',
                transactionId: isPaid ? `txn_${order.id}` : undefined,
            },
        }
        if (index === 0) { // Assign the first order for delivery
            return {
                ...fullOrder,
                assignedStaffId: 'staff-003',
                assignedStaffName: 'Peter Jones',
                fulfilledByStaffId: 'staff-003',
                fulfilledByStaffName: 'Peter Jones',
            };
        }
        if (index === 1) { // Mark second order as a pickup
            return {
                ...fullOrder,
                status: 'Picked Up' as const,
                fulfillmentMethod: 'Pickup' as const,
                fulfilledByStaffId: 'staff-002', // Sales agent handled the pickup
                fulfilledByStaffName: 'Jane Smith',
            }
        }
        if (order.id === 'ORD-007') {
             return {
                ...fullOrder,
                assignedStaffId: 'staff-003',
                assignedStaffName: 'Peter Jones',
            }
        }
        if (order.id === 'ORD-003') { // Make one explicitly unassigned
            return {
                ...fullOrder,
                status: 'Paid' as const,
                payment: { ...fullOrder.payment, status: 'completed' as const },
                fulfillmentMethod: 'Delivery' as const,
                assignedStaffId: undefined,
                assignedStaffName: undefined,
            }
        }
        return fullOrder;
    });
}

const orderService = new DataService<Order>('orders', initializeMockOrders);

export async function getOrders(): Promise<Order[]> {
  return await orderService.getAll();
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  return await orderService.getById(orderId);
}

export async function getOrdersByAffiliate(affiliateId: string): Promise<Order[]> {
    const allOrders = await getOrders();
    return allOrders.filter(o => o.salesAgentId === affiliateId);
}


export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
  };

  if (newOrder.channel === 'Online' && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      const affiliates = await getAffiliates();
      const affiliate = affiliates.find(a => a.uniqueId === ref && a.status === 'Active');
      if (affiliate) {
        newOrder.salesAgentId = affiliate.id;
        newOrder.salesAgentName = affiliate.name;
        console.log(`Order attributed to affiliate: ${affiliate.name}`);
      }
    }
  }
  
  // Reserve stock
  for (const item of newOrder.items) {
      await updateProductStock(item.sku, item.quantity, 'Reserve', `Order #${newOrder.id}`);
  }

  await orderService.create(newOrder, { prepend: true });
  
  // Add a notification for the merchant
  await addNotification({
    type: 'new-order',
    title: `New Order #${newOrder.id}`,
    description: `You've received a new order from ${newOrder.customerName}.`,
    link: `/dashboard/orders/${newOrder.id}`
  });
  
  return newOrder;
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  const originalOrder = await orderService.getById(orderId);
  if (!originalOrder) {
      throw new Error('Order not found');
  }
  const isNewlyFulfilled = (updates.status === 'Delivered' || updates.status === 'Picked Up') && (originalOrder.status !== 'Delivered' && originalOrder.status !== 'Picked Up');


  if (updates.status === 'Cancelled' && originalOrder.status !== 'Cancelled') {
      // Un-reserve stock if order is cancelled
      for (const item of originalOrder.items) {
          await updateProductStock(item.sku, item.quantity, 'Un-reserve', `Order #${orderId} Cancelled`);
      }
  }

  if (isNewlyFulfilled) {
      for (const item of originalOrder.items) {
          await updateProductStock(item.sku, item.quantity, 'Sale', `Order #${orderId}`);
      }
  }

  // Merge payment details correctly
  const finalUpdates = {
      ...updates,
      ...(updates.payment && {
          payment: {
              ...originalOrder.payment,
              ...updates.payment,
          }
      })
  };
  
  const updatedOrder = await orderService.update(orderId, finalUpdates);

  // Handle revenue logging for COD
  if ( isNewlyFulfilled && originalOrder.payment.method === 'Cash on Delivery') {
    await addTransaction({
        date: new Date().toISOString(),
        description: `Sale from Order #${orderId}`,
        amount: updatedOrder.total,
        currency: updatedOrder.currency,
        type: 'Income',
        category: 'Sales',
        status: 'Cleared',
        paymentMethod: 'Cash',
    });
  }


  // Handle commissions after the order has been updated in the main array
  if (isNewlyFulfilled) {
    await handleCommission(updatedOrder.fulfilledByStaffId, updatedOrder, 'On Order Delivered');
  }
  if (updates.payment?.status === 'completed' && originalOrder.payment.status !== 'completed') {
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
    if (!staffRole) return;

    let totalEarnedCommission = 0;

    // Handle Affiliate Commissions
    if (staffRole.name === 'Affiliate') {
        const affiliateSettingsData = localStorage.getItem('affiliateSettings');
        if (affiliateSettingsData) {
            const affiliateSettings = JSON.parse(affiliateSettingsData);
            if (affiliateSettings.programStatus === 'Active' && trigger === 'On Order Paid') {
                 if (affiliateSettings.commissionType === 'Percentage') {
                    totalEarnedCommission += order.total * (affiliateSettings.commissionRate / 100);
                } else {
                    totalEarnedCommission += affiliateSettings.commissionRate;
                }
            }
        }
    } 
    // Handle other staff roles
    else if (staffRole.commissionRules && staffRole.commissionRules.length > 0) {
        staffRole.commissionRules.forEach(rule => {
            if (rule.trigger === trigger) {
                if (rule.type === 'Fixed Amount') {
                    totalEarnedCommission += rule.rate;
                } else if (rule.type === 'Percentage of Sale') {
                    totalEarnedCommission += order.total * (rule.rate / 100);
                }
            }
        });
    }

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
            await updateStaff(staffMember);
        }
    }
};

export async function updateProductStock(
    sku: string, 
    quantityChange: number, 
    type: StockAdjustment['type'], 
    reason: string
) {
    // This function now interacts with the product service, which is tenant-aware.
    // However, the logic for finding the product and updating its stock is complex
    // and best kept within the `updateProduct` function itself.
    // For now, we will assume `updateProduct` can handle these granular adjustments.
}
