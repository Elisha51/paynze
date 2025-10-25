
import type { Supplier, PurchaseOrder } from '@/lib/types';

const suppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Kitenge Kings',
    contactName: 'Grace Nakato',
    email: 'grace@kitengekings.com',
    phone: '+256 772 111 222',
    address: '123 Textile Road, Kampala',
    productsSupplied: ['KIT-001']
  },
  {
    id: 'SUP-002',
    name: 'Leather Artisans UG',
    contactName: 'David Okello',
    email: 'david@leatherartisans.co.ug',
    phone: '+256 782 333 444',
    address: '456 Craft Market, Jinja',
    productsSupplied: ['SHOE-002']
  }
];

const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplierId: 'SUP-001',
    supplierName: 'Kitenge Kings',
    status: 'Received',
    orderDate: '2024-05-01',
    expectedDelivery: '2024-05-15',
    totalCost: 1500000,
    currency: 'UGX',
    items: [
      { productId: 'KIT-001-RF', productName: 'Colorful Kitenge Fabric - Red, Floral', quantity: 50, cost: 30000 },
    ]
  },
  {
    id: 'PO-002',
    supplierId: 'SUP-002',
    supplierName: 'Leather Artisans UG',
    status: 'Sent',
    orderDate: '2024-06-10',
    expectedDelivery: '2024-07-01',
    totalCost: 1300000,
    currency: 'UGX',
    items: [
      { productId: 'SHOE-002-42', productName: 'Handmade Leather Shoes - Size 42', quantity: 20, cost: 65000 },
    ]
  }
];

export async function getSuppliers(): Promise<Supplier[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return suppliers;
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return purchaseOrders;
}
