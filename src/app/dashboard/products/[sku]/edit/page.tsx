
import { ProductForm } from '@/components/dashboard/product-form';
import { getProducts } from '@/services/products';
import type { Product } from '@/lib/types';

export default async function EditProductPage({ params }: { params: { sku: string } }) {
  const { sku } = params;
  const allProducts = await getProducts();
  const product = allProducts.find(p => p.sku === sku);
  
  if(!product) {
      return <div>Product not found</div>
  }

  return <ProductForm initialProduct={product} />;
}
