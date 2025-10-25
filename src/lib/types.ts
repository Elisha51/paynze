

export type ProductImage = {
  id: string;
  url: string;
};

export type WholesalePrice = {
  customerGroup: string;
  price: number;
  minOrderQuantity?: number;
}

export type InventoryLocationStock = {
  locationName: string;
  stock: {
    onHand: number;
    available: number;
    reserved: number;
    damaged: number;
  };
};

export type InventoryItem = {
  id: string; // e.g., 'inv-item-xyz'
  serialNumber?: string;
  status: 'Available' | 'Sold' | 'Reserved' | 'Damaged' | 'Returned';
  locationName?: string; // e.g. 'Warehouse A, Shelf B-3'
  variant?: ProductVariant; // Back-reference to the variant
};

export type StockAdjustment = {
    id: string;
    date: string;
    type: 'Initial Stock' | 'Sale' | 'Return' | 'Manual Adjustment' | 'Damage';
    quantity: number; // Can be positive or negative
    reason?: string;
    channel?: 'Online' | 'In-Store' | 'Manual';
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string; // e.g., 'variant-sm-red'
  optionValues: { [key: string]: string }; // e.g., { Size: 'Small', Color: 'Red' }
  price?: number; // Overrides the main product price
  sku?: string; // e.g., 'TSHIRT-RED-SM'
  barcode?: string;
  weight?: number; // Overrides main product weight
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imageIds?: string[]; // IDs of the primary images for this variant
  
  // Inventory details
  status: 'In Stock' | 'Out of Stock' | 'Low Stock' | 'Pre-Order' | 'Backordered' | 'Discontinued';
  stockByLocation: InventoryLocationStock[];
  inventoryItems?: InventoryItem[]; // For serialized tracking
  stockAdjustments?: StockAdjustment[]; // For history tracking
};

export type PreorderSettings = {
  paymentType: 'full' | 'deposit';
  depositAmount?: number; // Can be percentage or fixed amount
};


export type Product = {
  // I. Core Identity & Media
  productType: 'Physical' | 'Digital' | 'Service';
  name: string;
  shortDescription?: string;
  longDescription?: string; // Rich text
  status: 'draft' | 'published' | 'archived' | 'Pre-Order';
  images: (ProductImage | File)[]; // Supports uploaded files or existing images
  videoUrl?: string;

  // II. Inventory & Logistics
  sku?: string;
  barcode?: string; // GTIN, EAN, UPC
  inventoryTracking: 'Track Quantity' | 'Track with Serial Numbers' | 'Don\'t Track';
  unitOfMeasure?: string;
  lowStockThreshold?: number; // overall threshold
  requiresShipping: boolean;
  weight?: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  digitalFile?: File; // For digital products
  downloadLimit?: number; // For digital products
  serviceDuration?: string; // For service products, e.g., "1 hour", "Per Session"

  // III. Pricing & Taxation
  retailPrice: number;
  currency: 'KES' | 'UGX' | 'TZS' | 'USD';
  compareAtPrice?: number;
  wholesalePricing: WholesalePrice[];
  isTaxable: boolean;
  taxClass?: string;
  costPerItem?: number; // For profit tracking
  preorderSettings?: PreorderSettings;

  // IV. Organization & Discovery
  category?: string;
  tags?: string[];
  vendor?: string;
  collections?: string[];
  productVisibility?: ('Online Store' | 'POS')[]; // e.g., ['Online Store', 'POS']
  seo?: {
    pageTitle?: string;
    metaDescription?: string;
    urlHandle?: string;
  };

  // V. Variants
  hasVariants: boolean;
  options: ProductOption[];
  variants: ProductVariant[];

  // VI. Configuration & Customization
  templateId?: string; // ID of a saved product template
  customFields?: { [key: string]: any };
};

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export type ProductTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  product: Partial<Product>;
};

export type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string; // Can contain variables like {{customerName}}
};

export type SmsTemplate = {
  id: string;
  name:string;
  description: string;
  message: string; // Can contain variables like {{orderId}}
};

export type Order = {
    id: string;
    customer: string;
    email: string;
    date: string;
    status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: string;
    paymentMethod: 'Mobile Money' | 'Cash on Delivery';
};

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    customerGroup: 'default' | 'Wholesaler' | 'Retailer';
    lastOrder: string;
    totalSpend: string;
    purchaseHistory: {
        productId: string;
        quantity: number;
        price: number;
        category: string;
        timestamp: string;
    }[];
};

export type RecentSale = {
  id: string;
  name: string;
  email: string;
  amount: string;
  avatarId: string;
};

export type SalesData = {
  name: string;
  total: number;
};

// Procurement Types
export type Supplier = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[]; // Array of product SKUs or names
};

export type PurchaseOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  cost: number; // Cost per item
};

export type PurchaseOrder = {
  id: string; // e.g., 'PO-001'
  supplierId: string;
  supplierName: string;
  status: 'Draft' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';
  items: PurchaseOrderItem[];
  orderDate: string;
  expectedDelivery: string;
  totalCost: number;
  currency: 'UGX' | 'KES' | 'TZS' | 'USD';
};


// Settings Types
export type Location = {
  id: string;
  name: string;
  address: string;
  isPickupLocation: boolean;
  isDefault: boolean;
};

export type ShippingZone = {
    id: string;
    name: string;
    countries: string[]; // e.g. ['UG', 'KE']
    provinces?: string[]; // e.g. ['Central', 'Western']
    cities?: string[]; // e.g. ['Kampala', 'Nairobi']
    deliveryMethods: {
        id: string;
        name: string; // 'Flat Rate', 'Free Shipping'
        price: number;
    }[];
};

