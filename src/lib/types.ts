

export type ProductImage = {
  id: string;
  url: string;
};

export type WholesalePrice = {
  customerGroup: string;
  price: number;
  minOrderQuantity?: number;
}

export type InventoryItem = {
  id: string; // e.g., 'inv-item-xyz'
  serialNumber?: string;
  status: 'Available' | 'Sold' | 'Reserved' | 'Damaged' | 'Returned';
  location?: string; // e.g. 'Warehouse A, Shelf B-3'
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
  
  // Inventory details move to the variant level
  stockQuantity: number;
  inventoryItems?: InventoryItem[]; // For serialized tracking
};


export type Product = {
  // I. Core Identity & Media
  productType: 'Physical' | 'Digital' | 'Service';
  name: string;
  shortDescription?: string;
  longDescription?: string; // Rich text
  status: 'draft' | 'published' | 'archived';
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

  // IV. Organization & Discovery
  category?: string;
  tags?: string[];
  vendor?: string;
  collections?: string[];
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
  productVisibility?: string[]; // e.g., 'Online Store', 'POS'
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
    customerGroup: 'default' | 'wholesale' | 'retailer';
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

    