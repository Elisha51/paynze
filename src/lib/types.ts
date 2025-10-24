export type Product = {
  id: string;
  name: string;
  imageId: string;
  status: 'active' | 'draft';
  price: number;
  stock: number;
  category: string;
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
