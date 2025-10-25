



import type { Staff, Order } from '@/lib/types';
import { format } from 'date-fns';
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
          assignedRegions: ['Nairobi', 'Mombasa']
        }
      },
      { 
        id: 'staff-003', 
        name: 'Peter Jones', 
        email: 'peter@example.com', 
        avatarUrl: 'https://picsum.photos/seed/peter-jones/100/100',
        role: 'Delivery Rider', 
        status: 'Active', 
        lastLogin: '2023-05-10 14:00',
        onlineStatus: 'Offline',
        assignedOrders: allOrders.slice(0, 1),
        completionRate: 95.2,
        attributes: {
          deliveryTarget: { goal: 20, current: 18 },
          deliveryZones: ['Kampala Central', 'Makindye']
        }
      },
      { 
        id: 'staff-004', 
        name: 'Mary Anne', 
        email: 'mary@example.com', 
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
        avatarUrl: 'https://picsum.photos/seed/chris-green/100/100',
        role: 'Sales Agent', 
        status: 'Inactive', 
        lastLogin: '2024-06-01 10:00',
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
    const member = staff.find(s => s.id === staffId);
    return member?.assignedOrders || [];
}

export async function addStaff(member: Omit<Staff, 'id'>): Promise<Staff> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newMember: Staff = { ...member, id: `staff-${Date.now()}` };
  staff.push(newMember);
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
