
import type { Affiliate, Order } from '@/lib/types';
import { DataService } from './data-service';
import { getOrders } from './orders';

async function initializeMockAffiliates(): Promise<Affiliate[]> {
    const allOrders = await getOrders();
    const mockData: Omit<Affiliate, 'linkClicks' | 'conversions' | 'totalSales' | 'pendingCommission' | 'paidCommission' | 'payoutHistory'>[] = [
        { id: 'aff-001', name: 'Fatuma Asha', status: 'Active', contact: '0772123456', uniqueId: 'FATUMA123' },
        { id: 'aff-002', name: 'David Odhiambo', status: 'Active', contact: '0712345678', uniqueId: 'DAVIDO' },
        { id: 'aff-003', name: 'Brenda Wanjiku', status: 'Pending', contact: '0723456789', uniqueId: 'BRENDA24' },
        { id: 'aff-004', name: 'Suspended Sally', status: 'Suspended', contact: '0734567890', uniqueId: 'SALLY' },
        { id: 'aff-005', name: 'Rejected Ron', status: 'Rejected', contact: '0745678901', uniqueId: 'RONNIE' },
        { id: 'aff-006', name: 'Deactivated Dan', status: 'Deactivated', contact: '0756789012', uniqueId: 'DANDAN' },
    ];
    
    // Calculate stats dynamically
    return mockData.map(aff => {
        const referredOrders = allOrders.filter(o => o.salesAgentId === aff.id);
        const conversions = referredOrders.length;
        const totalSales = referredOrders.reduce((sum, o) => sum + o.total, 0);
        // Simple commission logic (10% for this mock)
        const pendingCommission = totalSales * 0.1;
        
        return {
            ...aff,
            linkClicks: conversions * 15, // Mocked clicks
            conversions,
            totalSales,
            pendingCommission,
            paidCommission: aff.id === 'aff-001' ? 980000 : 0, // Mock one with paid history
            payoutHistory: aff.id === 'aff-001' ? [{ date: '2024-07-01', amount: 500000, currency: 'UGX' }, { date: '2024-06-01', amount: 480000, currency: 'UGX' }] : [],
        };
    });
}

const affiliateService = new DataService<Affiliate>('affiliates', initializeMockAffiliates);

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

    
