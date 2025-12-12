
import type { ProductTemplate, EmailTemplate, SmsTemplate, WhatsAppTemplate } from '@/lib/types';
import { DataService } from './data-service';

export const mockProductTemplates: ProductTemplate[] = [
  {
    id: 'tpl-apparel',
    name: 'Standard Apparel',
    icon: 'Shirt',
    description: 'For items with size and color options, like t-shirts or dresses.',
    author: 'Paynze Official',
    published: true,
    usageCount: 128,
    product: {
      productType: 'Physical',
      category: 'Apparel',
      hasVariants: true,
      inventoryTracking: 'Track Quantity',
      options: [
        { name: 'Size', values: ['Small', 'Medium', 'Large', 'XL'] },
        { name: 'Color', values: [] }
      ],
      unitsOfMeasure: [{ name: 'Piece', isBaseUnit: true, contains: 1 }],
      tags: ['apparel', 'clothing'],
    },
  },
  {
    id: 'tpl-packaged-item',
    name: 'Packaged Item',
    icon: 'Package',
    description: 'For items sold individually and in multi-packs, like candles or soaps.',
    author: 'Paynze Official',
    published: true,
    usageCount: 74,
    product: {
      productType: 'Physical',
      hasVariants: false,
      inventoryTracking: 'Track Quantity',
      unitsOfMeasure: [
        { name: 'Piece', isBaseUnit: true, contains: 1 },
        { name: 'Pack', contains: 6 },
      ],
      tags: ['packaged', 'retail'],
    },
  },
  {
    id: 'tpl-fabric',
    name: 'Fabric by Length',
    icon: 'Layers',
    description: 'For products sold by length with different patterns or materials.',
    author: 'Paynze Official',
    published: true,
    usageCount: 41,
    product: {
      productType: 'Physical',
      category: 'Fabrics',
      hasVariants: true,
      inventoryTracking: 'Track Quantity',
      options: [
        { name: 'Pattern', values: ['Geometric', 'Floral'] },
      ],
      unitsOfMeasure: [
        { name: 'Yard', isBaseUnit: true, contains: 1 },
        { name: 'Full Roll', contains: 12 },
      ],
      tags: ['fabric', 'textiles'],
    },
  },
  {
    id: 'tpl-electronics',
    name: 'Electronic Device',
    icon: 'Laptop',
    description: 'A template for single-unit electronic items like laptops or phones.',
    author: 'Paynze Official',
    published: true,
    usageCount: 88,
    product: {
      productType: 'Physical',
      category: 'Electronics',
      inventoryTracking: 'Track Quantity',
      hasVariants: false,
      unitsOfMeasure: [{ name: 'Unit', isBaseUnit: true, contains: 1 }],
      tags: ['electronics', 'gadget'],
    },
  },
  {
    id: 'tpl-digital',
    name: 'Digital Download',
    icon: 'Book',
    description: 'For selling digital goods like e-books, guides, or software.',
    author: 'Paynze Official',
    published: true,
    usageCount: 92,
    product: {
      productType: 'Digital',
      inventoryTracking: "Don't Track",
      hasVariants: false,
      unitsOfMeasure: [{ name: 'Download', isBaseUnit: true, contains: 1 }],
      category: 'Digital Goods',
      tags: ['ebook', 'guide', 'digital'],
    },
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
];

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
    }
];


const productTemplateService = new DataService<ProductTemplate>('productTemplates', () => mockProductTemplates);
const emailTemplateService = new DataService<EmailTemplate>('emailTemplates', () => mockEmailTemplates);
const smsTemplateService = new DataService<SmsTemplate>('smsTemplates', () => mockSmsTemplates);
const whatsAppTemplateService = new DataService<WhatsAppTemplate>('whatsAppTemplates', () => mockWhatsAppTemplates);


export async function getProductTemplates(): Promise<ProductTemplate[]> {
  return await productTemplateService.getAll();
}

export async function addProductTemplate(template: Omit<ProductTemplate, 'id' | 'author' | 'published' | 'usageCount'>, author: string): Promise<ProductTemplate> {
    const newTemplate: ProductTemplate = { 
        ...template,
        product: template.product || {},
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

export async function addEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = { ...template, id: `email-${Date.now()}` };
    return await emailTemplateService.create(newTemplate);
}

export async function updateEmailTemplate(updatedTemplate: EmailTemplate): Promise<EmailTemplate> {
  return await emailTemplateService.update(updatedTemplate.id, updatedTemplate);
}

export async function getSmsTemplates(): Promise<SmsTemplate[]> {
  return await smsTemplateService.getAll();
}

export async function addSmsTemplate(template: Omit<SmsTemplate, 'id'>): Promise<SmsTemplate> {
    const newTemplate: SmsTemplate = { ...template, id: `sms-${Date.now()}` };
    return await smsTemplateService.create(newTemplate);
}

export async function updateSmsTemplate(updatedTemplate: SmsTemplate): Promise<SmsTemplate> {
    return await smsTemplateService.update(updatedTemplate.id, updatedTemplate);
}

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  return await whatsAppTemplateService.getAll();
}

export async function addWhatsAppTemplate(template: Omit<WhatsAppTemplate, 'id'>): Promise<WhatsAppTemplate> {
    const newTemplate: WhatsAppTemplate = { ...template, id: `wa-${Date.now()}` };
    return await whatsAppTemplateService.create(newTemplate);
}

export async function updateWhatsAppTemplate(updatedTemplate: WhatsAppTemplate): Promise<WhatsAppTemplate> {
    return await whatsAppTemplateService.update(updatedTemplate.id, updatedTemplate);
}
