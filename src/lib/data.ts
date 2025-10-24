

import type { Product, Order, Customer, RecentSale, SalesData } from './types';

export const products: Product[] = [
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
    trackStock: true,
    stockQuantity: 100,
    lowStockThreshold: 10,
    requiresShipping: true,
    weight: 0.5,
    dimensions: { length: 100, width: 150, height: 0.1 },
    retailPrice: 35000,
    currency: 'UGX',
    compareAtPrice: 40000,
    wholesalePricing: [
      { customerGroup: 'wholesale', price: 30000, minOrderQuantity: 20 },
      { customerGroup: 'retailer', price: 32000, minOrderQuantity: 5 },
    ],
    isTaxable: true,
    taxClass: 'VAT-18',
    costPerItem: 25000,
    category: 'Fabrics',
    tags: ['kitenge', 'african print', 'cotton'],
    vendor: 'Local Weavers Co.',
    collections: ['New Arrivals'],
    seo: {
      pageTitle: 'Colorful Kitenge Fabric | AfriStore',
      metaDescription: 'Buy high-quality, colorful Kitenge fabric for all your fashion needs.',
      urlHandle: 'colorful-kitenge-fabric',
    },
    hasVariants: true,
    optionNames: ['Color', 'Pattern'],
    variants: [
      { id: 'var1', optionValues: { Color: 'Red', Pattern: 'Floral' }, price: 35000, stock: 50, sku: 'KIT-001-RF' },
      { id: 'var2', optionValues: { Color: 'Blue', Pattern: 'Geometric' }, price: 35000, stock: 50, sku: 'KIT-001-BG' },
    ],
  },
  {
    productType: 'Digital',
    name: 'E-commerce Business Guide',
    shortDescription: 'A comprehensive guide to starting your online business in East Africa.',
    longDescription: '<p>This e-book covers everything from setting up your store to marketing and logistics.</p>',
    status: 'published',
    images: [{ id: 'img2', url: `https://picsum.photos/seed/EBOOK-001/400/400` }],
    digitalFile: undefined, // This would be a File object in the real app
    downloadLimit: 5,
    retailPrice: 10000,
    currency: 'KES',
    isTaxable: false,
    hasVariants: false,
    variants: [],
    trackStock: false,
    stockQuantity: 9999,
    requiresShipping: false,
    wholesalePricing: [],
  },
   {
    productType: 'Physical',
    name: 'Handmade Leather Shoes',
    shortDescription: 'Genuine leather shoes, handcrafted by skilled artisans. Durable, comfortable, and stylish for any occasion.',
    status: 'draft',
    images: [{ id: 'img3', url: `https://picsum.photos/seed/SHOE-002/400/400` }],
    sku: 'SHOE-002',
    trackStock: true,
    stockQuantity: 30,
    requiresShipping: true,
    weight: 1.2,
    retailPrice: 75000,
    currency: 'UGX',
    wholesalePricing: [{ customerGroup: 'wholesale', price: 65000 }],
    isTaxable: true,
    hasVariants: true,
    optionNames: ['Size'],
    variants: [
      { id: 'var3', optionValues: { Size: '42' }, price: 75000, stock: 15 },
      { id: 'var4', optionValues: { Size: '43' }, price: 75000, stock: 15 },
    ],
  },
  {
    productType: 'Service',
    name: '1-on-1 Business Consultation',
    shortDescription: 'Book a one-hour session with our e-commerce experts to accelerate your growth.',
    longDescription: '<p>Get personalized advice on marketing, sales, and operations for your online store.</p>',
    status: 'published',
    images: [{ id: 'img4', url: 'https://picsum.photos/seed/CONSULT-01/400/400'}],
    serviceDuration: '1 hour',
    retailPrice: 50000,
    currency: 'KES',
    isTaxable: true,
    hasVariants: false,
    variants: [],
    trackStock: false,
    stockQuantity: 999,
    requiresShipping: false,
    wholesalePricing: [],
  }
];

  
export const orders: Order[] = [
    { id: 'ORD-001', customer: 'Olivia Martin', email: 'olivia.martin@email.com', date: '2023-02-15', status: 'Delivered', total: 'KES 75,000', paymentMethod: 'Mobile Money' },
    { id: 'ORD-002', customer: 'Jackson Lee', email: 'jackson.lee@email.com', date: '2023-02-14', status: 'Delivered', total: 'KES 35,000', paymentMethod: 'Cash on Delivery' },
    { id: 'ORD-003', customer: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', date: '2023-02-13', status: 'Shipped', total: 'KES 25,000', paymentMethod: 'Mobile Money' },
    { id: 'ORD-004', customer: 'William Kim', email: 'will@email.com', date: '2023-02-12', status: 'Paid', total: 'KES 150,000', paymentMethod: 'Mobile Money' },
    { id: 'ORD-005', customer: 'Sofia Davis', email: 'sofia.davis@email.com', date: '2023-02-11', status: 'Pending', total: 'KES 18,000', paymentMethod: 'Cash on Delivery' },
];

export const customers: Customer[] = [
    { id: 'cust-01', name: 'Liam Johnson', email: 'liam@example.com', phone: '+254712345678', customerGroup: 'wholesale', lastOrder: '2023-01-23', totalSpend: 'KES 250,000', purchaseHistory: [{productId: 'prod-01', quantity: 5, price: 32000, category: 'Fabrics', timestamp: '2023-01-23T10:00:00Z'}] },
    { id: 'cust-02', name: 'Olivia Smith', email: 'olivia@example.com', phone: '+254723456789', customerGroup: 'retailer', lastOrder: '2023-02-10', totalSpend: 'KES 75,000', purchaseHistory: [{productId: 'prod-02', quantity: 1, price: 75000, category: 'Footwear', timestamp: '2023-02-10T14:30:00Z'}] },
    { id: 'cust-03', name: 'Noah Williams', email: 'noah@example.com', phone: '+254734567890', customerGroup: 'default', lastOrder: '2023-03-05', totalSpend: 'KES 15,000', purchaseHistory: [{productId: 'prod-04', quantity: 1, price: 15000, category: 'Groceries', timestamp: '2023-03-05T09:00:00Z'}]},
    { id: 'cust-04', name: 'Emma Brown', email: 'emma@example.com', phone: '+254745678901', customerGroup: 'retailer', lastOrder: '2023-03-15', totalSpend: 'KES 43,000', purchaseHistory: [{productId: 'prod-03', quantity: 1, price: 25000, category: 'Homeware', timestamp: '2023-03-15T11:00:00Z'}, {productId: 'prod-05', quantity: 1, price: 18000, category: 'Accessories', timestamp: '2023-03-15T11:00:00Z'}]},
    { id: 'cust-05', name: 'James Jones', email: 'james@example.com', phone: '+254756789012', customerGroup: 'default', lastOrder: '2023-03-20', totalSpend: 'KES 36,000', purchaseHistory: [{productId: 'prod-05', quantity: 2, price: 18000, category: 'Accessories', timestamp: '2023-03-20T16:00:00Z'}]},
];


export const recentSales: RecentSale[] = [
  { id: 'sale-01', name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+KES 1,999.00', avatarId: 'avatar-1' },
  { id: 'sale-02', name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+KES 39.00', avatarId: 'avatar-2' },
  { id: 'sale-03', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+KES 299.00', avatarId: 'avatar-3' },
  { id: 'sale-04', name: 'William Kim', email: 'will@email.com', amount: '+KES 99.00', avatarId: 'avatar-4' },
  { id: 'sale-05', name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+KES 39.00', avatarId: 'avatar-5' },
];

export const salesData: SalesData[] = [
    { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
];
