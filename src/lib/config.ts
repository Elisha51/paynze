// src/lib/config.ts

export const COMMISSION_RULE_TRIGGERS = [
    'On Order Paid',
    'On Order Delivered',
] as const;

export const COMMISSION_RULE_TYPES = [
    'Fixed Amount',
    'Percentage of Sale',
] as const;

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
};

export default config;
