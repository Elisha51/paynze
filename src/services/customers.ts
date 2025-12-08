
'use client';
import type { Customer, Staff, Discount, Communication } from '@/lib/types';
import { getOrders } from './orders';
import { subDays, subHours } from 'date-fns';
import { DataService } from './data-service';
import { addActivity } from './activities';
import { getDiscounts } from './marketing'; // <-- Import getDiscounts

async function initializeMockCustomers(): Promise<Customer[]> {
    const allDiscounts = await getDiscounts(); // Fetch all discounts once

    const mockCustomers: Omit<Customer, 'communications' | 'orders' | 'discounts' | 'wishlist'>[] = [
        { id: 'cust-01', name: 'Liam Johnson', email: 'liam@example.com', phone: '+254712345678', customerGroup: 'Wholesaler', lastOrderDate: '2023-01-23', totalSpend: 250000, currency: 'KES', createdAt: '2022-11-15', source: 'Manual', createdById: 'staff-001', createdByName: 'John Doe' },
        { id: 'cust-02', name: 'Olivia Smith', email: 'olivia@example.com', phone: '+254723456789', customerGroup: 'Retailer', lastOrderDate: '2023-02-10', totalSpend: 75000, currency: 'UGX', createdAt: '2023-01-20', source: 'Online' },
        { id: 'cust-03', name: 'Noah Williams', email: 'noah@example.com', phone: '+254734567890', customerGroup: 'default', lastOrderDate: '2023-03-05', totalSpend: 15000, currency: 'KES', createdAt: '2023-03-01', source: 'Online' },
        { id: 'cust-04', name: 'Emma Brown', email: 'emma@example.com', phone: '+254745678901', customerGroup: 'Retailer', lastOrderDate: '2023-03-15', totalSpend: 43000, currency: 'UGX', createdAt: '2023-03-10', source: 'Manual', createdById: 'staff-002', createdByName: 'Jane Smith' },
        { id: 'cust-05', name: 'James Jones', email: 'james@example.com', phone: '+254756789012', customerGroup: 'default', lastOrderDate: '2023-03-20', totalSpend: 36000, currency: 'UGX', createdAt: '2023-03-18', source: 'Manual', createdById: 'staff-002', createdByName: 'Jane Smith' },
        { id: 'cust-06', name: 'Sophia Miller', email: 'sophia@example.com', phone: '+254765432109', customerGroup: 'Retailer', lastOrderDate: '2024-07-22', totalSpend: 50000, currency: 'KES', createdAt: '2024-07-22', source: 'Online' },
        { id: 'cust-07', name: 'Ben Carter', email: 'ben@example.com', phone: '+256772998877', customerGroup: 'default', lastOrderDate: '2024-07-21', totalSpend: 50000, currency: 'UGX', createdAt: '2024-07-21', source: 'Online' },
        { id: 'cust-08', name: 'Chloe Davis', email: 'chloe@example.com', phone: '+256772112233', customerGroup: 'default', lastOrderDate: '2024-07-20', totalSpend: 120000, currency: 'UGX', createdAt: '2024-07-20', source: 'Online' },
    ];

    return [...mockCustomers].map((customer, index) => {
        const baseComms: Communication[] = [
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
        if (index === 1) { // Olivia Smith - our test customer
            baseComms.push({
                id: 'comm-2-1',
                type: 'Meeting' as const,
                content: 'Met at the trade show. Discussed potential for a larger order of leather goods.',
                date: subHours(new Date(), 8).toISOString(),
                staffId: 'staff-001',
                staffName: 'Admin'
            });
        }

        const eligibleDiscounts = allDiscounts.filter(d => 
            d.customerGroup === 'Everyone' || d.customerGroup === customer.customerGroup
        );

        return {
            ...customer,
            communications: baseComms,
            orders: [],
            wishlist: index === 1 ? ['COFF-01', 'JEWEL-01', 'KIT-001-BG', 'EBOOK-001', 'SHOE-002-42'] : [],
            discounts: customer.id === 'cust-02' ? eligibleDiscounts : []
        };
    });
}

const customerService = new DataService<Customer>('customers', initializeMockCustomers);

export async function getCustomers(user?: Staff & { permissions: any }): Promise<Customer[]> {
  if (!user) return []; // If no user, return no customers
  
  const allCustomers = await customerService.getAll();
  
  if (user.permissions.customers?.viewAll || process.env.NODE_ENV === 'development') {
      return allCustomers;
  }
  
  // Return only customers created by the logged-in user if they don't have viewAll permission
  return allCustomers.filter(c => c.createdById === user.id);
}

export async function getCustomerById(customerId: string): Promise<Customer | undefined> {
  const [customer, tenantOrders] = await Promise.all([
    customerService.getById(customerId),
    getOrders()
  ]);

  if (customer) {
    const customerOrders = tenantOrders.filter(o => o.customerId === customerId);
    customer.orders = customerOrders;
  }
  
  return customer;
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'lastOrderDate' | 'totalSpend'>): Promise<Customer> {
    const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        ...customerData,
        lastOrderDate: '',
        totalSpend: 0,
        createdAt: new Date().toISOString(),
        communications: [],
        orders: [],
        wishlist: [],
        discounts: [],
    };
    
    const createdCustomer = await customerService.create(newCustomer, { prepend: true });

    if(customerData.createdById) {
         await addActivity({
            staffId: customerData.createdById,
            staffName: customerData.createdByName || 'Unknown',
            activity: 'Customer Created',
            details: { text: newCustomer.name, link: `/dashboard/customers/${newCustomer.id}` }
        });
    }

    return createdCustomer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return await customerService.update(id, updates);
}
