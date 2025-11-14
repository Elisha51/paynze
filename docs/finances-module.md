# Finances Module

## Overview

The Finances module is the financial ledger of the application, responsible for tracking all incoming and outgoing money. It provides a clear record of every transaction, from sales revenue to operational expenses, ensuring accurate financial reporting.

## Core Concepts

-   **Transaction (`Transaction` type):** The fundamental data object, representing a single financial event. Each transaction has a `type` (`Income` or `Expense`), an `amount`, a `category` (e.g., "Sales", "Inventory", "Salaries"), and a link to its source where applicable.

-   **Finance Service (`src/services/finances.ts`):** This service contains the core function `addTransaction`, which is the sole entry point for creating new financial records. Other modules call this service to log financial activities.

## Key Interactions with Other Modules

The Finances module primarily receives data from other modules when a financially significant event occurs.

### 1. Orders Module

-   **Connection:** When an order's payment status becomes **`completed`**, it triggers a call to the Finance service.
-   **Impact:** The `addTransaction` function is invoked to create an **`Income`** transaction. This directly links sales revenue from the Orders module to the financial ledger, ensuring that every completed sale is recorded as income.

### 2. Procurement Module

-   **Connection:** When a `PurchaseOrder` is paid for, it should trigger the creation of an expense record.
-   **Impact:** An **`Expense`** transaction is created via `addTransaction` to log the cost of goods purchased from a supplier. This ensures that inventory costs are accurately tracked as business expenses.

### 3. Staff & Commissions Module

-   **Connection:** When a staff member or affiliate is paid their commission or a bonus is awarded, it is logged as a financial transaction.
-   **Impact:** The action of paying out commissions (e.g., via the Payouts page) triggers the `addTransaction` function to create an **`Expense`** transaction with the category "Salaries" or "Commissions". This ensures that staff payouts are correctly recorded as operational costs.
