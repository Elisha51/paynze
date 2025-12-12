

import type { ShippingZone } from '@/lib/types';
import { DataService } from './data-service';

const initializeMockShippingZones = (): ShippingZone[] => [
    {
        id: 'zone-1',
        name: 'Domestic (Uganda)',
        countries: ['Uganda'],
        taxRate: 18,
        deliveryMethods: [
            { id: 'method-1', name: 'Standard Shipping', description: '3-5 business days', type: 'Fixed', price: 10000 },
            { id: 'method-2', name: 'Express Shipping', description: '1-2 business days', type: 'Fixed', price: 25000 },
            { id: 'method-3', name: 'In-Store Pickup', description: 'Collect from our Kampala store', type: 'Fixed', price: 0 },
        ]
    },
    {
        id: 'zone-2',
        name: 'East Africa',
        countries: ['Kenya', 'Tanzania, United Republic of', 'Rwanda'],
        taxRate: 0,
        deliveryMethods: [
            { id: 'method-4', name: 'EAC Standard', description: '5-10 business days', type: 'Fixed', price: 50000 },
        ]
    }
];

const shippingZoneService = new DataService<ShippingZone>('shippingZones', initializeMockShippingZones);

export async function getShippingZones(): Promise<ShippingZone[]> {
    return await shippingZoneService.getAll();
}

export async function addShippingZone(zone: Omit<ShippingZone, 'id' | 'deliveryMethods'> & { deliveryMethods?: ShippingZone['deliveryMethods'] }): Promise<ShippingZone> {
    const newZone: ShippingZone = {
        ...zone,
        id: `zone-${Date.now()}`,
        deliveryMethods: zone.deliveryMethods || [],
    };
    return await shippingZoneService.create(newZone);
}

export async function updateShippingZone(updatedZone: ShippingZone): Promise<ShippingZone> {
    return await shippingZoneService.update(updatedZone.id, updatedZone);
}

export async function deleteShippingZone(zoneId: string): Promise<void> {
    await shippingZoneService.delete(zoneId);
}
