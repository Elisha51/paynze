
import type { Product } from '@/lib/types';
import { DataService } from './data-service';

const initializeMockProducts: () => Product[] = () => [
  {
    productType: 'Physical',
    name: 'Colorful Kitenge Fabric',
    shortDescription: 'Vibrant and colorful Kitenge fabric, perfect for making dresses, shirts, and other traditional attire.',
    longDescription: '<p>High-quality cotton material, sourced ethically from local artisans. Available in multiple patterns and colors.</p>',
    status: 'published',
    images: [{ id: 'img1', url: `https://picsum.photos/seed/KIT-001/400/400` }],
    videoUrl: 'https://www.youtube.com/watch?v=example',
    sku: 'KIT-001',
    barcode: '1234567890123',
    inventoryTracking: 'Track Quantity',
    unitOfMeasure: 'm',
    lowStockThreshold: 10,
    requiresShipping: true,
    weight: 0.5,
    dimensions: { length: 100, width: 150, height: 0.1 },
    retailPrice: 35000,
    currency: 'UGX',
    compareAtPrice: 40000,
    wholesalePricing: [
      { customerGroup: 'Wholesaler', price: 30000, minOrderQuantity: 20 },
      { customerGroup: 'Retailer', price: 32000, minOrderQuantity: 5 },
    ],
    isTaxable: true,
    taxClass: 'VAT-18',
    costPerItem: 25000,
    category: 'Fabrics',
    tags: ['kitenge', 'african print', 'cotton'],
    supplierIds: ['SUP-001'],
    collections: ['New Arrivals'],
    productVisibility: ['Online Store', 'POS'],
    seo: {
      pageTitle: 'Colorful Kitenge Fabric | AfriStore',
      metaDescription: 'Buy high-quality, colorful Kitenge fabric for all your fashion needs.',
      urlHandle: 'colorful-kitenge-fabric',
    },
    hasVariants: true,
    options: [
        { name: 'Color', values: ['Red', 'Blue'] },
        { name: 'Pattern', values: ['Floral', 'Geometric'] }
    ],
    variants: [
      {
        id: 'var1',
        optionValues: { Color: 'Red', Pattern: 'Floral' },
        price: 35000,
        sku: 'KIT-001-RF',
        status: 'In Stock',
        stockByLocation: [
          { locationName: 'Main Warehouse', stock: { onHand: 30, available: 28, reserved: 2, damaged: 0, sold: 17 } },
          { locationName: 'Downtown Store', stock: { onHand: 20, available: 20, reserved: 0, damaged: 0, sold: 0 } }
        ],
        stockAdjustments: [
            { id: 'adj-001', date: '2023-01-15', type: 'Initial Stock', quantity: 50, reason: 'Initial import', channel: 'Manual' },
            { id: 'adj-002', date: '2023-02-20', type: 'Sale', quantity: -2, reason: 'Order #ORD-009', channel: 'Online' },
            { id: 'adj-005', date: '2023-03-01', type: 'Sale', quantity: -5, reason: 'Order #ORD-012', channel: 'Online' },
            { id: 'adj-006', date: '2023-03-10', type: 'Sale', quantity: -10, reason: 'Order #ORD-014', channel: 'In-Store' },
        ]
      },
      {
        id: 'var2',
        optionValues: { Color: 'Blue', Pattern: 'Geometric' },
        price: 35000,
        sku: 'KIT-001-BG',
        status: 'In Stock',
        stockByLocation: [
            { locationName: 'Main Warehouse', stock: { onHand: 20, available: 15, reserved: 5, damaged: 0, sold: 5 } },
            { locationName: 'Downtown Store', stock: { onHand: 10, available: 10, reserved: 0, damaged: 0, sold: 0 } }
        ],
        stockAdjustments: [
            { id: 'adj-003', date: '2023-01-15', type: 'Initial Stock', quantity: 30, reason: 'Initial import', channel: 'Manual' },
            { id: 'adj-004', date: '2023-02-22', type: 'Sale', quantity: -5, reason: 'Order #ORD-011', channel: 'In-Store' }
        ]
      },
    ],
  },
  {
    productType: 'Digital',
    name: 'E-commerce Business Guide',
    sku: 'EBOOK-001',
    shortDescription: 'A comprehensive guide to starting your online business in East Africa.',
    longDescription: '<p>This e-book covers everything from setting up your store to marketing and logistics.</p>',
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
    inventoryTracking: 'Don\'t Track',
    requiresShipping: false,
    productVisibility: ['Online Store'],
    wholesalePricing: [],
  },
   {
    productType: 'Physical',
    name: 'Handmade Leather Shoes',
    sku: 'SHOE-002',
    shortDescription: 'Genuine leather shoes, handcrafted by skilled artisans. Durable, comfortable, and stylish for any occasion.',
    status: 'published',
    images: [{ id: 'img3', url: `https://picsum.photos/seed/SHOE-002/400/400` }],
    inventoryTracking: 'Track with Serial Numbers',
    unitOfMeasure: 'pair',
    requiresShipping: true,
    weight: 1.2,
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
        id: 'var3',
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
      { id: 'var4', optionValues: { Size: '43' }, price: 75000, sku: 'SHOE-002-43', status: 'In Stock', stockByLocation: [
          { locationName: 'Downtown Store', stock: { onHand: 10, available: 8, reserved: 2, damaged: 0, sold: 0 } }
      ] },
    ],
  },
  {
    productType: 'Service',
    name: '1-on-1 Business Consultation',
    sku: 'CONSULT-01',
    shortDescription: 'Book a one-hour session with our e-commerce experts to accelerate your growth.',
    longDescription: '<p>Get personalized advice on marketing, sales, and operations for your online store.</p>',
    status: 'published',
    images: [{ id: 'img4', url: 'https://picsum.photos/seed/CONSULT-01/400/400'}],
    serviceDuration: '1 hour',
    retailPrice: 50000,
    currency: 'KES',
    isTaxable: true,
    hasVariants: false,
    options: [],
    variants: [],
    inventoryTracking: 'Don\'t Track',
    productVisibility: ['Online Store'],
    requiresShipping: false,
    wholesalePricing: [],
  },
  {
    productType: 'Physical',
    name: 'Rwenzori Coffee Beans',
    sku: 'COFF-01',
    shortDescription: 'Rich, aromatic single-origin coffee beans from the Rwenzori mountains.',
    status: 'published',
    images: [{ id: 'img5', url: 'https://picsum.photos/seed/COFF-01/400/400' }],
    inventoryTracking: 'Track Quantity',
    unitOfMeasure: 'kg',
    requiresShipping: true,
    weight: 1,
    retailPrice: 40000,
    currency: 'UGX',
    isTaxable: false,
    hasVariants: false,
    options: [],
    variants: [
        { id: 'var-coff-1', optionValues: {}, status: 'In Stock', stockByLocation: [
            { locationName: 'Main Warehouse', stock: { onHand: 100, available: 100, reserved: 0, damaged: 0, sold: 0 } }
        ]}
    ],
    productVisibility: ['Online Store', 'POS'],
    supplierIds: ['SUP-003'],
  },
  {
    productType: 'Physical',
    name: 'Maasai Beaded Necklace',
    sku: 'JEWEL-01',
    shortDescription: 'Intricate, handcrafted beaded necklace made by Maasai artisans.',
    status: 'draft',
    images: [{ id: 'img6', url: 'https://picsum.photos/seed/JEWEL-01/400/400' }],
    inventoryTracking: 'Track Quantity',
    requiresShipping: true,
    weight: 0.2,
    retailPrice: 25000,
    currency: 'KES',
    isTaxable: false,
    hasVariants: false,
    options: [],
    variants: [
       { id: 'var-jwl-1', optionValues: {}, status: 'In Stock', stockByLocation: [
            { locationName: 'Downtown Store', stock: { onHand: 15, available: 15, reserved: 0, damaged: 0, sold: 0 } }
       ]}
    ],
    productVisibility: ['Online Store'],
  }
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
  return await productService.create(newProduct);
}

export async function updateProduct(updatedProduct: Product): Promise<Product> {
  if (!updatedProduct.sku) throw new Error('SKU is required to update a product.');
  return await productService.update(updatedProduct.sku, updatedProduct);
}

export async function deleteProduct(sku: string): Promise<void> {
  await productService.delete(sku);
}
