# Entity Relationship Diagram (ERD) - Conceptual Model

This document outlines the conceptual relationships between the core data entities in the system. It is designed to serve as a blueprint for database schema design and backend development. Each section details an entity, its purpose, its key linking attributes, and its relationships with other entities.

---

## Entity: Product

-   **Description**: Represents an item for sale in the store catalog. This is a central entity linked to orders, inventory, and marketing.
-   **Key Attributes**: `sku`, `category`, `supplierIds`, `variants.sku`
-   **Relationships**:
    -   **Product to Order**: (Many-to-Many) Implemented via the `OrderItem` join object. An Order can contain many Products, and a Product can appear in many Orders. The link is `OrderItem.sku` -> `Product.sku` or `ProductVariant.sku`.
    -   **Product to Category**: (Many-to-One) A Product belongs to one Category. The link is `Product.category` (string name) -> `Category.name`.
    -   **Product to Supplier**: (Many-to-Many) A Product can be sourced from multiple Suppliers, and a Supplier can provide multiple Products. The link is an array of IDs: `Product.supplierIds` <-> `Supplier.productsSupplied`.
    -   **Product to Campaign/Discount**: (Many-to-Many) A Product can be featured in many marketing Campaigns or be eligible for many Discounts. The link is `Campaign.applicableProductIds` or `Discount.applicableProductIds`.
    -   **Product to UserProfile (Customer)**: (Many-to-Many) A Customer can add many Products to their wishlist. The link is `UserProfile.wishlist` containing `Product.sku` values.

---

## Entity: Order

-   **Description**: Represents a customer's transaction for one or more products. It is the central record of a sale.
-   **Key Attributes**: `customerId`, `salesAgentId`, `assignedStaffId`, `fulfilledByStaffId`, `items` array.
-   **Relationships**:
    -   **Order to UserProfile (Customer)**: (Many-to-One) Many Orders can belong to a single Customer. The link is `Order.customerId` -> `UserProfile.id`.
    -   **Order to StaffProfile (Assignee)**: (Many-to-One) Many Orders can be assigned to or fulfilled by a single Staff member. The links are `Order.assignedStaffId` -> `StaffProfile.id` and `Order.fulfilledByStaffId` -> `StaffProfile.id`.
    -   **Order to StaffProfile/Affiliate (Sales Credit)**: (Many-to-One) Many Orders can be credited to a single sales agent (staff or affiliate). The link is `Order.salesAgentId` -> `StaffProfile.id` or `Affiliate.id`.
    -   **Order to Transaction**: (One-to-One, optional) A paid Order corresponds to one income `Transaction`. The link is `Transaction.orderId` -> `Order.id`.

---

## Entity: UserProfile (Customer)

-   **Description**: Represents an individual customer's profile, purchase history, and preferences.
-   **Key Attributes**: `id`, `createdById`, `wishlist`.
-   **Relationships**:
    -   **UserProfile to Order**: (One-to-Many) A Customer can have many Orders. The link is `Order.customerId` -> `UserProfile.id`.
    -   **UserProfile to StaffProfile**: (Many-to-One, optional) For manually created customers, many Customers can be created by a single Staff member. The link is `UserProfile.createdById` -> `StaffProfile.id`.
    -   **UserProfile to Product (Wishlist)**: (Many-to-Many) A Customer can have many Products in their wishlist. The link is the `UserProfile.wishlist` array of `Product.sku`s.
    -   **UserProfile to SupportTicket**: (One-to-Many) A Customer can submit many Support Tickets. The link is `SupportTicket.merchantId` -> `UserProfile.id`.

---

## Entity: StaffProfile (Staff)

-   **Description**: Represents an internal team member with specific roles and permissions.
-   **Key Attributes**: `id`, `role`.
-   **Relationships**:
    -   **StaffProfile to Role**: (Many-to-One) Many Staff members can share the same Role. The link is `StaffProfile.role` (string name) -> `Role.name`.
    -   **StaffProfile to Order**: (One-to-Many) A Staff member can be assigned to, fulfill, or be credited for many Orders. The links are `Order.assignedStaffId`, `Order.fulfilledByStaffId`, `Order.salesAgentId` -> `StaffProfile.id`.
    -   **StaffProfile to UserProfile (Customer)**: (One-to-Many) A Staff member can manually create many Customers. The link is `UserProfile.createdById` -> `StaffProfile.id`.
    -   **StaffProfile to Transaction**: (One-to-Many, optional) A Staff member can receive many payout Transactions. The link is `Transaction.payoutForStaffId` -> `StaffProfile.id`.

---

## Entity: PurchaseOrder

