
'use client';
import { useState, useEffect } from 'react';
import type { ShippingZone } from '@/lib/types';
import { getShippingZones } from '@/services/shipping';
import { ShippingZones } from './shipping-zones';
import { Skeleton } from '../ui/skeleton';

export function ShippingSettings() {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const zones = await getShippingZones();
      setShippingZones(zones);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  return (
    <ShippingZones 
      zones={shippingZones}
      setZones={setShippingZones}
    />
  );
}
