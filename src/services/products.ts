

import type { Product, ProductVariant } from '@/lib/types';
import { DataService } from './data-service';

const defaultStock = (onHand: number) => [{ locationName: 'Main Warehouse', stock: { onHand, available: onHand, reserved: 0, damaged: 0, sold: 0 } }];
const emptyStock = () => [{ locationName: 'Main Warehouse', stock: { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 } }];

const initializeMockProducts: () => Product[] = () => [
  // 1. Simple Product (like a laptop)
  {
    productType: 'Physical',
    name: 'Laptop Pro 14"',
    sku: 'LP-PRO-14',
    shortDescription: 'A high-performance laptop for professionals.',
    longDescription: '<p>The Laptop Pro 14" delivers incredible performance with its M3 Pro chip, a stunning Liquid Retina XDR display, and all the ports you need.</p>',
    status: 'published',
    images: [{ id: 'img-laptop', url: `https://picsum.photos/seed/laptop/600/600` }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [{ name: 'Laptop', isBaseUnit: true, contains: 1 }],
    requiresShipping: true,
    retailPrice: 8500000,
    currency: 'UGX',
    isTaxable: true,
    costPerItem: 6000000,
    hasVariants: false,
    options: [],
    variants: [{ 
      id: 'var-laptop-pro-14-piece', 
      optionValues: {}, 
      unitOfMeasure: 'Laptop', 
      price: 8500000,
      sku: 'LP-PRO-14-PCE',
      status: 'In Stock', 
      stockByLocation: defaultStock(25) 
    }],
    productVisibility: ['Online Store'],
    category: 'Electronics',
    wholesalePricing: [],
  },

  // 2. Product with multiple packaging units
  {
    productType: 'Physical',
    name: 'Scented Candle',
    sku: 'CNDL-SCENT',
    shortDescription: 'Aromatic soy wax candle. Available as a single piece or in a box.',
    longDescription: '<p>Relax and unwind with our natural soy wax candles, infused with essential oils. Perfect for any room.</p>',
    status: 'published',
    images: [{ id: 'img-candle', url: 'https://picsum.photos/seed/candle/600/600' }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [
      { name: 'Piece', isBaseUnit: true, contains: 1 },
      { name: 'Box', contains: 12 }
    ],
    requiresShipping: true,
    retailPrice: 15000, // Price of the base unit (Piece)
    currency: 'UGX',
    isTaxable: true,
    costPerItem: 8000,
    hasVariants: false,
    options: [],
    variants: [
      { id: 'var-cndl-pce', unitOfMeasure: 'Piece', optionValues: {}, status: 'In Stock', sku: 'CNDL-PCE', price: 15000, stockByLocation: defaultStock(500) },
      { id: 'var-cndl-box', unitOfMeasure: 'Box', optionValues: {}, status: 'In Stock', sku: 'CNDL-BOX', price: 150000, stockByLocation: emptyStock() }
    ],
    productVisibility: ['Online Store', 'POS'],
    category: 'Home Goods',
    wholesalePricing: [],
  },
  
  // 3. Product with variants (but single packaging)
  {
    productType: 'Physical',
    name: 'Handmade Leather Shoes',
    sku: 'SHOE-002',
    shortDescription: 'Genuine leather shoes, handcrafted by skilled artisans. Durable, comfortable, and stylish.',
    status: 'published',
    images: [{ id: 'img3', url: `https://picsum.photos/seed/SHOE-002/600/600` }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [{ name: 'Pair', isBaseUnit: true, contains: 1 }],
    requiresShipping: true,
    retailPrice: 75000,
    currency: 'UGX',
    wholesalePricing: [{ customerGroup: 'Wholesaler', price: 65000, minOrderQuantity: 10 }],
    isTaxable: true,
    productVisibility: ['POS', 'Online Store'],
    hasVariants: true,
    options: [{ name: 'Size', values: ['42', '43'] }],
    supplierIds: ['SUP-002'],
    variants: [
      {
        id: 'var-shoe-42-pair',
        unitOfMeasure: 'Pair',
        optionValues: { Size: '42' },
        price: 75000,
        sku: 'SHOE-002-42',
        status: 'Low Stock',
        stockByLocation: defaultStock(5),
      },
      { 
        id: 'var-shoe-43-pair',
        unitOfMeasure: 'Pair',
        optionValues: { Size: '43' },
        price: 75000,
        sku: 'SHOE-002-43',
        status: 'In Stock',
        stockByLocation: defaultStock(10),
      },
    ],
    category: 'Footwear',
  },

  // 4. Complex Product (variants + packaging)
  {
    productType: 'Physical',
    name: 'Classic T-Shirt',
    sku: 'TSHIRT-CLASSIC',
    shortDescription: 'A comfortable 100% cotton t-shirt, available in multiple sizes and colors. Can be purchased individually or in a 3-pack.',
    status: 'published',
    images: [{ id: 'img1', url: `https://picsum.photos/seed/TSHIRT-CLASSIC/600/600` }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [
      { name: 'Single Shirt', isBaseUnit: true, contains: 1 },
      { name: '3-Pack', contains: 3 }
    ],
    requiresShipping: true,
    retailPrice: 35000,
    currency: 'UGX',
    isTaxable: true,
    costPerItem: 20000,
    hasVariants: true,
    options: [
        { name: 'Size', values: ['M', 'L'] },
        { name: 'Color', values: ['Black', 'White'] }
    ],
    variants: [
      // Variants for Single Shirt
      { id: 'var-M-B-S', optionValues: { Size: 'M', Color: 'Black' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-M-BLK-S', status: 'In Stock', stockByLocation: defaultStock(100)},
      { id: 'var-L-B-S', optionValues: { Size: 'L', Color: 'Black' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-L-BLK-S', status: 'In Stock', stockByLocation: defaultStock(100)},
      { id: 'var-M-W-S', optionValues: { Size: 'M', Color: 'White' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-M-WHT-S', status: 'In Stock', stockByLocation: defaultStock(120)},
      { id: 'var-L-W-S', optionValues: { Size: 'L', Color: 'White' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-L-WHT-S', status: 'In Stock', stockByLocation: defaultStock(120)},
      // Variants for 3-Pack
      { id: 'var-M-B-P', optionValues: { Size: 'M', Color: 'Black' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-M-BLK-P3', status: 'In Stock', stockByLocation: emptyStock()},
      { id: 'var-L-B-P', optionValues: { Size: 'L', Color: 'Black' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-L-BLK-P3', status: 'In Stock', stockByLocation: emptyStock()},
      { id: 'var-M-W-P', optionValues: { Size: 'M', Color: 'White' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-M-WHT-P3', status: 'In Stock', stockByLocation: emptyStock()},
      { id: 'var-L-W-P', optionValues: { Size: 'L', Color: 'White' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-L-WHT-P3', status: 'In Stock', stockByLocation: emptyStock()},
    ],
    productVisibility: ['Online Store', 'POS'],
    category: 'Apparel',
    wholesalePricing: [],
  },
];

const productService = new DataService<Product>('products', initializeMockProducts, 'sku');

export async function getProducts(): Promise<Product[]> {
  return await productService.getAll();
}

export async function addProduct(product: Omit<Product, 'sku'> & { sku?: string }): Promise<Product> {
  const newProduct: Product = {
    ...product,
    sku: product.sku || `PROD-${Date.now()}`,
  } as Product;
  await productService.create(newProduct);
  return newProduct;
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
  if (!updatedProduct.sku) throw new Error('SKU is required to update a product.');
  return await productService.update(updatedProduct.sku, updatedProduct);
}

export async function deleteProduct(sku: string): Promise<void> {
  await productService.delete(sku);
}
