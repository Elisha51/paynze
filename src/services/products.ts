import { products } from '@/lib/data';
import type { Product } from '@/lib/types';

// In a real app, this would fetch from an API.
// const apiBaseUrl = config.apiBaseUrl;
// const response = await fetch(`${apiBaseUrl}/products`);
// const data = await response.json();
// return data;

export async function getProducts(): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return products;
}
