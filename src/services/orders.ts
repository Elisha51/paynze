


import type { Order, Product, Staff, Role, StockAdjustment, CommissionRuleCondition, Affiliate, DeliveryNote } from '@/lib/types';
import { getProducts, updateProduct } from './products';
import { getStaff, updateStaff } from './staff';
import { getRoles } from './roles';
import { DataService } from './data-service';
import { getAffiliates } from './affiliates';
import { addNotification } from './notifications';
import { addTransaction } from './finances';
import { processOrderForCommission } from './commissions';
import { addActivity } from './activities';

function initializeMockOrders(): Order[] {
    const mockOrders: Omit<Order, 'channel' | 'currency' | 'payment'>[] = [
        { 
            id: 'ORD-001', 
            customerId: 'cust-02',
            customerName: 'Olivia Smith',
            customerEmail: 'olivia@example.com',
            date: '2024-07-25T10:30:00Z', 
            status: 'Delivered', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'SHOE-002-42', name: 'Handmade Leather Shoes', quantity: 1, price: 75000, category: 'Footwear' }],
            total: 75000, 
            shippingAddress: { street: '456 Oak Avenue', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
            assignedStaffId: 'staff-003',
            assignedStaffName: 'Peter Jones',
            fulfilledByStaffId: 'staff-003',
            fulfilledByStaffName: 'Peter Jones',
            deliveryNotes: [
                { id: 'note-001a', staffId: 'staff-003', staffName: 'Peter Jones', note: 'Status updated to "Shipped".', date: '2024-07-25T11:00:00Z' },
                { id: 'note-001b', staffId: 'staff-003', staffName: 'Peter Jones', note: 'Status updated to "Delivered". Customer received and signed.', date: '2024-07-25T14:30:00Z' }
            ],
            proofOfDeliveryUrl: 'https://picsum.photos/seed/pod1/400/300'
        },
        { 
            id: 'ORD-002', 
            customerId: 'cust-01',
            customerName: 'Liam Johnson', 
            customerEmail: 'liam@example.com', 
            date: '2024-07-25T11:00:00Z', 
            status: 'Picked Up', 
            fulfillmentMethod: 'Pickup',
            items: [{ sku: 'KIT-001-RF', name: 'Colorful Kitenge Fabric - Red, Floral', quantity: 5, price: 32000, category: 'Fabrics' }],
            total: 160000,
            shippingAddress: { street: '789 Pine Street', city: 'Nairobi', postalCode: '00100', country: 'Kenya' },
            fulfilledByStaffId: 'staff-002',
            fulfilledByStaffName: 'Jane Smith',
            pickupDetails: { name: 'Liam Johnson', phone: '+254712345678', date: '2024-07-25T16:00:00Z'}
        },
         { 
            id: 'ORD-003', 
            customerId: 'cust-03',
            customerName: 'Noah Williams', 
            customerEmail: 'noah@example.com', 
            date: '2024-07-24T14:00:00Z', 
            status: 'Shipped', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'EBOOK-001', name: 'E-commerce Business Guide', quantity: 1, price: 10000, category: 'Digital Goods' }],
            total: 10000,
            shippingAddress: { street: '101 Maple Drive', city: 'Dar es Salaam', postalCode: '11101', country: 'Tanzania' },
            assignedStaffId: 'staff-001', // Assigned to Admin
            assignedStaffName: 'John Doe',
        },
        { 
            id: 'ORD-004', 
            customerId: 'cust-04',
            customerName: 'Emma Brown', 
            customerEmail: 'emma@example.com', 
            date: '2024-07-24T09:00:00Z', 
            status: 'Paid', // Changed to Paid to make it assignable
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
            date: '2024-07-23T16:00:00Z', 
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
            date: '2024-07-23T10:00:00Z', 
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
            date: '2024-07-22T18:00:00Z', 
            status: 'Attempted Delivery', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'JEWEL-01', name: 'Maasai Beaded Necklace', quantity: 2, price: 25000, category: 'Accessories' }],
            total: 50000,
            shippingAddress: { street: '555 Acacia Lane', city: 'Nairobi', postalCode: '00100', country: 'Kenya' },
            assignedStaffId: 'staff-003', // Peter Jones
            assignedStaffName: 'Peter Jones',
            deliveryNotes: [
                { id: 'note-007a', staffId: 'staff-003', staffName: 'Peter Jones', note: 'Status updated to "Shipped".', date: '2024-07-22T18:30:00Z' },
                { id: 'note-007b', staffId: 'staff-003', staffName: 'Peter Jones', note: 'Status updated to "Attempted Delivery". Customer not home.', date: '2024-07-23T12:00:00Z' }
            ],
        },
        { 
            id: 'ORD-008',
            customerId: 'cust-07',
            customerName: 'Ben Carter',
            customerEmail: 'ben@example.com',
            salesAgentId: 'aff-001', // Referred by Fatuma Asha
            salesAgentName: 'Fatuma Asha',
            date: '2024-07-21T12:00:00Z', 
            status: 'Delivered', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'COFF-01', name: 'Rwenzori Coffee Beans', quantity: 1, price: 50000, category: 'Groceries' }],
            total: 50000,
            currency: 'UGX',
            shippingAddress: { street: '777 Test Road', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
            assignedStaffId: 'staff-003',
            assignedStaffName: 'Peter Jones',
            fulfilledByStaffId: 'staff-003',
            fulfilledByStaffName: 'Peter Jones',
            deliveryNotes: [
                 { id: 'note-008a', staffId: 'staff-003', staffName: 'Peter Jones', note: 'Status updated to "Delivered". Left with security guard as per instruction.', date: '2024-07-21T15:00:00Z' }
            ]
        },
        { 
            id: 'ORD-009', 
            customerId: 'cust-02',
            customerName: 'Olivia Smith',
            customerEmail: 'olivia@example.com',
            date: '2024-07-20T11:00:00Z', 
            status: 'Paid', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'COFF-01', name: 'Rwenzori Coffee Beans', quantity: 2, price: 40000, category: 'Groceries' }],
            total: 80000,
            shippingAddress: { street: '456 Oak Avenue', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
        },
        { 
            id: 'ORD-010', 
            customerId: 'cust-02',
            customerName: 'Olivia Smith',
            customerEmail: 'olivia@example.com',
            date: '2024-05-10T15:00:00Z', 
            status: 'Delivered', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'JEWEL-01', name: 'Maasai Beaded Necklace', quantity: 1, price: 25000, category: 'Accessories' }],
            total: 25000,
            shippingAddress: { street: '456 Oak Avenue', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
            fulfilledByStaffId: 'staff-003',
            fulfilledByStaffName: 'Peter Jones'
        },
        { 
            id: 'ORD-011', 
            customerId: 'cust-02',
            customerName: 'Olivia Smith',
            customerEmail: 'olivia@example.com',
            date: '2024-05-10T15:00:00Z', 
            status: 'Delivered', 
            fulfillmentMethod: 'Delivery',
            items: [{ sku: 'KIT-001-BG', name: 'Colorful Kitenge Fabric - Blue, Geometric', quantity: 3, price: 35000, category: 'Fabrics' }],
            total: 105000,
            shippingAddress: { street: '456 Oak Avenue', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
            fulfilledByStaffId: 'staff-003',
            fulfilledByStaffName: 'Peter Jones'
        },
        { 
            id: 'ORD-012', 
            customerId: 'cust-02',
            customerName: 'Olivia Smith',
            customerEmail: 'olivia@example.com',
            date: '2024-04-01T12:00:00Z', 
            status: 'Cancelled', 
            fulfillmentMethod: 'Pickup',
            items: [{ sku: 'SHOE-002-43', name: 'Handmade Leather Shoes - Size 43', quantity: 1, price: 75000, category: 'Footwear' }],
            total: 75000,
            shippingAddress: { street: '456 Oak Avenue', city: 'Kampala', postalCode: '54321', country: 'Uganda' },
        },
    ];
    return [...mockOrders].map((order, index) => {
        const isPaid = order.status !== 'Awaiting Payment' && order.status !== 'Cancelled';
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
    // Prioritize cookie for attribution
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('paynze_affiliate_ref='))?.split('=')[1];
    
    if (cookieValue) {
        const affiliates = await getAffiliates();
        const affiliate = affiliates.find(a => a.uniqueId === cookieValue && a.status === 'Active');
        if (affiliate) {
            newOrder.salesAgentId = affiliate.id;
            newOrder.salesAgentName = affiliate.name;
        }
    }
  }
  
  // Reserve stock
  for (const item of newOrder.items) {
      await updateProductStock(item.sku, item.quantity, 'Reserve', `Order #${newOrder.id}`);
  }

  const createdOrder = await orderService.create(newOrder, { prepend: true });
  
  // Add a notification for the merchant
  await addNotification({
    type: 'new-order',
    title: `New Order #${createdOrder.id}`,
    description: `You've received a new order from ${createdOrder.customerName}.`,
    link: `/dashboard/orders/${createdOrder.id}`
  });
  
  // This is a mock implementation. Real apps would get the logged in user from a session context.
  const allStaff = await getStaff();
  const loggedInUser = allStaff[0]; // Assuming Admin
  if (loggedInUser && newOrder.channel === 'Manual') {
      await addActivity({
          staffId: loggedInUser.id,
          staffName: loggedInUser.name,
          activity: `Manual Order Created`,
          details: { text: `Order #${createdOrder.id}`, link: `/dashboard/orders/${createdOrder.id}` },
      });
  }


  return createdOrder;
}

