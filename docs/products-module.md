# Products Module

## Overview

The Products module is the foundation of the catalog, responsible for all aspects of product information, pricing, and inventory management. It serves as the master record for everything the business sells.

## Core Concepts

- **Product Object (`Product` type in `src/lib/types.ts`):** The primary data structure for any item sold. It's a comprehensive object that includes:
    - General information (name, description, images).
    - Pricing (retail, compare-at, wholesale tiers).
    - Inventory details (SKU, barcode, tracking type, stock levels).
    - Variants (options like size or color, each with its own SKU, price, and inventory).
    - Organization (category, tags, suppliers).

- **Product Service (`src/services/products.ts`):** Contains the core business logic for creating, reading, updating, and deleting products.

- **Stock Management (`updateProductStock` function):** A critical utility, likely within the `orders` or `procurement` service, that modifies a product variant's stock levels. It handles actions like `Reserve`, `Un-reserve`, `Sale` (deduct), and `Restock` (add).

- **Product Components:** A suite of React components in `src/components/dashboard/products/`, `src/components/dashboard/product-form.tsx`, `src/app/(dashboard)/dashboard/products/`, and the public-facing `src/app/(storefront)/product/[sku]/` are used to manage and display product information.

## Key Interactions with Other Modules

### 1. Orders Module

-   **Connection:** When an `Order` is created, its `items` array contains `OrderItem` objects, which are directly linked to `ProductVariant` SKUs.
-   **Impact:** The `addOrder` and `updateOrder` functions in the Orders service are the primary triggers for stock changes.
    -   **Sale:** When an order is fulfilled (`Delivered` or `Picked Up`), `updateProductStock` is called with a `Sale` action to decrement `onHand` stock for the purchased variants.
    -   **Reservation:** When an order is first created, `updateProductStock` may be called with a `Reserve` action to move stock from `available` to `reserved`, preventing overselling while payment is pending.
    -   **Cancellation:** If an order is `Cancelled`, `updateProductStock` is called with an `Un-reserve` action to return the items to the `available` pool.

### 2. Procurement Module

-   **Connection:** `PurchaseOrder` items are linked to `Product` SKUs.
-   **Impact:** When a `PurchaseOrder` is marked as `Received` via the `receivePurchaseOrder` function, this triggers a call to a stock update function (similar to `updateProductStock`) with a `Restock` or `Initial Stock` action, increasing the `onHand` and `available` quantities for the received products.

### 3. Marketing Module

-   **Connection:** `Discount` and `Campaign` entities can be configured to apply to specific products or entire categories.
-   **Impact:**
    -   The storefront logic checks if items in the cart are eligible for any active discounts.
    -   Campaigns can feature specific products in banners or promotional messages.

### 4. Customers Module

-   **Connection:** While indirect, a customer's `wishlist` is an array of `Product` SKUs.
-   **Impact:** The `updateCustomer` function modifies this list, linking a customer to products they are interested in.
