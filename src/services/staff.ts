

import type { Staff, Order } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { getOrders } from './orders';

let staff: Staff[] = [];
let allOrders: Order[] = [];

async function initializeStaff() {
    allOrders = await getOrders();
    staff = [
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
        currency: 'KES',
        attributes: {
          salesTarget: { goal: 500000, current: 125000 },
          assignedRegions: ['Nairobi', 'Mombasa'],
          isKeyAccountManager: true,
        },
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
        lastLogin: '2023-05-10 14:00',
        onlineStatus: 'Offline',
        assignedOrders: allOrders.filter(o => o.assignedStaffId === 'staff-003'),
        completionRate: 95.2,
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
      },
       { 
        id: 'staff-006', 
        name: 'Aisha Omar', 
        email: 'aisha@example.com', 
        phone: '+254701234567',
        avatarUrl: 'https://picsum.photos/seed/aisha-omar/100/100',
        role: 'Delivery Rider', 
        status: 'Pending Verification', 
        verificationDocuments: [
            { name: 'National_ID.pdf', url: '#' },
            { name: 'Drivers_License.pdf', url: '#' },
        ],
        lastLogin: undefined,
        onlineStatus: 'Offline',
        assignedOrders: [],
      },
    ];
}

initializeStaff();

export async function getStaff(): Promise<Staff[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...staff];
}

export async function getStaffOrders(staffId: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const allOrders = await getOrders();
    return allOrders.filter(o => o.assignedStaffId === staffId);
}

export async function addStaff(member: Omit<Staff, 'id'>): Promise<Staff> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newMember: Staff = { 
      ...member, 
      id: `staff-${Date.now()}`,
      verificationDocuments: member.status === 'Pending Verification' ? [
        { name: 'National_ID.pdf', url: '#' },
        { name: 'Drivers_License.pdf', url: '#' },
      ] : [],
    };
  staff.unshift(newMember);
  return newMember;
}

export async function updateStaff(updatedMember: Staff): Promise<Staff> {
  await new Promise(resolve => setTimeout(resolve, 300));
  staff = staff.map(s => s.id === updatedMember.id ? updatedMember : s);
  return updatedMember;
}

export async function deleteStaff(staffId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  staff = staff.filter(s => s.id !== staffId);
}
