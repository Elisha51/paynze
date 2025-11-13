
import type { Role, Permissions, CommissionRule } from '@/lib/types';
import { DataService } from './data-service';

const defaultPermissions: Permissions = {
  dashboard: { view: true },
  products: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, create: false, edit: false, delete: false },
  customers: { view: false, create: false, edit: false, delete: false, viewAll: false },
  procurement: { view: false, create: false, edit: false, delete: false },
  marketing: { view: false, create: false, edit: false, delete: false },
  templates: { view: false, create: false, edit: false, delete: false },
  finances: { view: false, create: false, edit: false, delete: false },
  staff: { view: false, create: false, edit: false, delete: false },
  tasks: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
};

const mockRoles: Role[] = [
  {
    name: 'Admin',
    description: 'Full access to all features and settings.',
    permissions: {
      dashboard: { view: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true },
      customers: { view: true, create: true, edit: true, delete: true, viewAll: true },
      procurement: { view: true, create: true, edit: true, delete: true },
      marketing: { view: true, create: true, edit: true, delete: true },
      templates: { view: true, create: true, edit: true, delete: true },
      finances: { view: true, create: true, edit: true, delete: true },
      staff: { view: true, create: true, edit: true, delete: true },
      tasks: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, edit: true },
    },
    assignableAttributes: [],
    commissionRules: [],
  },
  {
    name: 'Manager',
    description: 'Manages orders, staff, campaigns, and inventory.',
    permissions: {
      ...defaultPermissions,
      dashboard: { view: true },
      products: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: true, edit: true, delete: false },
      customers: { view: true, create: true, edit: true, delete: false, viewAll: true },
      marketing: { view: true, create: true, edit: true, delete: false },
      staff: { view: true, create: true, edit: true, delete: false },
      tasks: { view: true, create: true, edit: true, delete: false },
      templates: { view: true, create: true, edit: true, delete: false },
    },
    assignableAttributes: [],
    commissionRules: [],
  },
  {
    name: 'Sales Agent',
    description: 'Handles product and customer management.',
    permissions: {
      ...defaultPermissions,
      dashboard: { view: true },
      products: { view: true, create: false, edit: false, delete: false },
      customers: { view: true, create: true, edit: true, delete: false, viewAll: false },
      tasks: { view: true, create: true, edit: false, delete: false },
    },
    commissionRules: [
        { id: 'sales-1', name: 'Standard Sales Commission', trigger: 'On Order Paid', type: 'Percentage of Sale', rate: 5 }
    ],
    assignableAttributes: [
        { key: 'salesTarget', label: 'Monthly Sales Target', type: 'kpi' },
        { key: 'assignedRegions', label: 'Sales Regions', type: 'tags' },
    ]
  },
  {
    name: 'Agent',
    description: 'Handles specific delivery or in-store duties.',
    permissions: {
      ...defaultPermissions,
      dashboard: { view: true },
      orders: { view: true, create: false, edit: true, delete: false },
      tasks: { view: true, create: false, edit: false, delete: false },
    },
    commissionRules: [
        { id: 'delivery-1', name: 'Per-Delivery Fee', trigger: 'On Order Delivered', type: 'Fixed Amount', rate: 1500 }
    ],
    assignableAttributes: [
        { key: 'deliveryTarget', label: 'Daily Delivery Target', type: 'kpi' },
        { key: 'deliveryZones', label: 'Delivery Zones', type: 'tags' },
        { key: 'vehicleId', label: 'Vehicle ID', type: 'string' },
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
      tasks: { view: true, create: true, edit: true, delete: true },
    },
    assignableAttributes: [],
    commissionRules: [],
  },
  {
    name: 'Affiliate',
    description: 'A marketing partner who earns commission on referred sales.',
    permissions: {
        ...defaultPermissions,
    },
    assignableAttributes: [],
    commissionRules: [],
  }
];

const roleService = new DataService<Role>('roles', () => mockRoles, 'name');

export async function getRoles(): Promise<Role[]> {
  return await roleService.getAll();
}

export async function addRole(role: Role): Promise<Role> {
  return await roleService.create(role);
}

export async function updateRole(updatedRole: Role): Promise<Role> {
  return await roleService.update(updatedRole.name, updatedRole);
}
