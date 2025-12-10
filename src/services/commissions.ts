
'use client';

import type { Order, Staff, Role, CommissionRuleCondition, AffiliateProgramSettings, Affiliate } from '@/lib/types';

const checkCondition = (condition: CommissionRuleCondition, order: Order): boolean => {
    switch (condition.subject) {
        case 'Order Total':
            const total = order.total;
            const value = typeof condition.value === 'string' ? parseFloat(condition.value) : condition.value;
            switch (condition.operator) {
                case 'is greater than': return total > value;
                case 'is less than': return total < value;
                case 'is': return total === value;
                default: return false;
            }
        case 'Product Category':
             return order.items.some(item => {
                 if (!item.category) return false;
                 switch (condition.operator) {
                     case 'is': return item.category === condition.value;
                     case 'is not': return item.category !== condition.value;
                     default: return false;
                 }
             });
        default:
            return false;
    }
};

/**
 * Calculates commission for a single order and a specific staff member.
 * Does not save anything, only returns the calculated amount.
 * @param order The order that triggered the commission event.
 * @param staffMember The staff member or affiliate.
 * @param roles All available roles.
 * @param affiliateSettings The affiliate program settings.
 * @returns The calculated commission amount.
 */
export function calculateCommissionForOrder(
  order: Order,
  staffMember: Staff | Affiliate,
  roles: Role[],
  affiliateSettings: AffiliateProgramSettings | null
): number {
    let earnedCommission = 0;

    const staffRole = roles.find(r => r.name === staffMember.role);
    if (!staffRole) {
        console.warn(`Role ${staffMember.role} not found for staff member ${staffMember.name}.`);
        return 0;
    }

    // Handle Affiliate Commissions
    if (staffRole.name === 'Affiliate' && order.salesAgentId === staffMember.id) {
        if (affiliateSettings && affiliateSettings.programStatus === 'Active') {
            if (affiliateSettings.commissionType === 'Percentage') {
                earnedCommission += order.total * (affiliateSettings.commissionRate / 100);
            } else {
                earnedCommission += affiliateSettings.commissionRate;
            }
        }
    }
    // Handle Regular Staff Commissions
    else if (staffRole.commissionRules && staffRole.commissionRules.length > 0) {
        staffRole.commissionRules.forEach(rule => {
            const trigger = order.status === 'Delivered' || order.status === 'Picked Up' ? 'On Order Delivered' : 'On Order Paid';
            const staffId = trigger === 'On Order Paid' ? order.salesAgentId : order.fulfilledByStaffId;

            if (rule.trigger === trigger && staffId === staffMember.id) {
                const allConditionsMet = (rule.conditions || []).every(cond => checkCondition(cond, order));
                if (allConditionsMet) {
                    if (rule.type === 'Fixed Amount') {
                        earnedCommission += rule.rate;
                    } else if (rule.type === 'Percentage of Sale') {
                        earnedCommission += order.total * (rule.rate / 100);
                    }
                }
            }
        });
    }

    return earnedCommission;
}

/**
 * Recalculates and updates the total unpaid commission for a staff member.
 * This should be called after a change that might affect commissions (e.g., an order is paid/delivered).
 * @param staffId The ID of the staff member to update.
 */
export async function updateTotalCommissionForStaff(staffId: string) {
    const { getStaff, updateStaff } = await import('./staff');
    const { getOrders } = await import('./orders');
    const { getRoles } = await import('./roles');
    const DataService = (await import('./data-service')).DataService;
    const affiliateSettingsService = new DataService<AffiliateProgramSettings>('affiliateSettings', () => ({
        programStatus: 'Active',
        commissionType: 'Percentage',
        commissionRate: 10,
        payoutThreshold: 50000,
        cookieDuration: 30,
    }));
    
    const [staffMember, allOrders, allRoles, affiliateSettings] = await Promise.all([
        getStaff().then(s => s.find(staff => staff.id === staffId)),
        getOrders(),
        getRoles(),
        affiliateSettingsService.getById(0)
    ]);
    
    if (!staffMember) {
        console.warn(`Cannot update commission for non-existent staff ID ${staffId}`);
        return;
    }
    
    const paidOutOrderIds = new Set((staffMember.payoutHistory || []).flatMap(p => p.paidItemIds || []));

    const totalUnpaidCommission = allOrders
        .filter(order => !paidOutOrderIds.has(order.id)) // Exclude orders that have already been part of a payout
        .reduce((total, order) => {
            return total + calculateCommissionForOrder(order, staffMember, allRoles, affiliateSettings);
        }, 0);
    
    await updateStaff(staffId, { totalCommission: totalUnpaidCommission });
    console.log(`Updated total commission for ${staffMember.name} to: ${totalUnpaidCommission}`);
}

/**
 * Processes an order to update sales totals and trigger commission recalculation.
 * @param order The order to process.
 */
export async function processOrderForCommission(order: Order) {
    // Determine which staff to credit based on the trigger
    const salesAgentId = order.salesAgentId;
    const fulfillmentAgentId = order.fulfilledByStaffId;

    if(order.payment.status === 'completed' && salesAgentId) {
        await updateTotalCommissionForStaff(salesAgentId);
    }
    
    if((order.status === 'Delivered' || order.status === 'Picked Up') && fulfillmentAgentId) {
        await updateTotalCommissionForStaff(fulfillmentAgentId);
    }
}
