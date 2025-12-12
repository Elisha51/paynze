
import type { Product } from '@/lib/types';
import { DataService } from './data-service';

const initializeMockProducts: () => Product[] = () => [
  {
    productType: 'Physical',
    name: 'Classic T-Shirt',
    sku: 'TSHIRT-CLASSIC',
    shortDescription: 'A comfortable 100% cotton t-shirt, available in multiple sizes and colors. Can be purchased individually or in a 3-pack.',
    status: 'published',
    images: [{ id: 'img1', url: `https://picsum.photos/seed/TSHIRT-CLASSIC/400/400` }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [
      { name: 'Single Shirt', isBaseUnit: true, contains: 1 },
      { name: '3-Pack', contains: 3 }
    ],
    requiresShipping: true,
    retailPrice: 35000,
    currency: 'UGX',
    isTaxable: true,
    hasVariants: true,
    options: [
        { name: 'Size', values: ['M', 'L'] },
        { name: 'Color', values: ['Black', 'White'] }
    ],
    variants: [
      // Variants for Single Shirt
      { id: 'var-M-B-S', optionValues: { Size: 'M', Color: 'Black' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-M-BLK-S', status: 'In Stock', stockByLocation: [{ locationName: 'Main Warehouse', stock: { onHand: 100, available: 100, reserved: 0, damaged: 0, sold: 0 }}]},
      { id: 'var-L-B-S', optionValues: { Size: 'L', Color: 'Black' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-L-BLK-S', status: 'In Stock', stockByLocation: [{ locationName: 'Main Warehouse', stock: { onHand: 100, available: 100, reserved: 0, damaged: 0, sold: 0 }}]},
      { id: 'var-M-W-S', optionValues: { Size: 'M', Color: 'White' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-M-WHT-S', status: 'In Stock', stockByLocation: [{ locationName: 'Main Warehouse', stock: { onHand: 120, available: 120, reserved: 0, damaged: 0, sold: 0 }}]},
      { id: 'var-L-W-S', optionValues: { Size: 'L', Color: 'White' }, unitOfMeasure: 'Single Shirt', price: 35000, sku: 'TSHIRT-L-WHT-S', status: 'In Stock', stockByLocation: [{ locationName: 'Main Warehouse', stock: { onHand: 120, available: 120, reserved: 0, damaged: 0, sold: 0 }}]},
      // Variants for 3-Pack
      { id: 'var-M-B-P', optionValues: { Size: 'M', Color: 'Black' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-M-BLK-P3', status: 'In Stock', stockByLocation: []},
      { id: 'var-L-B-P', optionValues: { Size: 'L', Color: 'Black' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-L-BLK-P3', status: 'In Stock', stockByLocation: []},
      { id: 'var-M-W-P', optionValues: { Size: 'M', Color: 'White' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-M-WHT-P3', status: 'In Stock', stockByLocation: []},
      { id: 'var-L-W-P', optionValues: { Size: 'L', Color: 'White' }, unitOfMeasure: '3-Pack', price: 90000, sku: 'TSHIRT-L-WHT-P3', status: 'In Stock', stockByLocation: []},
    ],
    productVisibility: ['Online Store', 'POS'],
    category: 'Apparel',
    wholesalePricing: [],
  },
  {
    productType: 'Physical',
    name: 'Scented Candle Set',
    sku: 'CNDL-SET',
    shortDescription: 'Aromatic scented candles available individually or in a box.',
    longDescription: '<p>Our high-quality scented candles are perfect for creating a relaxing ambiance. Made with natural soy wax and essential oils.</p>',
    status: 'published',
    images: [{ id: 'img-candle', url: 'https://picsum.photos/seed/candle/400/400' }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [
        { name: 'Piece', isBaseUnit: true, contains: 1 },
        { name: 'Box', contains: 12 }
    ],
    requiresShipping: true,
    retailPrice: 15000, // Price of the base unit (Piece)
    currency: 'UGX',
    isTaxable: true,
    hasVariants: false,
    options: [],
    variants: [
        { id: 'var-candle-pce', unitOfMeasure: 'Piece', optionValues: {}, status: 'In Stock', sku: 'CNDL-PCE', price: 15000, stockByLocation: [
            { locationName: 'Main Warehouse', stock: { onHand: 500, available: 500, reserved: 0, damaged: 0, sold: 0 } }
        ]},
        { id: 'var-candle-box', unitOfMeasure: 'Box', optionValues: {}, status: 'In Stock', sku: 'CNDL-BOX', price: 150000, stockByLocation: [] }
    ],
    productVisibility: ['Online Store', 'POS'],
    category: 'Home Goods',
    wholesalePricing: [],
  },
  {
    productType: 'Physical',
    name: 'Handmade Leather Shoes',
    sku: 'SHOE-002',
    shortDescription: 'Genuine leather shoes, handcrafted by skilled artisans. Durable, comfortable, and stylish.',
    status: 'published',
    images: [{ id: 'img3', url: `https://picsum.photos/seed/SHOE-002/400/400` }],
    inventoryTracking: 'Track with Serial Numbers',
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
        id: 'var-shoe-42',
        unitOfMeasure: 'Pair',
        optionValues: { Size: '42' },
        price: 75000,
        sku: 'SHOE-002-42',
        status: 'Low Stock',
        stockByLocation: [
            { locationName: 'Downtown Store', stock: { onHand: 5, available: 2, reserved: 1, damaged: 1, sold: 1 } }
        ],
        inventoryItems: [
          { id: 'inv-001', serialNumber: 'SN-SHOE-42-001', status: 'Available', locationName: 'Downtown Store'},
          { id: 'inv-002', serialNumber: 'SN-SHOE-42-002', status: 'Available', locationName: 'Downtown Store'},
          { id: 'inv-003', serialNumber: 'SN-SHOE-42-003', status: 'Sold', locationName: 'Shipped', soldDate: '2023-03-01' },
          { id: 'inv-004', serialNumber: 'SN-SHOE-42-004', status: 'Damaged', locationName: 'Downtown Store'},
          { id: 'inv-005', serialNumber: 'SN-SHOE-42-005', status: 'Reserved', locationName: 'Order #ORD-015'},
          { id: 'inv-006', serialNumber: 'SN-SHOE-42-006', status: 'Returned', locationName: 'Downtown Store'},
        ],
         stockAdjustments: [
            { id: 'adj-shoe-1', date: '2023-03-01T10:00:00Z', type: 'Sale', quantity: -1, reason: 'Order #ORD-013', channel: 'Online' },
        ]
      },
      { 
        id: 'var-shoe-43',
        unitOfMeasure: 'Pair',
        optionValues: { Size: '43' },
        price: 75000,
        sku: 'SHOE-002-43',
        status: 'In Stock',
        stockByLocation: [
          { locationName: 'Downtown Store', stock: { onHand: 10, available: 8, reserved: 2, damaged: 0, sold: 0 } }
      ] },
    ],
  },
  {
    productType: 'Digital',
    name: 'E-commerce Business Guide',
    sku: 'EBOOK-001',
    shortDescription: 'A comprehensive guide to starting your online business in East Africa.',
    status: 'published',
    images: [{ id: 'img2', url: `https://picsum.photos/seed/EBOOK-001/400/400` }],
    digitalFile: undefined,
    downloadLimit: 5,
    retailPrice: 10000,
    currency: 'KES',
    isTaxable: false,
    hasVariants: false,
    options: [],
    variants: [],
    unitsOfMeasure: [{ name: 'Download', isBaseUnit: true, contains: 1 }],
    inventoryTracking: 'Don\'t Track',
    requiresShipping: false,
    productVisibility: ['Online Store'],
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
