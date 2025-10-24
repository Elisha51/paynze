
import type { ProductTemplate } from '@/lib/types';

export const templates: ProductTemplate[] = [
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
      optionNames: ['Size', 'Color'],
      variants: [
        { id: 'v1', optionValues: { Size: 'Small', Color: 'Black' }, stock: 10 },
        { id: 'v2', optionValues: { Size: 'Medium', Color: 'Black' }, stock: 10 },
        { id: 'v3', optionValues: { Size: 'Large', Color: 'Black' }, stock: 10 },
        { id: 'v4', optionValues: { Size: 'Small', Color: 'White' }, stock: 10 },
        { id: 'v5', optionValues: { Size: 'Medium', Color: 'White' }, stock: 10 },
        { id: 'v6', optionValues: { Size: 'Large', Color: 'White' }, stock: 10 },
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
      trackStock: false,
      stockQuantity: 99999,
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
      trackStock: false,
      stockQuantity: 99999,
      serviceDuration: '1 hour',
      isTaxable: true,
      hasVariants: false,
      category: 'Professional Services',
      tags: ['consulting', 'coaching', 'service'],
    },
  },
];

export async function getTemplates(): Promise<ProductTemplate[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return templates;
}
