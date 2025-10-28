

import { customers as mockCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { getOrders } from './orders';
import { subDays } from 'date-fns';

let customers: Customer[] = [...mockCustomers].map((customer, index) => ({
    ...customer,
    communications: [
        {
            id: `comm-1-${index}`,
            type: 'Note',
            content: 'Initial customer import.',
            date: subDays(new Date(), 10).toISOString(),
            staffId: 'system',
            staffName: 'System'
        },
        ...(index === 0 ? [{
            id: 'comm-2-0',
            type: 'Phone' as const,
            content: 'Called to confirm wholesale pricing interest.',
            date: subDays(new Date(), 5).toISOString(),
            staffId: 'staff-002',
            staffName: 'Jane Smith'
        }] : [])
    ]
}));

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
