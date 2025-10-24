

export type ProductVariant = {
  optionName: string;
  value: string;
  price: number;
  stock: number;
};

export type Product = {
  name: string;
  description?: string;
  sku: string;
  category: string;
  retailPrice: number;
  wholesalePricing: {
    group: string;
    price: number;
  }[];
  stockQuantity: number;
  variants: ProductVariant[];
  visibility: 'published' | 'draft' | 'archived';
  images: string[];
  discount: string | null;
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
