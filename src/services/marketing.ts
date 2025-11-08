

import type { Campaign, Discount } from '@/lib/types';
import { DataService } from './data-service';

const mockCampaigns: Campaign[] = [
    {
        id: 'camp-1',
        name: 'Eid Sale 2024',
        status: 'Completed',
        channel: 'SMS',
        sent: 520,
        openRate: 'N/A',
        ctr: '12.5',
        audience: 'All Customers',
        startDate: '2024-06-10',
        endDate: '2024-06-17',
        description: 'Eid Al-Adha promotion for all customers.',
    },
    {
        id: 'camp-2',
        name: 'New Kitenge Launch',
        status: 'Active',
        channel: 'Email',
        sent: 1250,
        openRate: '34.2',
        ctr: '8.1',
        audience: 'Subscribers',
        startDate: '2024-07-20',
        description: 'Launch campaign for the new fabric collection.',
    },
    {
        id: 'camp-3',
        name: 'Flash Sale Friday',
        status: 'Scheduled',
        channel: 'Push',
        sent: 0,
        openRate: '0',
        ctr: '0',
        audience: 'App Users',
        startDate: '2024-08-02',
        description: 'A 24-hour flash sale on selected items.',
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
