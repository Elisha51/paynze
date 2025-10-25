

import type { Role, Permissions } from '@/lib/types';

const defaultPermissions: Permissions = {
  dashboard: { view: true },
  products: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, create: false, edit: false, delete: false },
  customers: { view: false, create: false, edit: false, delete: false },
  procurement: { view: false, create: false, edit: false, delete: false },
  finances: { view: false, create: false, edit: false, delete: false },
  staff: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
};

let roles: Role[] = [
  {
    name: 'Admin',
    description: 'Has access to all features and settings.',
    permissions: {
      dashboard: { view: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true },
      customers: { view: true, create: true, edit: true, delete: true },
      procurement: { view: true, create: true, edit: true, delete: true },
      finances: { view: true, create: true, edit: true, delete: true },
      staff: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, edit: true },
    },
    assignableAttributes: []
  },
  {
    name: 'Sales Agent',
    description: 'Manages products, orders, and customers.',
    permissions: {
      ...defaultPermissions,
      dashboard: { view: true },
      products: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: true, edit: true, delete: false },
      customers: { view: true, create: true, edit: true, delete: false },
    },
    commission: {
        type: 'Percentage of Sale',
        rate: 5,
    },
    assignableAttributes: [
        { key: 'salesTarget', label: 'Monthly Sales Target', type: 'kpi' },
        { key: 'assignedRegions', label: 'Sales Regions', type: 'tags' },
        { key: 'isKeyAccountManager', label: 'Is Key Account Manager', type: 'boolean' }
    ]
  },
  {
    name: 'Delivery Rider',
    description: 'Views and updates order and delivery statuses.',
    permissions: {
      ...defaultPermissions,
      dashboard: { view: true },
      orders: { view: true, create: false, edit: true, delete: false },
    },
    commission: {
        type: 'Fixed Amount',
        rate: 1500,
    },
    assignableAttributes: [
        { key: 'deliveryTarget', label: 'Daily Delivery Target', type: 'kpi' },
        { key: 'deliveryZones', label: 'Delivery Zones', type: 'tags' },
        { key: 'vehicleId', label: 'Vehicle ID', type: 'string' },
        { key: 'lastInspectionDate', label: 'Last Vehicle Inspection', type: 'date' }
    ]
  },
  {
    name: 'Finance Manager',
    description: 'Manages financial records and reporting.',
    permissions: {
      ...defaultPermissions,
      dashboard: { view: true },
      finances: { view: true, create: true, edit: true, delete: true },
      procurement: { view: true, create: true, edit: true, delete: false },
    },
    assignableAttributes: []
  },
];

export async function getRoles(): Promise<Role[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return JSON.parse(JSON.stringify(roles)); // Deep copy to avoid mutation issues
}

export async function addRole(role: Role): Promise<Role> {
  await new Promise(resolve => setTimeout(resolve, 300));
  roles.push(role);
  return role;
}

export async function updateRole(updatedRole: Role): Promise<Role> {
  await new Promise(resolve => setTimeout(resolve, 300));
  roles = roles.map(r => r.name === updatedRole.name ? updatedRole : r);
  return updatedRole;
}
