

import type { Customer } from '@/lib/types';
import { getOrders } from './orders';
import { subDays, subHours } from 'date-fns';
import { DataService } from './data-service';

function initializeMockCustomers(): Customer[] {
    const mockCustomers: Omit<Customer, 'communications' | 'orders' | 'discounts' | 'wishlist'>[] = [
        { id: 'cust-01', name: 'Liam Johnson', email: 'liam@example.com', phone: '+254712345678', customerGroup: 'Wholesaler', lastOrderDate: '2023-01-23', totalSpend: 250000, currency: 'KES', createdAt: '2022-11-15' },
        { id: 'cust-02', name: 'Olivia Smith', email: 'olivia@example.com', phone: '+254723456789', customerGroup: 'Retailer', lastOrderDate: '2023-02-10', totalSpend: 75000, currency: 'UGX', createdAt: '2023-01-20' },
        { id: 'cust-03', name: 'Noah Williams', email: 'noah@example.com', phone: '+254734567890', customerGroup: 'default', lastOrderDate: '2023-03-05', totalSpend: 15000, currency: 'KES', createdAt: '2023-03-01' },
        { id: 'cust-04', name: 'Emma Brown', email: 'emma@example.com', phone: '+254745678901', customerGroup: 'Retailer', lastOrderDate: '2023-03-15', totalSpend: 43000, currency: 'UGX', createdAt: '2023-03-10' },
        { id: 'cust-05', name: 'James Jones', email: 'james@example.com', phone: '+254756789012', customerGroup: 'default', lastOrderDate: '2023-03-20', totalSpend: 36000, currency: 'UGX', createdAt: '2023-03-18' },
        { id: 'cust-06', name: 'Sophia Miller', email: 'sophia@example.com', phone: '+254765432109', customerGroup: 'Retailer', lastOrderDate: '2024-07-22', totalSpend: 50000, currency: 'KES', createdAt: '2024-07-22' },
    ];

    return [...mockCustomers].map((customer, index) => {
        const baseComms = [
            {
                id: `comm-1-${index}`,
                type: 'Note' as const,
                content: 'Initial customer import from previous system.',
                date: subDays(new Date(), 10).toISOString(),
                staffId: 'system',
                staffName: 'System'
            }
        ];

        if (index === 0) {
            baseComms.push({
                id: 'comm-2-0',
                type: 'Phone' as const,
                content: 'Called to confirm wholesale pricing interest. Sent over the latest catalog.',
                date: subDays(new Date(), 5).toISOString(),
                staffId: 'staff-002',
                staffName: 'Jane Smith'
            });
            baseComms.push({
                id: 'comm-3-0',
                type: 'Note' as const,
                content: 'This is a reply to the phone call log.',
                date: subDays(new Date(), 4).toISOString(),
                staffId: 'staff-001',
                staffName: 'Admin',
                threadId: 'comm-2-0'
            });
        }
        if (index === 1) {
            baseComms.push({
                id: 'comm-2-1',
                type: 'Meeting' as const,
                content: 'Met at the trade show. Discussed potential for a larger order of leather goods.',
                date: subHours(new Date(), 8).toISOString(),
                staffId: 'staff-001',
                staffName: 'Admin'
            });
        }

        return {
            ...customer,
            communications: baseComms,
            wishlist: index === 1 ? ['COFF-01', 'JEWEL-01'] : [],
            discounts: index === 1 ? [
                { code: 'WELCOME15', type: 'Percentage', value: 15, status: 'Active', redemptions: 0, minPurchase: 0, customerGroup: 'Everyone', usageLimit: 1, onePerCustomer: true },
                { code: 'FREESHIP', type: 'Fixed Amount', value: 10000, status: 'Active', redemptions: 0, minPurchase: 50000, customerGroup: 'Everyone', usageLimit: 1, onePerCustomer: true, description: 'Free shipping on your next order' },
            ] : []
        };
    });
}

const customerService = new DataService<Customer>('customers', initializeMockCustomers);

export async function getCustomers(): Promise<Customer[]> {
  return await customerService.getAll();
}

export async function getCustomerById(customerId: string): Promise<Customer | undefined> {
  // Fetching the customer and orders for the current tenant.
  const [customer, tenantOrders] = await Promise.all([
    customerService.getById(customerId),
    getOrders() // This service is already tenant-aware.
  ]);

  if (customer) {
    // Filter orders for this specific customer from the tenant's orders.
    const customerOrders = tenantOrders.filter(o => o.customerId === customerId);
    customer.orders = customerOrders;
  }
  
  return customer;
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
    return await customerService.update(customer.id, customer);
}
