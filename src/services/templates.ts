

import type { ProductTemplate, EmailTemplate, SmsTemplate } from '@/lib/types';

export const productTemplates: ProductTemplate[] = [
  {
    id: 'tpl-tshirt',
    name: 'T-Shirt',
    icon: 'Shirt',
    description: 'Standard t-shirt with size and color options.',
    product: {
      productType: 'Physical',
      category: 'Apparel',
      requiresShipping: true,
      isTaxable: true,
      hasVariants: true,
      inventoryTracking: 'Track Quantity',
      unitOfMeasure: 'unit',
      options: [
        { name: 'Size', values: ['Small', 'Medium', 'Large'] },
        { name: 'Color', values: ['Black', 'White'] }
      ],
      tags: ['t-shirt', 'apparel', 'clothing'],
    },
  },
  {
    id: 'tpl-ebook',
    name: 'E-Book',
    icon: 'Book',
    description: 'A digital book or guide for instant delivery.',
    product: {
      productType: 'Digital',
      requiresShipping: false,
      inventoryTracking: 'Don\'t Track',
      isTaxable: false,
      hasVariants: false,
      category: 'Digital Goods',
      tags: ['ebook', 'guide', 'digital'],
    },
  },
  {
    id: 'tpl-consult',
    name: 'Consultation',
    icon: 'Briefcase',
    description: 'A time-based service, like a coaching call.',
    product: {
      productType: 'Service',
      requiresShipping: false,
      inventoryTracking: 'Don\'t Track',
      serviceDuration: '1 hour',
      isTaxable: true,
      hasVariants: false,
      category: 'Professional Services',
      tags: ['consulting', 'coaching', 'service'],
    },
  },
];

export const emailTemplates: EmailTemplate[] = [
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

export const smsTemplates: SmsTemplate[] = [
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
]


export async function getProductTemplates(): Promise<ProductTemplate[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return productTemplates;
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return emailTemplates;
}

export async function getSmsTemplates(): Promise<SmsTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return smsTemplates;
}

    
