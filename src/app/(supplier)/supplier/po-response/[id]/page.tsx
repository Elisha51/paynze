
'use client';
// This page must be a Client Component because its data fetching
// relies on a service that uses localStorage.

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getPurchaseOrderById } from '@/services/procurement';
import { PurchaseOrderResponseForm } from '@/components/supplier/purchase-order-response-form';
import type { OnboardingFormData, PurchaseOrder } from '@/lib/types';
import { getMockOnboardingData } from '@/services/mock';


export default function PurchaseOrderResponsePage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        };

        async function loadData() {
            const [orderData, settingsData] = await Promise.all([
                getPurchaseOrderById(id),
                getMockOnboardingData()
            ]);

            if (!orderData || !settingsData) {
                // Handle not found case
            } else {
                setOrder(orderData);
                setSettings(settingsData);
            }
            setIsLoading(false);
        }

        loadData();
    }, [id]);

    if (isLoading) {
        // You can return a loading skeleton here
        return <div>Loading...</div>;
    }

    if (!order || !settings) {
        notFound();
    }
  
    // The form itself is a Client Component to handle state and interactions.
    return <PurchaseOrderResponseForm initialOrder={order} settings={settings} />;
}
