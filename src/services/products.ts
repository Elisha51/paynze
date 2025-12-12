

import type { Product, ProductVariant } from '@/lib/types';
import { DataService } from './data-service';

const defaultStock = (onHand: number) => [{ locationName: 'Main Warehouse', stock: { onHand, available: onHand, reserved: 0, damaged: 0, sold: 0 } }];
const emptyStock = () => [{ locationName: 'Main Warehouse', stock: { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 } }];

const initializeMockProducts: () => Product[] = () => [
  // 1. Simple Product (e.g., Laptop)
  {
    productType: 'Physical',
    name: 'ProBook 14"',
    sku: 'LP-PRO-14',
    shortDescription: 'A high-performance laptop for professionals.',
    longDescription: '<p>The ProBook 14" delivers incredible performance, a stunning display, and all the ports you need.</p>',
    status: 'published',
    images: [{ id: 'img-laptop', url: `https://picsum.photos/seed/laptop/600/600` }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [{ name: 'Unit', isBaseUnit: true, contains: 1 }],
    requiresShipping: true,
    retailPrice: 8500000,
    currency: 'UGX',
    isTaxable: true,
    costPerItem: 6000000,
    hasVariants: false,
    options: [],
    variants: [{ 
      id: 'var-laptop-pro-14-unit', 
      optionValues: {}, 
      unitOfMeasure: 'Unit', 
      price: 8500000,
      sku: 'LP-PRO-14-UNIT',
      status: 'In Stock', 
      stockByLocation: defaultStock(25) 
    }],
    productVisibility: ['Online Store'],
    category: 'Electronics',
    wholesalePricing: [],
    supplierIds: [],
  },

  // 2. Product with Variants Only (e.g., T-Shirt)
  {
    productType: 'Physical',
    name: 'Classic Cotton T-Shirt',
    sku: 'TSHIRT-CLASSIC',
    shortDescription: 'A comfortable 100% cotton t-shirt available in multiple sizes and colors.',
    longDescription: '<p>Our classic t-shirt is a wardrobe staple. Made from soft, breathable cotton for all-day comfort.</p>',
    status: 'published',
    images: [{ id: 'img1', url: `https://picsum.photos/seed/TSHIRT-CLASSIC/600/600` }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [{ name: 'Piece', isBaseUnit: true, contains: 1 }],
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
      { id: 'var-M-B-p', optionValues: { Size: 'M', Color: 'Black' }, unitOfMeasure: 'Piece', price: 35000, sku: 'TSHIRT-M-BLK-P', status: 'In Stock', stockByLocation: defaultStock(50)},
      { id: 'var-L-B-p', optionValues: { Size: 'L', Color: 'Black' }, unitOfMeasure: 'Piece', price: 35000, sku: 'TSHIRT-L-BLK-P', status: 'In Stock', stockByLocation: defaultStock(50)},
      { id: 'var-M-W-p', optionValues: { Size: 'M', Color: 'White' }, unitOfMeasure: 'Piece', price: 35000, sku: 'TSHIRT-M-WHT-P', status: 'In Stock', stockByLocation: defaultStock(60)},
      { id: 'var-L-W-p', optionValues: { Size: 'L', Color: 'White' }, unitOfMeasure: 'Piece', price: 35000, sku: 'TSHIRT-L-WHT-P', status: 'In Stock', stockByLocation: defaultStock(60)},
    ],
    productVisibility: ['Online Store', 'POS'],
    category: 'Apparel',
    wholesalePricing: [],
    supplierIds: [],
  },

  // 3. Product with Packaging Units Only (e.g., Candles)
  {
    productType: 'Physical',
    name: 'Scented Soy Candle',
    sku: 'CNDL-SOY',
    shortDescription: 'Aromatic soy wax candle. Available as a single piece or in a gift box.',
    longDescription: '<p>Relax and unwind with our natural soy wax candles, infused with essential oils. Perfect for any room.</p>',
    status: 'published',
    images: [{ id: 'img-candle', url: 'https://picsum.photos/seed/candle/600/600' }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [
      { name: 'Piece', isBaseUnit: true, contains: 1 },
      { name: 'Gift Box', contains: 4 }
    ],
    requiresShipping: true,
    retailPrice: 15000,
    currency: 'UGX',
    isTaxable: true,
    costPerItem: 8000,
    hasVariants: false,
    options: [],
    variants: [
      { id: 'var-cndl-pce', unitOfMeasure: 'Piece', optionValues: {}, status: 'In Stock', sku: 'CNDL-PCE', price: 15000, stockByLocation: defaultStock(500) },
      { id: 'var-cndl-box', unitOfMeasure: 'Gift Box', optionValues: {}, status: 'In Stock', sku: 'CNDL-BOX', price: 55000, stockByLocation: emptyStock() }
    ],
    productVisibility: ['Online Store', 'POS'],
    category: 'Home Goods',
    wholesalePricing: [],
    supplierIds: [],
  },

  // 4. Complex Product (Variants + Packaging)
  {
    productType: 'Physical',
    name: 'Ankara Fabric',
    sku: 'ANK-FAB',
    shortDescription: 'Vibrant and durable Ankara fabric, sold per yard or by the roll.',
    status: 'published',
    images: [{ id: 'img-ankara', url: 'https://picsum.photos/seed/ankara/600/600' }],
    inventoryTracking: 'Track Quantity',
    unitsOfMeasure: [
      { name: 'Yard', isBaseUnit: true, contains: 1 },
      { name: 'Full Roll', contains: 12 }
    ],
    requiresShipping: true,
    retailPrice: 25000,
    currency: 'UGX',
    isTaxable: true,
    costPerItem: 15000,
    hasVariants: true,
    options: [
      { name: 'Pattern', values: ['Geometric', 'Floral'] }
    ],
    variants: [
      // Geometric Pattern Variants
      { id: 'var-geo-yard', optionValues: { Pattern: 'Geometric' }, unitOfMeasure: 'Yard', price: 25000, sku: 'ANK-GEO-YD', status: 'In Stock', stockByLocation: defaultStock(200) },
      { id: 'var-geo-roll', optionValues: { Pattern: 'Geometric' }, unitOfMeasure: 'Full Roll', price: 275000, sku: 'ANK-GEO-ROLL', status: 'In Stock', stockByLocation: emptyStock() },
      // Floral Pattern Variants
      { id: 'var-flo-yard', optionValues: { Pattern: 'Floral' }, unitOfMeasure: 'Yard', price: 25000, sku: 'ANK-FLO-YD', status: 'In Stock', stockByLocation: defaultStock(150) },
      { id: 'var-flo-roll', optionValues: { Pattern: 'Floral' }, unitOfMeasure: 'Full Roll', price: 275000, sku: 'ANK-FLO-ROLL', status: 'In Stock', stockByLocation: emptyStock() },
    ],
    productVisibility: ['Online Store'],
    category: 'Fabrics',
    wholesalePricing: [],
    supplierIds: ['SUP-001'],
  },
  
  // 5. Digital Product
  {
    productType: 'Digital',
    name: 'Small Business Accounting Guide',
    sku: 'EBOOK-ACC-01',
    shortDescription: 'A comprehensive guide to managing your finances.',
    longDescription: '<p>This e-book covers everything from bookkeeping basics to advanced financial reporting for small businesses.</p>',
    status: 'published',
    images: [{ id: 'img-ebook', url: 'https://picsum.photos/seed/ebook/600/600' }],
    inventoryTracking: "Don't Track",
    unitsOfMeasure: [{ name: 'Download', isBaseUnit: true, contains: 1 }],
    requiresShipping: false,
    retailPrice: 45000,
    currency: 'UGX',
    isTaxable: false,
    costPerItem: 5000,
    hasVariants: false,
    options: [],
    variants: [{ 
      id: 'var-ebook-download', 
      optionValues: {}, 
      unitOfMeasure: 'Download',
      price: 45000,
      sku: 'EBOOK-ACC-01-DL',
      status: 'In Stock',
      stockByLocation: [] 
    }],
    digitalFile: new File([], 'accounting-guide.pdf'),
    downloadLimit: 5,
    productVisibility: ['Online Store'],
    category: 'Digital Goods',
    wholesalePricing: [],
    supplierIds: [],
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
