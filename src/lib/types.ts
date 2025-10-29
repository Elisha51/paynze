

import type { OnboardingFormData as OnboardingData } from '@/context/onboarding-context';
export type OnboardingFormData = OnboardingData;

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
    sold: number;
  };
};

export type InventoryItem = {
  id: string; // e.g., 'inv-item-xyz'
  serialNumber?: string;
  status: 'Available' | 'Sold' | 'Reserved' | 'Damaged' | 'Returned';
  locationName?: string; // e.g. 'Warehouse A, Shelf B-3'
  variant?: ProductVariant; // Back-reference to the variant
  soldDate?: string;
};

export type StockAdjustment = {
    id: string;
    date: string;
    type: 'Initial Stock' | 'Sale' | 'Return' | 'Manual Adjustment' | 'Damage' | 'Reserve' | 'Un-reserve';
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
  currency: string;
  compareAtPrice?: number;
  wholesalePricing: WholesalePrice[];
  isTaxable: boolean;
  taxClass?: string;
  costPerItem?: number; // For profit tracking
  preorderSettings?: PreorderSettings;

  // IV. Organization & Discovery
  category?: string;
  tags?: string[];
  supplierIds?: string[];
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

export type OrderItem = {
    sku: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    category?: string;
}

export type Order = {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    date: string;
    status: 'Awaiting Payment' | 'Paid' | 'Ready for Pickup' | 'Shipped' | 'Delivered' | 'Picked Up' | 'Cancelled';
    fulfillmentMethod: 'Delivery' | 'Pickup';
    channel: 'Online' | 'Manual' | 'POS';
    items: OrderItem[];
    total: number;
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: 'Mobile Money' | 'Cash on Delivery';
    paymentStatus: 'Paid' | 'Unpaid';
    shippingCost?: number;
    taxes?: number;
    salesAgentId?: string;
    salesAgentName?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    fulfilledByStaffId?: string;
    fulfilledByStaffName?: string;
};

export type Communication = {
  id: string;
  type: 'Note' | 'Phone' | 'Meeting' | 'Message';
  content: string;
  date: string;
  staffId: string;
  staffName: string;
  threadId?: string;
};

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    customerGroup: 'default' | 'Wholesaler' | 'Retailer';
    lastOrderDate: string;
    totalSpend: number;
    createdAt?: string;
    orders?: Order[];
    communications?: Communication[];
};

export type RecentSale = {
  id: string;
  name: string;
  email: string;
  amount: string;
  avatarId: string;
  customerId: string;
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
  productsSupplied: string[]; // Array of product SKUs
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

// Staff Management
export type StaffRoleName = 'Admin' | 'Sales Agent' | 'Delivery Rider' | 'Finance Manager' | string;

export type CrudPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type Permissions = {
  dashboard: { view: boolean };
  products: CrudPermissions;
  orders: CrudPermissions;
  customers: CrudPermissions;
  procurement: CrudPermissions;
  finances: CrudPermissions;
  staff: CrudPermissions;
  tasks: CrudPermissions;
  settings: { view: boolean; edit: boolean };
};

export type AttributeType = 'kpi' | 'tags' | 'list' | 'string' | 'number' | 'boolean' | 'date';

export type AssignableAttribute = {
    key: string; // e.g. 'salesTarget', 'deliveryZones'
    label: string; // eg. 'Sales Target', 'Delivery Zones'
    type: AttributeType;
}

export type CommissionRule = {
    id: string;
    name: string;
    trigger: 'On Order Paid' | 'On Order Delivered';
    type: 'Fixed Amount' | 'Percentage of Sale';
    rate: number;
}

export type PerformanceTarget = {
    goal: number;
    current: number;
}

export type Shift = {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
}

export type Payout = {
    date: string;
    amount: number;
    paidItemIds?: string[];
};

export type Bonus = {
    id: string;
    date: string;
    reason: string;
    amount: number;
    awardedBy: string; // Staff ID of the admin who awarded the bonus
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: StaffRoleName;
  status: 'Active' | 'Inactive' | 'Pending Verification';
  rejectionReason?: string;
  verificationDocuments?: { name: string; url: string }[];
  lastLogin?: string;
  onlineStatus?: 'Online' | 'Offline';
  assignedOrders?: Order[];
  completionRate?: number; // e.g., 98.5
  totalSales?: number; // For sales agents
  totalCommission?: number; // For tracking earned commission
  payoutHistory?: Payout[];
  bonuses?: Bonus[];
  // Dynamic attributes based on role
  attributes?: {
    [key: string]: PerformanceTarget | string[] | string | number | boolean | Date;
  },
  schedule?: Shift[];
};

export type StaffActivity = {
    id: string;
    staffId: string;
    staffName: string;
    activity: string; // "Logged in", "Updated Order", "Created Product"
    details: {
        text: string; // "Order #123", "Product 'Kitenge Fabric'"
        link?: string; // "/dashboard/orders/123"
    };
    timestamp: string;
}


// Finance Types
export type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'Income' | 'Expense';
    category: 'Sales' | 'Inventory' | 'Utilities' | 'Salaries' | 'Marketing' | 'Other';
    status: 'Cleared' | 'Pending';
    paymentMethod: 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Card' | 'Other';
};

export type Role = {
    name: StaffRoleName;
    description: string;
    permissions: Permissions;
    assignableAttributes: AssignableAttribute[];
    commissionRules: CommissionRule[];
};

// Notification Types
export type Notification = {
    id: string;
    type: 'new-order' | 'low-stock' | 'new-customer' | 'task-assigned';
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    link?: string;
};

// To-do Types
export type Todo = {
  id: string;
  title: string;
  status: 'To Do' | 'Completed';
  createdAt: string;
};
