

import type { Affiliate } from '@/lib/types';
import { DataService } from './data-service';

const mockAffiliates: Affiliate[] = [
    { id: 'aff-001', name: 'Fatuma Asha', status: 'Active', contact: '0772123456', uniqueId: 'FATUMA123', linkClicks: 1204, conversions: 82, totalSales: 4500000, pendingCommission: 225000, paidCommission: 980000 },
    { id: 'aff-002', name: 'David Odhiambo', status: 'Active', contact: '0712345678', uniqueId: 'DAVIDO', linkClicks: 850, conversions: 45, totalSales: 2800000, pendingCommission: 140000, paidCommission: 550000 },
    { id: 'aff-003', name: 'Brenda Wanjiku', status: 'Pending', contact: '0723456789', uniqueId: 'BRENDA24', linkClicks: 50, conversions: 2, totalSales: 150000, pendingCommission: 7500, paidCommission: 0 },
];

const affiliateService = new DataService<Affiliate>('affiliates', () => mockAffiliates);

export async function getAffiliates(): Promise<Affiliate[]> {
    return affiliateService.getAll();
}

export async function addAffiliate(affiliate: Omit<Affiliate, 'id'>): Promise<Affiliate> {
    const newAffiliate: Affiliate = {
        ...affiliate,
        id: `aff-${Date.now()}`
    };
    return affiliateService.create(newAffiliate, { prepend: true });
}

export async function updateAffiliate(affiliateId: string, updates: Partial<Affiliate>): Promise<Affiliate> {
    return affiliateService.update(affiliateId, updates);
}
