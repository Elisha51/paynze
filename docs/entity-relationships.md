# Entity Relationship Diagram (ERD) - Conceptual Model

This document outlines the conceptual relationships between the core data entities in the system. While the current implementation uses a NoSQL database (Firestore), this model describes the relational logic that the application code enforces.

## Key to Relationships

-   **`1-to-1`**: One-to-One (e.g., A User has one Profile).
-   **`1-to-M`**: One-to-Many (e.g., A Customer can have many Orders).
-   **`M-to-1`**: Many-to-One (e.g., Many Orders belong to one Customer).
-   **`M-to-M`**: Many-to-Many (e.g., A Product can be in many Orders, and an Order can have many Products).

---

## Core Entities & Relationships

### Staff & Roles

-   **`StaffProfile` to `Role` (M-to-1)**
    -   Each `StaffProfile` is assigned exactly one `Role`.
    -   A `Role` can be assigned to many `StaffProfile` records.
    -   _Implementation_: `StaffProfile.role` (string) stores the `name` of the `Role`.

-   **`StaffProfile` to `Order` (1-to-M)**
    -   A `StaffProfile` can be linked to many `Order` records in different capacities.
    -   _Implementation_:
        -   `Order.salesAgentId` -> `StaffProfile.id` (for sales credit)
        -   `Order.assignedStaffId` -> `StaffProfile.id` (for fulfillment assignment)
        -   `Order.fulfilledByStaffId` -> `StaffProfile.id` (for fulfillment completion)

### Customers (UserProfiles) & Orders

-   **`UserProfile` to `Order` (1-to-M)**
    -   A `UserProfile` (customer) can have many `Order` records.
    -   _Implementation_: `Order.customerId` -> `UserProfile.id`.

-   **`UserProfile` to `Product` (M-to-M, through Wishlist)**
    -   A `UserProfile` can have many `Product` records in their wishlist.
    -   A `Product` can be in many wishlists.
    -   _Implementation_: `UserProfile.wishlist` is an array of `Product.id` (SKUs).

### Support Tickets

-   **`SupportTicket` to `UserProfile` (M-to-1)**
    -   A `SupportTicket` is submitted by one `UserProfile` (merchant/user).
    -   _Implementation_: `SupportTicket.merchantId` -> `UserProfile.id`.

### Orders & Products

-   **`Order` to `Product` (M-to-M, through `OrderItem`)**
    -   An `Order` contains many `OrderItem` records.
    -   Each `OrderItem` links to a specific `Product` (or variant).
    -   A `Product` can be part of many `OrderItem` records across different orders.
    -   _Implementation_: `Order.items` is an array of `OrderItem` objects. `OrderItem.sku` links to `Product.id` or `ProductVariant.sku`.

### Procurement (Suppliers & Purchase Orders)

-   **`Supplier` to `PurchaseOrder` (1-to-M)**
    -   A `Supplier` can have many `PurchaseOrder` records.
    -   _Implementation_: `PurchaseOrder.supplierId` -> `Supplier.id`.

-   **`PurchaseOrder` to `Product` (M-to-M, through `PurchaseOrderItem`)**
    -   A `PurchaseOrder` contains many `PurchaseOrderItem` records.
    -   Each `PurchaseOrderItem` links to a specific `Product`.
    -   _Implementation_: `PurchaseOrder.items` is an array of `PurchaseOrderItem` objects. `PurchaseOrderItem.productId` links to `Product.id`.

-   **`Supplier` to `Product` (M-to-M)**
    -   A `Supplier` can supply many `Product` records.
    -   A `Product` can be supplied by many `Supplier` records.
    -   _Implementation_: `Supplier.productsSupplied` is an array of `Product.id`s. `Product.supplierIds` is an array of `Supplier.id`s.

### Marketing (Campaigns, Discounts, Affiliates)

-   **`Campaign` to `Product` (M-to-M)**
    -   A `Campaign` can promote many `Product` records.
    -   A `Product` can be part of many `Campaign` records.
    -   _Implementation_: `Campaign.applicableProductIds` is an array of `Product.id`s.

-   **`Discount` to `Product` (M-to-M)**
    -   A `Discount` can be applicable to many `Product` records.
    -   A `Product` can be affected by many `Discount` records.
    -   _Implementation_: `Discount.applicableProductIds` is an array of `Product.id`s.

-   **`Affiliate` to `Order` (1-to-M)**
    -   An `Affiliate` can be credited with many `Order` records.
    -   _Implementation_: `Order.salesAgentId` -> `Affiliate.id`. (Note: `Affiliate` is conceptually a type of `Staff`).

### Financials (Transactions)

-   **`Transaction` to `Order` (1-to-1, Optional)**
    -   An `Order` payment results in one `Transaction` record.
    -   _Implementation_: `Transaction.orderId` -> `Order.id`.

-   **`Transaction` to `PurchaseOrder` (1-to-1, Optional)**
    -   A `PurchaseOrder` payment results in one `Transaction` record.
    -   _Implementation_: `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.

-   **`Transaction` to `StaffProfile` (M-to-1, Optional)**
    -   A `Transaction` for a salary or commission payout is linked to one `StaffProfile`.
    -   _Implementation_: `Transaction.payoutForStaffId` -> `StaffProfile.id`.

### Store Configuration (Conceptual Relationships)

-   **`ShippingZone` to `Location`**
    -   These are related through application logic (e.g., a Location's country determines which ShippingZone applies) but not through a direct ID link in the database schema.

-   **`Templates` to Entities (`Product`, `Campaign`, etc.)**
    -   Templates are used to **create** new entities but are not directly linked to the created records. This is a one-way, "blueprint" relationship handled by the application logic.

---

This document provides a clear, high-level overview for developers to understand the intended data connections and implement the necessary logic for joins and data integrity.
