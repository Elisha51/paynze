
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
    type: 'Initial Stock' | 'Sale' | 'Return' | 'Manual Adjustment' | 'Damage' | 'Reserve' | 'Un-reserve' | 'Transfer';
    quantity: number; // Can be positive or negative
    reason?: string;
    channel?: 'Online' | 'In-Store' | 'Manual';
    details?: string; // e.g. "From X to Y" for transfers, or "At Location X" for others
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
  author: string; // "Paynze Official" or Merchant Name
  published: boolean; // Is it available in the community hub?
  usageCount: number;
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

export type WhatsAppTemplate = {
  id: string;
  name: string;
  description: string;
  message: string;
};

export type OrderItem = {
    sku: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    category?: string;
    isTaxable?: boolean;
};

export type PaymentDetails = {
    method: 'Mobile Money' | 'Cash on Delivery';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    provider?: 'MTN' | 'Airtel' | 'M-Pesa';
};

export type DeliveryNote = {
  id: string;
  staffId: string;
  staffName: string;
  note: string;
  date: string;
};

export type Order = {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    date: string;
    status: 'Awaiting Payment' | 'Paid' | 'Ready for Pickup' | 'Shipped' | 'Attempted Delivery' | 'Delivered' | 'Picked Up' | 'Cancelled';
    fulfillmentMethod: 'Delivery' | 'Pickup';
    channel: 'Online' | 'Manual' | 'POS';
    items: OrderItem[];
    total: number;
    currency: string;
    shippingAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    payment: PaymentDetails;
    shippingCost?: number;
    taxes?: number;
    salesAgentId?: string;
    salesAgentName?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    fulfilledByStaffId?: string;
    fulfilledByStaffName?: string;
    deliveryNotes?: DeliveryNote[];
    proofOfDeliveryUrl?: string;
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
    currency: string;
    createdAt?: string;
    orders?: Order[];
    communications?: Communication[];
    wishlist?: string[]; // Array of product SKUs
    discounts?: Discount[];
    source: 'Manual' | 'Online';
    createdById?: string;
    createdByName?: string;
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
  currency: string;
};


// Settings Types
export type Location = {
  id: string;
  name: string;
  address: string;
  isPickupLocation: boolean;
  isDefault: boolean;
};

export type DeliveryMethod = {
  id: string;
  name: string;
  description: string;
  type: 'Fixed' | 'Percentage' | 'Pickup';
  price: number; // For 'Fixed', this is the amount. For 'Percentage', it's the percentage rate (e.g., 5 for 5%).
};

export type ShippingZone = {
  id: string;
  name: string;
  countries: string[];
  deliveryMethods: DeliveryMethod[];
};


export type AffiliateProgramSettings = {
    programStatus: 'Active' | 'Inactive';
    commissionType: 'Percentage' | 'Fixed Amount';
    commissionRate: number;
    payoutThreshold: number;
    cookieDuration: 7 | 30 | 60;
};


// Staff Management
export type StaffRoleName = 'Admin' | 'Sales Agent' | 'Delivery Rider' | 'Finance Manager' | 'Affiliate' | string;

export type CrudPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  viewAll?: boolean; // New optional permission
};

export type Permissions = {
  dashboard: { view: boolean };
  products: CrudPermissions;
  orders: CrudPermissions;
  customers: CrudPermissions;
  procurement: CrudPermissions;
  marketing: CrudPermissions;
  templates: CrudPermissions;
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
    currency: string;
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
  status: 'Active' | 'Pending Verification' | 'Suspended' | 'Deactivated';
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
  currency?: string;
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
};


// Finance Types
export type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
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
    type: 'new-order' | 'low-stock' | 'new-customer' | 'task-assigned' | 'payout-sent' | 'payout-request';
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    archived: boolean;
    link?: string;
};

// To-do Types
export type Todo = {
  id: string;
  title: string;
  status: 'To Do' | 'Completed';
  createdAt: string;
};

export type CampaignBanner = {
  enabled: boolean;
  type: 'Product Highlight' | 'Discount Offer' | 'Announcement';
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
}

// Marketing Types
export type Campaign = {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Draft' | 'Completed';
  channel: 'Email' | 'SMS' | 'Push';
  sent: number;
  openRate: string;
  ctr: string;
  audience: string;
  startDate: string;
  endDate?: string;
  description: string;
  applicableProductIds?: string[];
  banner?: CampaignBanner;
  affiliateAccess: 'none' | 'all' | 'specific';
  allowedAffiliateIds: string[];
};

export type BogoDetails = {
    buyQuantity: number;
    buyProductIds: string[];
    getQuantity: number;
    getProductIds: string[];
    getDiscountPercentage: number; // e.g., 100 for free, 50 for 50% off
}

export type Discount = {
  code: string;
  type: 'Percentage' | 'Fixed Amount' | 'Buy X Get Y';
  value: number; // For Percentage or Fixed Amount
  status: 'Active' | 'Expired' | 'Scheduled';
  redemptions: number;
  minPurchase: number;
  customerGroup: 'Everyone' | 'New Customers' | 'Wholesalers' | 'Retailers' | 'No Affiliates' | 'Specific Affiliates';
  usageLimit: number | null;
  onePerCustomer: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  applicableProductIds?: string[];
  bogoDetails?: BogoDetails;
  allowedAffiliateIds?: string[];
};

export type Affiliate = {
    id: string;
    name: string;
    status: 'Active' | 'Pending' | 'Suspended' | 'Rejected' | 'Deactivated';
    contact: string; // Mobile Money or Bank details
    uniqueId: string; // e.g. FATUMA123
    linkClicks: number;
    conversions: number;
    totalSales: number;
    pendingCommission: number;
    paidCommission: number;
    payoutHistory?: Payout[];
};
