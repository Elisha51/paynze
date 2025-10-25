
import type { Role, Permissions } from '@/lib/types';

const defaultPermissions: Permissions = {
  canViewDashboard: true,
  canManageProducts: false,
  canManageOrders: false,
  canManageCustomers: false,
  canManageFinances: false,
  canManageStaff: false,
  canManageSettings: false,
};

const roles: Role[] = [
  {
    name: 'Admin',
    description: 'Has access to all features and settings.',
    permissions: {
      canViewDashboard: true,
      canManageProducts: true,
      canManageOrders: true,
      canManageCustomers: true,
      canManageFinances: true,
      canManageStaff: true,
      canManageSettings: true,
    },
  },
  {
    name: 'Sales Agent',
    description: 'Manages products, orders, and customers.',
    permissions: {
      ...defaultPermissions,
      canManageProducts: true,
      canManageOrders: true,
      canManageCustomers: true,
    },
  },
  {
    name: 'Delivery Rider',
    description: 'Views and updates order and delivery statuses.',
    permissions: {
      ...defaultPermissions,
      canManageOrders: true,
    },
  },
  {
    name: 'Finance Manager',
    description: 'Manages financial records and reporting.',
    permissions: {
      ...defaultPermissions,
      canManageFinances: true,
    },
  },
];

export async function getRoles(): Promise<Role[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(roles)); // Deep copy to avoid mutation issues
}