export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const originalOrder = await orderService.getById(orderId);
    if (!originalOrder) {
        throw new Error('Order not found');
    }

    const isNewlyFulfilled = (updates.status === 'Delivered' || updates.status === 'Picked Up') &&
                             (originalOrder.status !== 'Delivered' && originalOrder.status !== 'Picked Up');

    const isNewlyCancelled = updates.status === 'Cancelled' && originalOrder.status !== 'Cancelled';
    const isNewlyPaid = updates.payment?.status === 'completed' && originalOrder.payment.status !== 'completed';
    const isNewlyShipped = updates.status === 'Shipped' && originalOrder.status !== 'Shipped';
    
    // Automatically add staff name if only ID is provided
    if (updates.assignedStaffId && !updates.assignedStaffName) {
        const staffMember = await getStaff().then(staff => staff.find(s => s.id === updates.assignedStaffId));
        if (staffMember) {
            updates.assignedStaffName = staffMember.name;
        }
    }

    // Un-reserve stock if cancelled
    if (isNewlyCancelled) {
        for (const item of originalOrder.items) {
            await updateProductStock(item.sku, item.quantity, 'Un-reserve', `Order #${orderId} Cancelled`);
        }
    }
    
    // Deduct stock on fulfillment
    if (isNewlyFulfilled) {
        for (const item of originalOrder.items) {
            await updateProductStock(item.sku, item.quantity, 'Sale', `Order #${orderId} Fulfilled`);
        }
         // Handle Cash on Delivery payment by creating a transaction upon fulfillment
        if (originalOrder.payment.method === 'Cash on Delivery' && originalOrder.payment.status !== 'completed') {
            await addTransaction({
                date: new Date().toISOString(),
                description: `Sale from Order #${orderId}`,
                amount: originalOrder.total,
                currency: originalOrder.currency,
                type: 'Income',
                category: 'Sales',
                status: 'Cleared',
                paymentMethod: 'Cash',
            });
             // Update payment status as well
            if (!updates.payment) {
                updates.payment = { ...originalOrder.payment };
            }
            updates.payment.status = 'completed';
        }
    }

    if (isNewlyShipped && !updates.assignedStaffId && !originalOrder.assignedStaffId) {
        throw new Error("Cannot mark order as Shipped without an assigned staff member.");
    }
    
    if (updates.status && updates.status !== originalOrder.status) {
         // This is a mock implementation. Real apps would get the logged in user from a session context.
        const allStaff = await getStaff();
        const loggedInUser = allStaff[0]; // Assuming Admin
        const newNote: DeliveryNote = {
            id: `note-${Date.now()}`,
            staffId: loggedInUser.id,
            staffName: loggedInUser.name,
            note: `Status updated to "${updates.status}".`,
            date: new Date().toISOString(),
        };
        updates.deliveryNotes = [...(originalOrder.deliveryNotes || []), newNote];

        await addActivity({
            staffId: loggedInUser.id,
            staffName: loggedInUser.name,
            activity: `Order Status Updated`,
            details: { text: `Order #${orderId} to ${updates.status}`, link: `/dashboard/orders/${orderId}` },
        });
    }

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

    // Trigger commission calculation after the order state is fully updated.
    if (isNewlyPaid || isNewlyFulfilled) {
        await processOrderForCommission(updatedOrder);
    }
    

    return updatedOrder;
}

