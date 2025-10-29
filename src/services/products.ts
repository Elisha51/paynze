import { products as mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { DataService } from './data-service';

const productService = new DataService<Product>('products', () => mockProducts, 'sku');

export async function getProducts(): Promise<Product[]> {
  return await productService.getAll();
}

export async function addProduct(product: Omit<Product, 'sku'> & { sku?: string }): Promise<Product> {
  const newProduct: Product = {
    ...product,
    sku: product.sku || `PROD-${Date.now()}`,
  } as Product;
  return await productService.create(newProduct);
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
  if (!updatedProduct.sku) throw new Error('SKU is required to update a product.');
  return await productService.update(updatedProduct.sku, updatedProduct);
}

export async function deleteProduct(sku: string): Promise<void> {
  await productService.delete(sku);
}
