
import { customers as mockCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { getOrders } from './orders';

let customers: Customer[] = [...mockCustomers];

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