export async function updateProductStock(
    variantSku: string, 
    quantityChange: number, 
    type: StockAdjustment['type'], 
    reason: string
) {
    const products = await getProducts();
    let productToUpdate: Product | undefined;
    let variantIndex = -1;

    for (const p of products) {
        const vIndex = p.variants.findIndex(v => v.sku === variantSku);
        if (vIndex !== -1) {
            productToUpdate = p;
            variantIndex = vIndex;
            break;
        }
    }
    
    if (!productToUpdate || variantIndex === -1) {
        console.warn(`Stock update failed: Variant with SKU ${variantSku} not found.`);
        return;
    }
    
    const product = { ...productToUpdate };
    const variant = { ...product.variants[variantIndex] };
    const locationName = 'Main Warehouse'; // Simplification for mock data
    let locIndex = variant.stockByLocation.findIndex(l => l.locationName === locationName);
    
    if (locIndex === -1) {
        variant.stockByLocation.push({ locationName, stock: { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 }});
        locIndex = variant.stockByLocation.length - 1;
    }

    const stock = { ...variant.stockByLocation[locIndex].stock };
    let adjustmentQuantity = 0;

    switch (type) {
        case 'Sale':
            stock.onHand -= quantityChange;
            stock.sold += quantityChange;
            adjustmentQuantity = -quantityChange;
            break;
        case 'Reserve':
            if (stock.available >= quantityChange) {
                stock.available -= quantityChange;
                stock.reserved += quantityChange;
            }
            break;
        case 'Un-reserve':
            if (stock.reserved >= quantityChange) {
                stock.reserved -= quantityChange;
                stock.available += quantityChange;
            }
            break;
        default: 
            // For other types like 'Damage', 'Initial Stock', etc.
            // This logic might need expansion based on requirements.
            break;
    }
    
    variant.stockByLocation[locIndex].stock = stock;

    // We only log "terminal" events like Sale, not temporary holds like Reserve/Un-reserve
    if (type === 'Sale' || type === 'Initial Stock' || type === 'Damage') {
        const adjustment: StockAdjustment = {
            id: `adj-${Date.now()}`,
            date: new Date().toISOString(),
            type,
            quantity: adjustmentQuantity,
            reason,
            channel: 'Online'
        };
        variant.stockAdjustments = [...(variant.stockAdjustments || []), adjustment];
    }
    
    product.variants[variantIndex] = variant;
    await updateProduct(product);
}
