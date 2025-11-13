
import type { CustomerGroup } from '@/lib/types';
import { DataService } from './data-service';

const mockCustomerGroups: CustomerGroup[] = [
    { id: 'group-default', name: 'default' },
    { id: 'group-wholesaler', name: 'Wholesaler' },
    { id: 'group-retailer', name: 'Retailer' },
];

const customerGroupService = new DataService<CustomerGroup>('customerGroups', () => mockCustomerGroups);

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  return await customerGroupService.getAll();
}

export async function addCustomerGroup(group: Omit<CustomerGroup, 'id'>): Promise<CustomerGroup> {
  const newGroup: CustomerGroup = { ...group, id: `group-${Date.now()}` };
  return await customerGroupService.create(newGroup);
}

export async function updateCustomerGroup(updatedGroup: CustomerGroup): Promise<CustomerGroup> {
  return await customerGroupService.update(updatedGroup.id, updatedGroup);
}

export async function deleteCustomerGroup(groupId: string): Promise<void> {
  await customerGroupService.delete(groupId);
}
