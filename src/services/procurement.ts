

import type { Supplier, PurchaseOrder } from '@/lib/types';
import { DataService } from './data-service';


const mockSuppliers: Supplier[] = [
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
  },
  {
    id: 'SUP-003',
    name: 'Rwenzori Coffee Co-op',
    contactName: 'Sarah Kizza',
    email: 'sarah.k@rwenzoricoffee.org',
    phone: '+256 752 555 666',
    address: '789 Mountain View Rd, Kasese',
    productsSupplied: ['COFF-01']
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
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
  },
  {
    id: 'PO-003',
    supplierId: 'SUP-003',
    supplierName: 'Rwenzori Coffee Co-op',
    status: 'Draft',
    orderDate: '2024-07-18',
    expectedDelivery: '2024-08-01',
    totalCost: 2000000,
    currency: 'UGX',
    items: [
      { productId: 'COFF-01', productName: 'Rwenzori Coffee Beans', quantity: 100, cost: 20000 },
    ]
  }
];

const supplierService = new DataService<Supplier>('suppliers', () => mockSuppliers);
const poService = new DataService<PurchaseOrder>('purchaseOrders', () => mockPurchaseOrders);


export async function getSuppliers(): Promise<Supplier[]> {
  return await supplierService.getAll();
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
    return await supplierService.getById(id);
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return await poService.getAll();
}


export async function getPurchaseOrdersBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
  const allPOs = await poService.getAll();
  return allPOs.filter(po => po.supplierId === supplierId);
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    return await poService.getById(id);
}
