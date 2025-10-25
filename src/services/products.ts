import { products as mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

let products: Product[] = [...mockProducts];

// In a real app, this would fetch from an API.
// const apiBaseUrl = config.apiBaseUrl;
// const response = await fetch(`${apiBaseUrl}/products`);
// const data = await response.json();
// return data;

export async function getProducts(): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...products];
}

export async function addProduct(product: Product): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newProduct = { ...product, sku: product.sku || `PROD-${Date.now()}` };
  products.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
  await new Promise(resolve => setTimeout(resolve, 500));
  products = products.map(p => p.sku === updatedProduct.sku ? updatedProduct : p);
  return updatedProduct;
}

export async function deleteProduct(sku: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  products = products.filter(p => p.sku !== sku);
}