-   **Description**: A record for an inventory procurement transaction from a Supplier.
-   **Key Attributes**: `supplierId`, `items` array.
-   **Relationships**:
    -   **PurchaseOrder to Supplier**: (Many-to-One) Many Purchase Orders can be sent to a single Supplier. The link is `PurchaseOrder.supplierId` -> `Supplier.id`.
    -   **PurchaseOrder to Product**: (Many-to-Many) Implemented via the `PurchaseOrderItem` join object. A PO can contain many Products, and a Product can be on many POs. The link is `PurchaseOrderItem.productId` -> `Product.sku`.
    -   **PurchaseOrder to Transaction**: (One-to-One, optional) A paid Purchase Order corresponds to one expense `Transaction`. The link is `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.

---

## Entity: Supplier

-   **Description**: Represents a vendor from whom products are procured.
-   **Key Attributes**: `id`, `productsSupplied`.
-   **Relationships**:
    -   **Supplier to PurchaseOrder**: (One-to-Many) A Supplier can receive many Purchase Orders. The link is `PurchaseOrder.supplierId` -> `Supplier.id`.
    -   **Supplier to Product**: (Many-to-Many) A Supplier can provide multiple Products. The link is an array of SKUs: `Supplier.productsSupplied` <-> `Product.supplierIds`.

---

## Entity: Campaign

-   **Description**: A marketing initiative, such as an SMS blast or email newsletter.
-   **Key Attributes**: `applicableProductIds`, `allowedAffiliateIds`.
-   **Relationships**:
    -   **Campaign to Product**: (Many-to-Many) A Campaign can promote specific Products. The link is the `Campaign.applicableProductIds` array of `Product.sku`s.
    -   **Campaign to Affiliate**: (Many-to-Many) A Campaign can be restricted to specific Affiliates. The link is the `Campaign.allowedAffiliateIds` array of `Affiliate.id`s.

---

## Entity: Discount

-   **Description**: A promotional code for customers to use at checkout.
-   **Key Attributes**: `applicableProductIds`, `allowedAffiliateIds`.
-   **Relationships**:
    -   **Discount to Product**: (Many-to-Many) A Discount can be restricted to specific Products. The link is the `Discount.applicableProductIds` array of `Product.sku`s.

---

## Entity: Affiliate

-   **Description**: An external marketing partner who earns commissions on referred sales.
-   **Key Attributes**: `id`.
-   **Relationships**:
    -   **Affiliate to Order**: (One-to-Many) An Affiliate can be credited with many sales Orders. The link is `Order.salesAgentId` -> `Affiliate.id`.
    -   **Affiliate to Campaign**: (Many-to-Many) An Affiliate can participate in multiple Campaigns. The link is `Campaign.allowedAffiliateIds` containing `Affiliate.id`s.

---

## Entity: Transaction

-   **Description**: A single financial event in the ledger, representing income or expense.
-   **Key Attributes**: `orderId`, `purchaseOrderId`, `payoutForStaffId`.
-   **Relationships**:
    -   **Transaction to Order**: (One-to-One, optional) A sales Transaction is linked to one Order. Link: `Transaction.orderId` -> `Order.id`.
    -   **Transaction to PurchaseOrder**: (One-to-One, optional) An inventory expense Transaction is linked to one Purchase Order. Link: `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.
    -   **Transaction to StaffProfile**: (Many-to-One, optional) Many payout Transactions can be for a single Staff member. Link: `Transaction.payoutForStaffId` -> `StaffProfile.id`.

---

## Entity: Category

-   **Description**: Organizes products into a hierarchy for navigation and management.
-   **Key Attributes**: `id`, `parentId`.
-   **Relationships**:
    -   **Category to Product**: (One-to-Many) A Category can contain many Products. The link is `Product.category` (string name) -> `Category.name`.
    -   **Category to Category (Self-referencing)**: (One-to-Many) A parent Category can have many child Categories (subcategories). The link is `Category.parentId` -> `Category.id`.

---

## Entity: Role

-   **Description**: Defines permissions and attributes for a staff role.
-   **Key Attributes**: `name`.
-   **Relationships**:
    -   **Role to StaffProfile**: (One-to-Many) A Role can be assigned to many Staff members. The link is `StaffProfile.role` (string name) -> `Role.name`.

---

## Entity: SupportTicket

-   **Description**: Represents a single support request from a user.
-   **Key Attributes**: `merchantId`.
-   **Relationships**:
    -   **SupportTicket to UserProfile (Customer)**: (Many-to-One) Many Support Tickets can be submitted by a single Customer. The link is `SupportTicket.merchantId` -> `UserProfile.id`.

---

## Conceptual & Non-Database Relationships

The following relationships are handled by application logic rather than direct database links:

-   **Templates to Entities**: `ProductTemplate`, `EmailTemplate`, etc., act as blueprints. They are used to **create** new entities (`Product`, `Campaign`), but no persistent link is stored from the created entity back to the template.
-   **Settings Entities**: `ShippingZone`, `Location`, and `AffiliateProgramSettings` are configuration entities. They are related to other entities through application logic (e.g., an `Order`'s shipping address country determines which `ShippingZone` applies), not through stored ID references in the core business entities.
-   **Join Objects**: `OrderItem` and `PurchaseOrderItem` are not independent entities but serve as join objects within `Order` and `PurchaseOrder` respectively to create a Many-to-Many relationship with `Product`.
-   **Nested Documents**: `DeliveryNote` and `Communication` are stored as arrays within `Order` and `UserProfile` respectively, representing a nested one-to-many relationship rather than a separate collection.
