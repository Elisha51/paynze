
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { getProducts } from '@/services/products';
import { ProductDetails } from '@/components/dashboard/product-details';

export default async function ViewProductPage({ params }: { params: { sku: string } }) {
  const { sku } = params;
  const allProducts = await getProducts();
  const product = allProducts.find(p => p.sku === sku);

  if (!product) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="hidden md:inline-flex">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Products</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            View details for product SKU: {product.sku}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button asChild>
                <Link href={`/dashboard/products/${sku}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Product
                </Link>
            </Button>
        </div>
      </div>

      <ProductDetails product={product} />

    </div>
  );
}
