

import type { Campaign, Discount } from '@/lib/types';
import { DataService } from './data-service';

const mockCampaigns: Campaign[] = [
    {
        id: 'camp-1',
        name: 'Eid Sale 2024',
        status: 'Completed',
        content: { sms: { enabled: true, message: 'Eid sale is now on!'} },
        sent: 520,
        openRate: 'N/A',
        ctr: '12.5',
        audience: 'All Customers',
        startDate: '2024-06-10',
        endDate: '2024-06-17',
        affiliateAccess: 'all',
        allowedAffiliateIds: [],
    },
    {
        id: 'camp-2',
        name: 'New Kitenge Launch',
        status: 'Active',
        content: { email: { enabled: true, subject: 'New In!', body: 'Check out our new Kitenge fabrics.' } },
        sent: 1250,
        openRate: '34.2',
        ctr: '8.1',
        audience: 'Subscribers',
        startDate: '2024-07-20',
        affiliateAccess: 'specific',
        allowedAffiliateIds: ['aff-001', 'aff-002'],
        banner: {
            enabled: true,
            type: 'Product Highlight',
            size: 'standard',
            title: 'New Kitenge Collection!',
            description: 'Vibrant new patterns have just arrived. Shop the collection now.',
            ctaText: 'Shop Now',
            ctaLink: '/store?category=Fabrics',
            imageUrl: 'https://images.unsplash.com/photo-1678066681916-f724a7f801b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxraXRlbmdlJTIwZmFicmljfGVufDB8fHx8MTc2MTI5MTY5MHww&ixlib=rb-4.1.0&q=80&w=1080',
        }
    },
    {
        id: 'camp-3',
        name: 'Flash Sale Friday',
        status: 'Scheduled',
        content: { whatsapp: { enabled: true, message: 'Flash sale starting soon!' } },
        sent: 0,
        openRate: '0',
        ctr: '0',
        audience: 'App Users',
        startDate: '2024-08-02',
        affiliateAccess: 'all',
        allowedAffiliateIds: [],
    }
];

const mockDiscounts: Discount[] = [
    {
        code: 'EID20',
        type: 'Percentage',
        value: 20,
        status: 'Expired',
        redemptions: 45,
        minPurchase: 50000,
        customerGroup: 'Everyone',
        startDate: '2024-06-10',
        endDate: '2024-06-17',
        usageLimit: null,
        onePerCustomer: false,
    },
    {
        code: 'NEWBIE10',
        type: 'Percentage',
        value: 10,
        status: 'Active',
        redemptions: 112,
        minPurchase: 0,
        customerGroup: 'New Customers',
        startDate: '2024-01-01',
        usageLimit: null,
        onePerCustomer: true,
    },
    {
        code: 'WHOLESALE50K',
        type: 'Fixed Amount',
        value: 50000,
        status: 'Active',
        redemptions: 15,
        minPurchase: 1000000,
        customerGroup: 'Wholesalers',
        startDate: '2024-01-01',
        usageLimit: 50,
        onePerCustomer: false,
    },
    {
        code: 'FATUMA-SPECIAL',
        type: 'Percentage',
        value: 15,
        status: 'Active',
        redemptions: 5,
        minPurchase: 0,
        customerGroup: 'Specific Affiliates',
        usageLimit: 20,
        onePerCustomer: false,
        allowedAffiliateIds: ['aff-001'],
        description: 'Special 15% off coupon for Fatuma Asha\'s audience.'
    }
];

const campaignService = new DataService<Campaign>('campaigns', () => mockCampaigns);
const discountService = new DataService<Discount>('discounts', () => mockDiscounts, 'code');

export async function getCampaigns(): Promise<Campaign[]> {
  return await campaignService.getAll();
}

export async function getDiscounts(): Promise<Discount[]> {
  return await discountService.getAll();
}

export async function addDiscount(discount: Omit<Discount, 'redemptions'>): Promise<Discount> {
  const newDiscount = { ...discount, redemptions: 0 };
  return await discountService.create(newDiscount);
}

export async function updateDiscount(updatedDiscount: Discount): Promise<Discount> {
    return await discountService.update(updatedDiscount.code, updatedDiscount);
}

export async function deleteDiscount(code: string): Promise<void> {
    return await discountService.delete(code);
}
