
import type { Location } from '@/lib/types';

const locations: Location[] = [
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

export async function getLocations(): Promise<Location[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return locations;
}
