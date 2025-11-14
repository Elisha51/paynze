# Procurement Module

## Overview

The Procurement module streamlines the process of ordering and receiving inventory from suppliers. It is central to inventory management, ensuring that stock levels are replenished accurately and purchase histories are maintained.

## Core Concepts

- **Supplier (`Supplier` type in `src/lib/types.ts`):** Represents a vendor from whom products are purchased. Each supplier has contact information and a list of products they supply.

- **Purchase Order (`PurchaseOrder` type in `src/lib/types.ts`):** The primary data structure for a procurement transaction. It details which products are being ordered, from which supplier, their costs, and the status of the order (e.g., `Draft`, `Sent`, `Received`).

- **Procurement Service (`src/services/procurement.ts`):** Contains the core business logic for managing `Suppliers` and `PurchaseOrders`.

- **Receiving Stock (`receivePurchaseOrder` function):** A key function within the procurement service that is triggered when a shipment from a supplier arrives. This function is a critical link to the Products module.

## Key Interactions with Other Modules

### 1. Products Module

-   **Connection:** Items within a `PurchaseOrder` are directly linked to `Product` SKUs.
-   **Impact:** This is the most critical interaction in the procurement flow.
    -   When a `PurchaseOrder` is marked as **`Received`** using the `receivePurchaseOrder` function, it triggers a call to a stock update function.
    -   This function then performs a **`Restock`** or **`Initial Stock`** action on the corresponding product variants.
    -   As a result, the `onHand` and `available` quantities for the received products are increased, ensuring that the new inventory is immediately available for sale.

### 2. Finances Module

-   **Connection:** While not directly implemented in the mock services, a logical extension of this module is to connect it with the Finances module.
-   **Potential Impact:**
    -   When a `PurchaseOrder` is sent and paid for, it would ideally trigger the creation of an **`Expense`** transaction via the `addTransaction` function in `src/services/finances.ts`.
    -   This would ensure that the cost of goods sold is accurately reflected in the financial ledger.