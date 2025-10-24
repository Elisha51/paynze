import type { Product, Order, Customer, RecentSale, SalesData } from './types';

export const products: Product[] = [
  { id: 'prod-01', name: 'Colorful Kitenge Fabric', imageId: 'product-kitenge', status: 'active', price: 35000, stock: 100, category: 'Fabrics' },
  { id: 'prod-02', name: 'Handmade Leather Shoes', imageId: 'product-shoes', status: 'active', price: 75000, stock: 30, category: 'Footwear' },
  { id: 'prod-03', name: 'Woven Sisal Basket', imageId: 'product-basket', status: 'active', price: 25000, stock: 50, category: 'Homeware' },
  { id: 'prod-04', name: 'Kenyan Arabica Coffee', imageId: 'product-coffee', status: 'draft', price: 15000, stock: 200, category: 'Groceries' },
  { id: 'prod-05', name: 'Maasai Beaded Necklace', imageId: 'product-jewelry', status: 'active', price: 18000, stock: 80, category: 'Accessories' },
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
