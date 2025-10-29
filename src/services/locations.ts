
import type { Location } from '@/lib/types';
import { DataService } from './data-service';

const initializeMockLocations: () => Location[] = () => [
    {
        id: 'loc_1',
        name: 'Main Warehouse',
        address: '123 Industrial Area, Kampala, Uganda',
        isPickupLocation: false,
        isDefault: true,
    },
    {
        id: 'loc_2',
        name: 'Downtown Store',
        address: '45 Acacia Avenue, Kampala, Uganda',
        isPickupLocation: true,
        isDefault: false,
    },
];

const locationService = new DataService<Location>('locations', initializeMockLocations);


export async function getLocations(): Promise<Location[]> {
  return await locationService.getAll();
}

export async function addLocation(location: Omit<Location, 'id'>): Promise<Location> {
  const newLocation: Location = { ...location, id: `loc_${Date.now()}` };
  return await locationService.create(newLocation);
}

export async function updateLocation(updatedLocation: Location): Promise<Location> {
  return await locationService.update(updatedLocation.id, updatedLocation);
}

export async function deleteLocation(locationId: string): Promise<void> {
  await locationService.delete(locationId);
}
