

import type { Supplier, PurchaseOrder, StockAdjustment } from '@/lib/types';
import { DataService } from './data-service';
import { getProducts, updateProduct } from './products';


const mockSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Kitenge Kings',
    contactName: 'Grace Nakato',
    email: 'grace@kitengekings.com',
    phone: '+256772111222',
    whatsapp: '256772111222',
    address: '123 Textile Road, Kampala',
    productsSupplied: ['KIT-001']
  },
  {
    id: 'SUP-002',
    name: 'Leather Artisans UG',
    contactName: 'David Okello',
    email: 'david@leatherartisans.co.ug',
    phone: '+256782333444',
    whatsapp: '256782333444',
    address: '456 Craft Market, Jinja',
    productsSupplied: ['SHOE-002']
  },
  {
    id: 'SUP-003',
    name: 'Rwenzori Coffee Co-op',
    contactName: 'Sarah Kizza',
    email: 'sarah.k@rwenzoricoffee.org',
    phone: '+256752555666',
    whatsapp: '256752999888',
    address: '789 Mountain View Rd, Kasese',
    productsSupplied: ['COFF-01']
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplierId: 'SUP-001',
    supplierName: 'Kitenge Kings',
    status: 'Completed',
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
    status: 'Paid',
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
  },
   {
    id: 'PO-004',
    supplierId: 'SUP-001',
    supplierName: 'Kitenge Kings',
    status: 'Awaiting Approval',
    orderDate: '2024-07-20',
    expectedDelivery: '2024-08-05',
    totalCost: 640000,
    currency: 'UGX',
    items: [
      { productId: 'KIT-001-BG', productName: 'Colorful Kitenge Fabric - Blue, Geometric', quantity: 20, cost: 32000 },
    ],
    supplierProposedChanges: {
        items: [
            { productId: 'KIT-001-BG', productName: 'Colorful Kitenge Fabric - Blue, Geometric', quantity: 15, cost: 33000 },
        ]
    },
    supplierETA: '2024-08-10',
    supplierNotes: 'We can only supply 15m at the moment due to high demand. Price has increased slightly due to raw material costs.'
  },
];

const supplierService = new DataService<Supplier>('suppliers', () => mockSuppliers);
const poService = new DataService<PurchaseOrder>('purchaseOrders', () => mockPurchaseOrders);


export async function getSuppliers(): Promise<Supplier[]> {
  return await supplierService.getAll();
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
    return await supplierService.getById(id);
}

export async function deleteSupplier(id: string): Promise<void> {
    await supplierService.delete(id);
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

export async function addPurchaseOrder(po: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> {
    const newPO = { ...po, id: `PO-${Date.now()}` };
    return await poService.create(newPO);
}

export async function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return await poService.update(id, updates);
}

export async function receivePurchaseOrder(poId: string, locationName: string): Promise<PurchaseOrder> {
    const po = await poService.getById(poId);
    if (!po) throw new Error("Purchase order not found");
    if (po.status === 'Completed') throw new Error("This purchase order has already been received.");

    const products = await getProducts();

    for (const item of po.items) {
        let productToUpdate = products.find(p => p.variants.some(v => v.sku === item.productId));
        if (!productToUpdate) {
            console.warn(`Product for SKU ${item.productId} not found. Skipping stock update.`);
            continue;
        }

        const variantIndex = productToUpdate.variants.findIndex(v => v.sku === item.productId);
        if (variantIndex === -1) {
             console.warn(`Variant with SKU ${item.productId} not found in product ${productToUpdate.name}. Skipping stock update.`);
            continue;
        }
        
        let productCopy = { ...productToUpdate };
        let variantCopy = { ...productCopy.variants[variantIndex] };
        let stockByLocationCopy = [...variantCopy.stockByLocation];
        let locIndex = stockByLocationCopy.findIndex(loc => loc.locationName === locationName);
        
        if (locIndex === -1) {
            stockByLocationCopy.push({ locationName, stock: { onHand: 0, available: 0, reserved: 0, damaged: 0, sold: 0 } });
            locIndex = stockByLocationCopy.length - 1;
        }
        
        let stockCopy = { ...stockByLocationCopy[locIndex].stock };
        stockCopy.onHand += item.quantity;
        stockCopy.available += item.quantity;

        stockByLocationCopy[locIndex] = { ...stockByLocationCopy[locIndex], stock: stockCopy };

        const adjustment: StockAdjustment = {
            id: `adj-${Date.now()}-${item.productId}`,
            date: new Date().toISOString(),
            type: 'Initial Stock',
            quantity: item.quantity,
            reason: `PO #${po.id}`,
            channel: 'Manual',
            details: `Received at ${locationName}`
        };

        variantCopy.stockAdjustments = [...(variantCopy.stockAdjustments || []), adjustment];
        variantCopy.stockByLocation = stockByLocationCopy;
        productCopy.variants[variantIndex] = variantCopy;
        
        await updateProduct(productCopy);
    }
    
    const updatedPO = await poService.update(poId, { status: 'Completed' });
    return updatedPO;
}
