

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
        role: 'Admin', 
        status: 'Active', 
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Online',
        assignedOrders: [],
        completionRate: 100,
        totalSales: 550000,
        currency: 'UGX',
        targets: [
            { id: 't-1', name: 'Monthly Sales', goal: 1000000, current: 550000 },
            { id: 't-2', name: 'Team Growth', goal: 5, current: 4 },
        ],
        zones: ['National']
      },
      { 
        id: 'staff-002', 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        role: 'Sales Agent', 
        status: 'Active', 
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Online',
        assignedOrders: [],
        totalSales: 125000,
        currency: 'KES',
        targets: [
            { id: 't-3', name: 'New Customers', goal: 10, current: 7 },
        ],
        zones: ['Nairobi', 'Mombasa']
      },
      { 
        id: 'staff-003', 
        name: 'Peter Jones', 
        email: 'peter@example.com', 
        role: 'Delivery Rider', 
        status: 'Active', 
        lastLogin: '2023-05-10 14:00',
        onlineStatus: 'Offline',
        assignedOrders: allOrders.slice(0, 1),
        completionRate: 95.2,
        targets: [
            { id: 't-4', name: 'On-time Deliveries', goal: 50, current: 48 },
        ],
        zones: ['Kampala Central']
      },
      { 
        id: 'staff-004', 
        name: 'Mary Anne', 
        email: 'mary@example.com', 
        role: 'Finance Manager', 
        status: 'Active', 
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
        onlineStatus: 'Online',
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
