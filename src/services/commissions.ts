
import type { Order, Staff, Role, CommissionRuleCondition, AffiliateProgramSettings } from '@/lib/types';
import { DataService } from './data-service';
import { getStaff, updateStaff } from './staff';
import { getRoles } from './roles';

const affiliateSettingsService = new DataService<AffiliateProgramSettings>('affiliateSettings', () => ({
    programStatus: 'Active',
    commissionType: 'Percentage',
    commissionRate: 10,
    payoutThreshold: 50000,
    cookieDuration: 30,
}));


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
 * Calculates and updates commission for a staff member based on a specific order and trigger event.
 * This simulates a backend commission engine.
 * @param order The order that triggered the commission event.
 * @param trigger The type of event that occurred ('On Order Paid' or 'On Order Delivered').
 */
export async function calculateCommissionForOrder(order: Order, trigger: 'On Order Paid' | 'On Order Delivered') {
    // Determine which staff member to credit based on the trigger.
    const staffId = trigger === 'On Order Paid' ? order.salesAgentId : order.fulfilledByStaffId;
    
    if (!staffId) {
      // It's normal for many orders not to have an agent, so we just log this for debugging.
      // console.log(`No staff ID found for trigger "${trigger}" on order #${order.id}. Skipping commission.`);
      return;
    }

    const allStaff = await getStaff();
    const staffMember = allStaff.find(s => s.id === staffId);
    if (!staffMember) {
        console.warn(`Staff member with ID ${staffId} not found for commission calculation.`);
        return;
    }

    const allRoles = await getRoles();
    const staffRole = allRoles.find(r => r.name === staffMember.role);
    if (!staffRole) {
        console.warn(`Role ${staffMember.role} not found for staff member ${staffMember.name}.`);
        return;
    }

    let totalEarnedCommission = 0;
    
    let totalSales = staffMember.totalSales || 0;
    totalSales += order.total;

    // Handle Affiliate Commissions (triggered only on payment)
    if (staffRole.name === 'Affiliate' && trigger === 'On Order Paid') {
        const affiliateSettings = await affiliateSettingsService.getById(0); // Assuming single settings object
        if (affiliateSettings && affiliateSettings.programStatus === 'Active') {
             if (affiliateSettings.commissionType === 'Percentage') {
                totalEarnedCommission += order.total * (affiliateSettings.commissionRate / 100);
            } else {
                totalEarnedCommission += affiliateSettings.commissionRate;
            }
        }
    } 
    // Handle Regular Staff Commissions based on rules
    else if (staffRole.commissionRules && staffRole.commissionRules.length > 0) {
        staffRole.commissionRules.forEach(rule => {
            if (rule.trigger === trigger) {
                const allConditionsMet = (rule.conditions || []).every(cond => checkCondition(cond, order));
                if (allConditionsMet) {
                    if (rule.type === 'Fixed Amount') {
                        totalEarnedCommission += rule.rate;
                    } else if (rule.type === 'Percentage of Sale') {
                        totalEarnedCommission += order.total * (rule.rate / 100);
                    }
                }
            }
        });
    }

    let shouldUpdateStaff = false;
    const updates: Partial<Staff> = {};
    if (totalEarnedCommission > 0) {
        updates.totalCommission = (staffMember.totalCommission || 0) + totalEarnedCommission;
        shouldUpdateStaff = true;
    }

    // Always update total sales for the sales agent
    if(trigger === 'On Order Paid') {
        updates.totalSales = totalSales;
        shouldUpdateStaff = true;
    }
    
    // Example of updating a KPI attribute upon successful delivery
    if (staffRole.name === 'Agent' && trigger === 'On Order Delivered') {
        const deliveryTarget = staffMember.attributes?.deliveryTarget as { current: number, goal: number } | undefined;
        if (deliveryTarget) {
            updates.attributes = {
                ...staffMember.attributes,
                deliveryTarget: { ...deliveryTarget, current: (deliveryTarget.current || 0) + 1 }
            };
            shouldUpdateStaff = true;
        }
    }

    if (shouldUpdateStaff) {
        await updateStaff(staffMember.id, updates);
        if (totalEarnedCommission > 0) {
          console.log(`Commission of ${totalEarnedCommission} calculated for ${staffMember.name} from order #${order.id}`);
        }
    }
}
