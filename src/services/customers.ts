


import { customers as mockCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { getOrders } from './orders';
import { subDays, subHours } from 'date-fns';

let customers: Customer[] = [...mockCustomers].map((customer, index) => {
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
    };
});

// In a real app, this would fetch from an API.
// const apiBaseUrl = config.apiBaseUrl;
// const response = await fetch(`${apiBaseUrl}/customers`);
// const data = await response.json();
// return data;

export async function getCustomers(): Promise<Customer[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...customers];
}


export async function getCustomerById(customerId: string): Promise<Customer | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const customer = customers.find(c => c.id === customerId);

  if (customer) {
    const allOrders = await getOrders();
    const customerOrders = allOrders.filter(o => o.customerId === customerId);
    customer.orders = customerOrders;
  }
  
  return customer;
}
