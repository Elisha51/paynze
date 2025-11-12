

import type { ProductTemplate } from '@/lib/types';
import { DataService } from './data-service';

export const mockProductTemplates: ProductTemplate[] = [
  {
    id: 'tpl-tshirt',
    name: 'Standard Apparel',
    icon: 'Shirt',
    description: 'A template for clothing items with size and color variants. Perfect for t-shirts, dresses, and more.',
    author: 'Paynze Official',
    published: true,
    usageCount: 128,
    product: {
      productType: 'Physical',
      category: 'Apparel',
      requiresShipping: true,
      isTaxable: true,
      hasVariants: true,
      inventoryTracking: 'Track Quantity',
      unitOfMeasure: 'unit',
      options: [
        { name: 'Size', values: ['Small', 'Medium', 'Large', 'XL'] },
        { name: 'Color', values: [] }
      ],
      tags: ['apparel', 'clothing'],
    },
  },
  {
    id: 'tpl-ebook',
    name: 'Digital Product',
    icon: 'Book',
    description: 'For selling digital goods like e-books, guides, or software with instant delivery.',
    author: 'Paynze Official',
    published: true,
    usageCount: 92,
    product: {
      productType: 'Digital',
      requiresShipping: false,
      inventoryTracking: 'Don\'t Track',
      isTaxable: false,
      hasVariants: false,
      category: 'Digital Goods',
      tags: ['ebook', 'guide', 'digital', 'download'],
    },
  },
  {
    id: 'tpl-service',
    name: 'Bookable Service',
    icon: 'Briefcase',
    description: 'A template for time-based services like consultations, coaching calls, or classes.',
    author: 'Paynze Official',
    published: true,
    usageCount: 45,
    product: {
      productType: 'Service',
      requiresShipping: false,
      inventoryTracking: 'Don\'t Track',
      serviceDuration: '1 hour',
      isTaxable: true,
      hasVariants: false,
      category: 'Professional Services',
      tags: ['consulting', 'coaching', 'service', 'booking'],
    },
  },
  {
    id: 'tpl-crafts',
    name: 'Artisan Crafts',
    icon: 'Palette',
    description: 'For unique, handcrafted items. Tracks quantity but has no complex variants.',
    author: 'Paynze Official',
    published: true,
    usageCount: 67,
    product: {
        productType: 'Physical',
        category: 'Arts & Crafts',
        requiresShipping: true,
        inventoryTracking: 'Track Quantity',
        hasVariants: false,
        tags: ['handmade', 'artisan', 'craft'],
    }
  },
  {
    id: 'tpl-coffee',
    name: 'Packaged Goods',
    icon: 'Coffee',
    description: 'Great for items sold by weight, like coffee, flour, or spices. Includes weight-based shipping fields.',
    author: 'Kato Coffee Roasters',
    published: true,
    usageCount: 23,
    product: {
      productType: 'Physical',
      requiresShipping: true,
      inventoryTracking: 'Track Quantity',
      isTaxable: false,
      hasVariants: true,
      unitOfMeasure: 'kg',
      weight: 1,
      options: [
        { name: 'Weight', values: ['250g', '500g', '1kg'] }
      ],
      category: 'Food & Beverage',
      tags: ['packaged', 'food', 'coffee', 'groceries'],
    },
  },
  {
    id: 'tpl-jewelry',
    name: 'Custom Jewelry',
    icon: 'Gem',
    description: 'Template for jewelry with options for material (e.g., Silver, Gold) and stone (e.g., None, Diamond).',
    author: 'Binti Creations',
    published: true,
    usageCount: 58,
    product: {
        productType: 'Physical',
        category: 'Jewelry',
        requiresShipping: true,
        inventoryTracking: 'Track Quantity',
        hasVariants: true,
        options: [
            { name: 'Material', values: ['Silver', 'Gold-Plated'] },
            { name: 'Stone', values: ['None', 'Zirconia'] }
        ],
        tags: ['jewelry', 'fashion', 'accessories'],
    }
  },
];

export const mockEmailTemplates: EmailTemplate[] = [
    {
        id: 'email-welcome',
        name: 'Welcome Email',
        description: 'Sent to new customers when they sign up.',
        subject: 'Welcome to {{storeName}}!',
        body: 'Hi {{customerName}}, thanks for joining us!',
    },
    {
        id: 'email-order-confirmation',
        name: 'Order Confirmation',
        description: 'Sent after a customer places an order.',
        subject: 'Your order #{{orderId}} is confirmed!',
        body: 'Thanks for your order, {{customerName}}. We will notify you once it ships.',
    }
]

export const mockSmsTemplates: SmsTemplate[] = [
    {
        id: 'sms-shipping-update',
        name: 'Shipping Update',
        description: 'Sent when an order is shipped.',
        message: 'Hi {{customerName}}, your order #{{orderId}} has shipped and is on its way!',
    },
     {
        id: 'sms-delivery-update',
        name: 'Out for Delivery',
        description: 'Sent when an order is out for delivery.',
        message: 'Your order #{{orderId}} is out for delivery today!',
    }
];

export const mockWhatsAppTemplates: WhatsAppTemplate[] = [
    {
        id: 'wa-abandoned-cart',
        name: 'Abandoned Cart Reminder',
        description: 'Sent to customers who have items in their cart but have not checked out.',
        message: 'Hi {{customerName}}! You left some items in your cart at {{storeName}}. Complete your order now before they run out!',
    },
    {
        id: 'wa-delivery-update',
        name: 'Delivery Update',
        description: 'Notifies customers about the status of their delivery.',
        message: 'Great news! Your order #{{orderId}} from {{storeName}} is now out for delivery and should arrive today.',
    }
];


const productTemplateService = new DataService<ProductTemplate>('productTemplates', () => mockProductTemplates);
const emailTemplateService = new DataService<EmailTemplate>('emailTemplates', () => mockEmailTemplates);
const smsTemplateService = new DataService<SmsTemplate>('smsTemplates', () => mockSmsTemplates);
const whatsAppTemplateService = new DataService<WhatsAppTemplate>('whatsAppTemplates', () => mockWhatsAppTemplates);


export async function getProductTemplates(): Promise<ProductTemplate[]> {
  // Always return the mock data to ensure it's available.
  return await productTemplateService.getAll();
}

export async function addProductTemplate(template: Omit<ProductTemplate, 'id' | 'usageCount' | 'author' | 'published'>, author: string): Promise<ProductTemplate> {
    const newTemplate: ProductTemplate = { 
        ...template, 
        author,
        published: false,
        id: `tpl-${Date.now()}`,
        usageCount: 0,
    };
    return await productTemplateService.create(newTemplate);
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return await emailTemplateService.getAll();
}

export async function getSmsTemplates(): Promise<SmsTemplate[]> {
  return await smsTemplateService.getAll();
}

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  return await whatsAppTemplateService.getAll();
}

// Defining EmailTemplate type because it might not be globally available
// in all contexts this file is used.
type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string; // Can contain variables like {{customerName}}
};

type SmsTemplate = {
  id: string;
  name:string;
  description: string;
  message: string; // Can contain variables like {{orderId}}
};

type WhatsAppTemplate = {
  id: string;
  name: string;
  description: string;
  message: string;
};
