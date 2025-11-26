
import type { Affiliate, Order, Payout, Staff } from '@/lib/types';
import { DataService } from './data-service';
import { getOrders } from './orders';
import { getStaff } from './staff';


async function initializeMockAffiliates(): Promise<Affiliate[]> {
    const allStaff = await getStaff();
    const affiliateStaff = allStaff.filter(s => s.role === 'Affiliate');
    
    // We will now derive the affiliates directly from staff with the 'Affiliate' role
    // This ensures data consistency. The fields are mapped.
    return affiliateStaff.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        contact: s.phone || '',
        uniqueId: s.email, // Using email as uniqueId for mock purposes
        linkClicks: 50 + Math.floor(Math.random() * 200), // Random mock data
        conversions: s.totalSales ? Math.round(s.totalSales / 75000) : 0, // Mocked
        totalSales: s.totalSales || 0,
        pendingCommission: s.totalCommission || 0,
        paidCommission: s.paidCommission || 0,
        payoutHistory: s.payoutHistory || [],
    }));
}


const affiliateService = new DataService<Affiliate>('affiliates_derived', initializeMockAffiliates);

export async function getAffiliates(): Promise<Affiliate[]> {
    return affiliateService.getAll();
}

export async function getAffiliateById(id: string): Promise<Affiliate | undefined> {
    const allAffiliates = await affiliateService.getAll();
    return allAffiliates.find(a => a.id === id);
}

export async function addAffiliate(affiliateData: Omit<Affiliate, 'id'>): Promise<Affiliate> {
    const { addStaff } = await import('./staff');
    const newStaffMember: Omit<Staff, 'id'> = {
        name: affiliateData.name,
        email: affiliateData.uniqueId, // Using uniqueId as email for consistency
        phone: affiliateData.contact,
        role: 'Affiliate',
        status: 'Pending',
        totalCommission: 0,
        paidCommission: 0,
        payoutHistory: [],
    };
    const createdStaff = await addStaff(newStaffMember);

    const newAffiliate: Affiliate = {
        ...affiliateData,
        id: createdStaff.id,
    };
    
    // We don't need to save to a separate affiliate service anymore, but we can return the mapped object
    return newAffiliate;
}

export async function updateAffiliate(affiliateId: string, updates: Partial<Affiliate>): Promise<Affiliate> {
    const { updateStaff } = await import('./staff');
    
    const staffUpdates: Partial<Staff> = {
        name: updates.name,
        status: updates.status,
        phone: updates.contact,
    };

    const updatedStaff = await updateStaff(affiliateId, staffUpdates);

    const updatedAffiliate: Affiliate = {
        id: updatedStaff.id,
        name: updatedStaff.name,
        status: updatedStaff.status,
        contact: updatedStaff.phone || '',
        uniqueId: updatedStaff.email,
        linkClicks: updates.linkClicks || 0,
        conversions: updates.conversions || 0,
        totalSales: updates.totalSales || 0,
        pendingCommission: updatedStaff.totalCommission || 0,
        paidCommission: updatedStaff.paidCommission || 0,
        payoutHistory: updatedStaff.payoutHistory || [],
    };
    
    return updatedAffiliate;
}
