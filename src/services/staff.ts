

import type { Staff, Order, StaffActivity, Bonus, Affiliate } from '@/lib/types';
import { format, subDays, subHours } from 'date-fns';
import { getOrders } from './orders';
import { DataService } from './data-service';


async function initializeMockStaff(): Promise<(Staff | Affiliate)[]> {
    const allOrders = await getOrders();
    return [
      { 
        id: 'staff-001', 
        name: 'John Doe', 
        email: 'john@example.com', 
        phone: '+256772123456',
        avatarUrl: 'https://picsum.photos/seed/john-doe/100/100',
        role: 'Admin', 
        status: 'Active', 
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Online',
        assignedOrders: [],
        completionRate: 100,
        totalSales: 550000,
        totalCommission: 0,
        currency: 'UGX',
      },
      { 
        id: 'staff-002', 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        phone: '+254712345678',
        avatarUrl: 'https://picsum.photos/seed/jane-smith/100/100',
        role: 'Sales Agent', 
        status: 'Active', 
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Online',
        assignedOrders: [],
        totalSales: 125000,
        totalCommission: 6250,
        currency: 'KES',
        attributes: {
          salesTarget: { goal: 500000, current: 125000 },
          assignedRegions: ['Nairobi', 'Mombasa'],
          isKeyAccountManager: true,
        },
        bonuses: [
            { id: 'bonus-1', date: subDays(new Date(), 3).toISOString(), reason: 'Exceeded Q2 Target', amount: 5000, awardedBy: 'John Doe'}
        ],
        payoutHistory: [
            { date: '2024-06-01', amount: 25000, currency: 'KES' }
        ],
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' },
        ]
      },
      { 
        id: 'staff-003', 
        name: 'Peter Jones', 
        email: 'peter@example.com', 
        phone: '+256782987654',
        avatarUrl: 'https://picsum.photos/seed/peter-jones/100/100',
        role: 'Delivery Rider', 
        status: 'Active', 
        lastLogin: format(subDays(new Date(), 2), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Offline',
        assignedOrders: allOrders.filter(o => o.assignedStaffId === 'staff-003'),
        completionRate: 95.2,
        totalCommission: 4500,
        currency: 'UGX',
        attributes: {
          deliveryTarget: { current: 18, goal: 20 },
          deliveryZones: ['Kampala Central', 'Makindye'],
          vehicleId: 'UBA 123X',
          lastInspectionDate: subDays(new Date(), 15),
        }
      },
      { 
        id: 'staff-004', 
        name: 'Mary Anne', 
        email: 'mary@example.com', 
        phone: '+255765432109',
        avatarUrl: 'https://picsum.photos/seed/mary-anne/100/100',
        role: 'Finance Manager', 
        status: 'Active', 
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Online',
        assignedOrders: [],
        totalCommission: 0,
        currency: 'TZS',
      },
       { 
        id: 'staff-005', 
        name: 'Chris Green', 
        email: 'chris@example.com', 
        phone: '+254709876543',
        avatarUrl: 'https://picsum.photos/seed/chris-green/100/100',
        role: 'Sales Agent', 
        status: 'Inactive', 
        lastLogin: '2024-06-01 10:00',
        onlineStatus: 'Offline',
        assignedOrders: [],
        totalCommission: 0,
        currency: 'KES',
      },
       { 
        id: 'staff-006', 
        name: 'Aisha Omar', 
        email: 'aisha@example.com', 
        phone: '+254701234567',
        avatarUrl: 'https://picsum.photos/seed/aisha-omar/100/100',
        role: 'Delivery Rider', 
        status: 'Pending Verification', 
        rejectionReason: '',
        verificationDocuments: [
            { name: 'National_ID.pdf', url: '#' },
            { name: 'Drivers_License.pdf', url: '#' },
        ],
        lastLogin: undefined,
        onlineStatus: 'Offline',
        assignedOrders: [],
        totalCommission: 0,
        currency: 'KES',
      },
      { id: 'aff-001', name: 'Fatuma Asha', role: 'Affiliate', status: 'Active', email: 'fatuma@email.com', totalCommission: 225000, currency: 'UGX' } as Staff,
      { id: 'aff-002', name: 'David Odhiambo', role: 'Affiliate', status: 'Active', email: 'david@email.com', totalCommission: 140000, currency: 'UGX' } as Staff,
      { id: 'aff-003', name: 'Brenda Wanjiku', role: 'Affiliate', status: 'Pending', email: 'brenda@email.com', totalCommission: 7500, currency: 'UGX' } as Staff,
    ];
}

const mockActivities: StaffActivity[] = [
    { id: 'act-1', staffId: 'staff-003', staffName: 'Peter Jones', activity: 'Order Marked as Delivered', details: { text: 'Order #ORD-001', link: '/dashboard/orders/ORD-001'}, timestamp: subHours(new Date(), 3).toISOString() },
    { id: 'act-2', staffId: 'staff-002', staffName: 'Jane Smith', activity: 'Order Created Manually', details: { text: 'Order #ORD-002', link: '/dashboard/orders/ORD-002'}, timestamp: subHours(new Date(), 6).toISOString() },
    { id: 'act-3', staffId: 'staff-001', staffName: 'John Doe', activity: 'Staff Member Approved', details: { text: 'Aisha Omar', link: '/dashboard/staff/staff-006' }, timestamp: subHours(new Date(), 26).toISOString() },
    { id: 'act-4', staffId: 'staff-004', staffName: 'Mary Anne', activity: 'Payout Processed', details: { text: 'Payout for Peter Jones' }, timestamp: subDays(new Date(), 2).toISOString() },
    { id: 'act-5', staffId: 'staff-003', staffName: 'Peter Jones', activity: 'Order Assigned', details: { text: 'Order #ORD-007', link: '/dashboard/orders/ORD-007'}, timestamp: subDays(new Date(), 3).toISOString() },
    { id: 'act-6', staffId: 'staff-002', staffName: 'Jane Smith', activity: 'Product Edited', details: { text: 'Handmade Leather Shoes', link: '/dashboard/products/SHOE-002' }, timestamp: subDays(new Date(), 4).toISOString() },
];

const staffService = new DataService<(Staff | Affiliate)>('staff', initializeMockStaff);
const activityService = new DataService<StaffActivity>('staffActivity', () => mockActivities);

export async function getStaff(): Promise<Staff[]> {
  const staffOrAffiliates = await staffService.getAll();
  return staffOrAffiliates as Staff[];
}

export async function getStaffOrders(staffId: string): Promise<Order[]> {
    const allOrders = await getOrders();
    return allOrders.filter(o => o.assignedStaffId === staffId);
}

export async function getStaffActivity(staffId?: string): Promise<StaffActivity[]> {
    let allActivities = await activityService.getAll();
    if (staffId) {
        allActivities = allActivities.filter(a => a.staffId === staffId);
    }
    return allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addStaff(member: Omit<Staff, 'id'>): Promise<Staff> {
  const newMember: Staff = { 
      ...member, 
      id: `staff-${Date.now()}`,
      verificationDocuments: member.status === 'Pending Verification' ? [
        { name: 'National_ID.pdf', url: '#' },
        { name: 'Drivers_License.pdf', url: '#' },
      ] : [],
    };
  return await staffService.create(newMember, { prepend: true });
}

export async function updateStaff(updatedMember: Staff): Promise<Staff> {
  return await staffService.update(updatedMember.id, updatedMember);
}

export async function deleteStaff(staffId: string): Promise<void> {
  await staffService.delete(staffId);
}
