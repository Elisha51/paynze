import { customers } from '@/lib/data';
import type { Customer } from '@/lib/types';

// In a real app, this would fetch from an API.
// const apiBaseUrl = config.apiBaseUrl;
// const response = await fetch(`${apiBaseUrl}/customers`);
// const data = await response.json();
// return data;

export async function getCustomers(): Promise<Customer[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return customers;
}
