
import type { Staff } from '@/lib/types';
import { format } from 'date-fns';

let staff: Staff[] = [
  { id: 'staff-001', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm') },
  { id: 'staff-002', name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Agent', status: 'Active', lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm') },
  { id: 'staff-003', name: 'Peter Jones', email: 'peter@example.com', role: 'Delivery Rider', status: 'Inactive', lastLogin: '2023-05-10 14:00' },
  { id: 'staff-004', name: 'Mary Anne', email: 'mary@example.com', role: 'Finance Manager', status: 'Active', lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm') },
];

export async function getStaff(): Promise<Staff[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...staff];
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
