
import type { Affiliate } from '@/lib/types';
import { DataService } from './data-service';

const mockAffiliates: Affiliate[] = [
    { id: 'aff-001', name: 'Fatuma Asha', status: 'Active', contact: '0772123456', uniqueId: 'FATUMA123', linkClicks: 1204, conversions: 82, totalSales: 4500000, pendingCommission: 17000, paidCommission: 980000, payoutHistory: [{ date: '2024-07-01', amount: 500000, currency: 'UGX' }, { date: '2024-06-01', amount: 480000, currency: 'UGX' }] },
    { id: 'aff-002', name: 'David Odhiambo', status: 'Active', contact: '0712345678', uniqueId: 'DAVIDO', linkClicks: 850, conversions: 45, totalSales: 2800000, pendingCommission: 140000, paidCommission: 550000, payoutHistory: [] },
    { id: 'aff-003', name: 'Brenda Wanjiku', status: 'Pending', contact: '0723456789', uniqueId: 'BRENDA24', linkClicks: 50, conversions: 2, totalSales: 150000, pendingCommission: 7500, paidCommission: 0, payoutHistory: [] },
    { id: 'aff-004', name: 'Suspended Sally', status: 'Suspended', contact: '0734567890', uniqueId: 'SALLY', linkClicks: 2300, conversions: 150, totalSales: 8000000, pendingCommission: 400000, paidCommission: 1200000, payoutHistory: [] },
    { id: 'aff-005', name: 'Rejected Ron', status: 'Rejected', contact: '0745678901', uniqueId: 'RONNIE', linkClicks: 0, conversions: 0, totalSales: 0, pendingCommission: 0, paidCommission: 0, payoutHistory: [] },
    { id: 'aff-006', name: 'Deactivated Dan', status: 'Deactivated', contact: '0756789012', uniqueId: 'DANDAN', linkClicks: 500, conversions: 10, totalSales: 300000, pendingCommission: 0, paidCommission: 15000, payoutHistory: [] },
];

const affiliateService = new DataService<Affiliate>('affiliates', () => mockAffiliates);

export async function getAffiliates(): Promise<Affiliate[]> {
    return affiliateService.getAll();
}

export async function getAffiliateById(id: string): Promise<Affiliate | undefined> {
    return affiliateService.getById(id);
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

    