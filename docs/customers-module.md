# Customers Module

## Overview

The Customers module is responsible for managing all customer-related data. It serves as the single source of truth for customer profiles, contact information, purchase history, and engagement metrics.

## Core Concepts

- **Customer Object (`Customer` type in `src/lib/types.ts`):** The primary data structure representing a customer. It includes personal details, contact information, address, purchase history (`orders`), total spend, and group classification.
- **Customer Service (`src/services/customers.ts`):** Contains the core business logic for creating, reading, updating, and deleting customer records.
- **Customer Components:** A suite of React components in `src/components/dashboard/customers/`, `src/components/dashboard/customer-form.tsx`, `src/app/(dashboard)/dashboard/customers/`, and the customer account section in the storefront (`src/app/(storefront)/store/(account)/`) are used to manage and display customer information.

## Key Interactions with Other Modules

### 1. Orders Module

- **Connection:** When an `Order` is created, it is linked to a `Customer` via `customerId`.
- **Impact:**
    - When an order is completed, the customer's `totalSpend` and `lastOrderDate` are updated via `updateCustomer`.
    - The `getCustomerById` function fetches associated orders to display a complete purchase history in the customer's detail view.

### 2. Marketing Module

- **Connection:** `Campaigns` and `Discounts` can be targeted to specific `CustomerGroups` (e.g., "Wholesaler", "VIP").
- **Impact:**
    - The system checks a customer's `customerGroup` to determine their eligibility for certain discounts or marketing communications.
    - AI flows like `classifyCustomer` analyze a customer's purchase history to suggest an appropriate `customerGroup`.

### 3. Staff Module

- **Connection:** Customers created manually can be linked to the staff member who created them via `createdById`.
- **Impact:** This allows for tracking which staff members are bringing in new customers and can be used for performance metrics.
