# Staff Module

## Overview

The Staff module is responsible for managing all internal team members, including their roles, permissions, performance, and compensation. This includes full-time employees, part-time workers, and sales agents. It does **not** include external marketing affiliates, who are managed under the Marketing module.

## Core Concepts

- **Staff Object (`Staff` type):** The primary data structure for a team member. It includes their personal details, role, status, performance metrics (like `totalSales` and `totalCommission`), and potentially custom attributes defined by their role.

- **Role Object (`Role` type):** Defines a set of permissions, commission rules, and assignable attributes for a category of staff (e.g., "Manager", "Sales Agent", "Agent"). This is the central piece for controlling what a user can see and do.

- **Staff Service (`src/services/staff.ts`):** Contains the core logic for managing staff records.

## Key Interactions with Other Modules

### 1. Orders Module

-   **Connection:** Staff members are linked to `Orders` through `salesAgentId` (for sales attribution) and `assignedStaffId` or `fulfilledByStaffId` (for fulfillment tasks).
-   **Impact:**
    -   When an order is paid for or fulfilled, the `handleCommission` function is called to calculate the appropriate commission for the linked staff member based on the rules in their assigned `Role`.
    -   This updates the `totalCommission` on the `Staff` object.

### 2. Customers Module

-   **Connection:** When a `Customer` is created manually in the dashboard, they can be linked to the staff member who created them via `createdById`.
-   **Impact:** This allows for tracking which staff members are bringing in new customers and can be used for performance evaluations.

### 3. Finances & Commissions Module

-   **Connection:** When a staff member's earned `totalCommission` is paid out, it is logged as a financial transaction.
-   **Impact:** Paying out a commission (e.g., from the Payouts page) triggers the `addTransaction` function in the Finances service. This creates an **`Expense`** transaction, ensuring that staff compensation is accurately recorded in the financial ledger.
