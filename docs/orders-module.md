# Orders Module

## Overview

The Orders module is the central hub for managing all sales transactions within the system. It is responsible for tracking an order from its creation (whether online, manual, or via POS) through payment, fulfillment, and completion.

## Core Concepts

- **Order Object (`Order` type in `src/lib/types.ts`):** The primary data structure representing a sale. It contains customer information, items purchased, payment details, shipping information, and status history.
- **Order Service (`src/services/orders.ts`):** The main service file containing all business logic for creating, reading, updating, and deleting orders. This service is the single source of truth for order state changes.
- **Order Components:** React components in `src/components/dashboard/orders/`, `src/components/dashboard/orders-table.tsx`, and `src/app/(dashboard)/dashboard/orders/` are used to render the UI for managing orders.

## Key Interactions with Other Modules

The Orders module is highly interconnected and acts as a trigger for many other parts of the application.

### 1. Customers Module

-   **Connection:** When an order is created, it is linked to a `Customer` via `customerId`.
-   **Impact:**
    -   The customer's `totalSpend` and `lastOrderDate` are updated.
    -   The order appears in the customer's detailed view (`/dashboard/customers/[id]`).

### 2. Products & Inventory Module

-   **Connection:** Order items (`OrderItem[]`) are directly linked to `ProductVariant` SKUs.
-   **Impact:**
    -   **Stock Reservation:** When an order is first created, the `updateProductStock` function is called with a `Reserve` action, moving stock from `available` to `reserved` to prevent overselling.
    -   **Stock Deduction:** When an order is fulfilled (`Delivered` or `Picked Up`), `updateProductStock` is called again with a `Sale` action to decrement the `onHand` and `reserved` quantities for the corresponding product variants.
    -   **Stock Return:** If an order is `Cancelled`, `updateProductStock` is called with an `Un-reserve` action to make the stock available again.

### 3. Finances Module

-   **Connection:** A successful payment for an order triggers the creation of a financial `Transaction` record.
-   **Impact:**
    -   When an order's payment status becomes `completed` (either through a payment gateway webhook or manual marking), an `Income` transaction is logged via `addTransaction` in `src/services/finances.ts`. This ensures the financial ledger reflects sales revenue accurately.

### 4. Staff & Commissions Module

-   **Connection:** Orders can be linked to staff members via `salesAgentId` (for sales attribution) and `assignedStaffId` or `fulfilledByStaffId` (for fulfillment).
-   **Impact:**
    -   **Commission Calculation:** When an order is paid or fulfilled, the `handleCommission` function in `src/services/orders.ts` is triggered. It checks the role of the associated staff member (`Sales Agent`, `Agent`, etc.) and calculates commission based on the rules defined in the `Roles` module (`src/services/roles.ts`).
    -   The calculated commission updates the `totalCommission` on the `Staff` object.
