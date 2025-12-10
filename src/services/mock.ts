// src/services/mock.ts

import type { OnboardingFormData } from '@/lib/types';
import { themes } from '@/themes';

// This function simulates fetching tenant-specific data on the server.
// In a real application, this would take the domain/subdomain from the request headers,
// look up the tenant in a database, and return their settings.
export async function getMockOnboardingData(): Promise<OnboardingFormData | null> {
    const mockData: OnboardingFormData = {
        plan: 'Pro',
        businessName: 'Kato Traders',
        businessType: 'Retailer',
        contactPhone: '+256772123456',
        country: 'Uganda',
        subdomain: 'kato-traders',
        currency: 'UGX',
        language: 'English',
        theme: themes[0].name,
        logoUrl: '/logo-placeholder.svg',
        domainType: 'subdomain',
        customDomain: '',
        taxRate: 18,
        paymentOptions: {
            cod: true,
            mobileMoney: true,
        },
        payoutAccounts: {
            mtn: '0772123456',
            airtel: '0752123456',
        },
        delivery: {
            pickup: true,
            address: 'Shop 14, Kikuubo Lane, Kampala',
            deliveryFee: '10000',
        },
        inventory: {
            enableLowStockAlerts: true,
        }
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return mockData;
}
