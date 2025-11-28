
'use client';

import type { StaffActivity } from '@/lib/types';
import { subHours } from 'date-fns';
import { DataService } from './data-service';

const initializeMockActivities: () => StaffActivity[] = () => [
    { 
        id: 'act-1', 
        staffId: 'staff-003', 
        staffName: 'Peter Jones', 
        activity: 'Order Marked as Delivered', 
        details: { text: 'Order #ORD-001', link: '/dashboard/orders/ORD-001'}, 
        timestamp: subHours(new Date(), 3).toISOString() 
    },
    { 
        id: 'act-2', 
        staffId: 'staff-002', 
        staffName: 'Jane Smith', 
        activity: 'Order Created Manually', 
        details: { text: 'Order #ORD-002', link: '/dashboard/orders/ORD-002'}, 
        timestamp: subHours(new Date(), 6).toISOString() 
    },
];

const activityService = new DataService<StaffActivity>('staffActivity', initializeMockActivities);

export async function getStaffActivity(staffId?: string): Promise<StaffActivity[]> {
    let allActivities = await activityService.getAll();
    if (staffId) {
        allActivities = allActivities.filter(a => a.staffId === staffId);
    }
    return allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addActivity(activity: Omit<StaffActivity, 'id' | 'timestamp'>): Promise<StaffActivity> {
  const newActivity: StaffActivity = {
    ...activity,
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  return await activityService.create(newActivity, { prepend: true });
}
