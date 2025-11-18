# Entity Relationship Diagram (ERD) - Conceptual Model

This document outlines the conceptual relationships between the core data entities in the system. It is designed to serve as a blueprint for database schema design and backend development. While the current implementation may use a NoSQL database (Firestore), this model describes the relational logic that the application code must enforce.

## Key Components

*   **Entities:** The real-world objects or concepts about which data is stored, such as "Customer" or "Product".
*   **Attributes:** The properties or characteristics of an entity, such as a "Customer" having a "name" or "email". The key attributes for establishing relationships are the ID fields (e.g., `customerId`).
*   **Relationships:** The associations between two or more entities, such as a "Customer" placing an "Order".
*   **Cardinality:** A measure of the number of instances of one entity that can be associated with an instance of another entity. This can be one-to-one, one-to-many, or many-to-many.

---

## Core Business Relationships

### Customers & Orders

*   **Entities**: `Customer`, `Order`
*   **Attributes**: `Order.customerId` links to `Customer.id`.
*   **Relationship**: A `Customer` places an `Order`.
*   **Cardinality**: **One-to-Many** (A `Customer` can have many `Order` records; an `Order` belongs to exactly one `Customer`).

### Orders & Products

*   **Entities**: `Order`, `Product`
*   **Attributes**: `Order.items` is an array of `OrderItem`. `OrderItem.sku` links to `ProductVariant.sku` or `Product.sku`.
*   **Relationship**: An `Order` contains many `Product` variants.
*   **Cardinality**: **Many-to-Many** (An `Order` can contain multiple `Product`s; a `Product` can be in many `Order`s). This is implemented via the `OrderItem` join table/object.

### Customers & Products (Wishlist)

*   **Entities**: `Customer`, `Product`
*   **Attributes**: `Customer.wishlist` is an array of `Product.sku` values.
*   **Relationship**: A `Customer` can wishlist a `Product`.
*   **Cardinality**: **Many-to-Many** (A `Customer` can have many `Product`s in their wishlist; a `Product` can be wishlisted by many `Customer`s).

---

## Staff & Roles Relationships

### Staff & Roles

*   **Entities**: `Staff`, `Role`
*   **Attributes**: `Staff.role` (string) stores the `name` of the `Role`.
*   **Relationship**: A `Staff` member is assigned a `Role`.
*   **Cardinality**: **Many-to-One** (Many `Staff` members can have the same `Role`; each `Staff` member has exactly one `Role`).

### Staff & Order Fulfillment

*   **Entities**: `Staff`, `Order`
*   **Attributes**:
    *   `Order.assignedStaffId` links to `Staff.id`.
    *   `Order.fulfilledByStaffId` links to `Staff.id`.
*   **Relationship**: A `Staff` member is assigned to fulfill an `Order`.
*   **Cardinality**: **One-to-Many** (A `Staff` member can be assigned to or fulfill many `Order`s; an `Order` is assigned to one `Staff` member at a time).

### Staff & Order Sales Credit

*   **Entities**: `Staff` (as Sales Agent), `Affiliate`, `Order`
*   **Attributes**: `Order.salesAgentId` links to `Staff.id` or `Affiliate.id`.
*   **Relationship**: A `Staff` member or `Affiliate` is credited with a sale.
*   **Cardinality**: **One-to-Many** (A `Staff`/`Affiliate` can be credited with many `Order`s; an `Order` is credited to at most one agent).

### Staff & Customer Creation

*   **Entities**: `Staff`, `Customer`
*   **Attributes**: `Customer.createdById` links to `Staff.id`.
*   **Relationship**: A `Staff` member manually creates a `Customer` profile.
*   **Cardinality**: **One-to-Many** (A `Staff` member can create many `Customer`s; a manually created `Customer` is created by one `Staff` member).

---

## Product & Catalog Relationships

### Product Organization

*   **Entities**: `Product`, `Category`
*   **Attributes**: `Product.category` (string) stores the `name` of the `Category`.
*   **Relationship**: A `Product` belongs to a `Category`.
*   **Cardinality**: **Many-to-One** (Many `Product`s can be in one `Category`; each `Product` belongs to one `Category`).

*   **Entities**: `Category` (self-referencing)
*   **Attributes**: `Category.parentId` links to another `Category.id`.
*   **Relationship**: A `Category` can be a subcategory of another `Category`.
*   **Cardinality**: **One-to-Many** (A parent `Category` can have many child `Category` records; a child `Category` has one parent).

---

## Procurement Relationships

### Purchase Orders & Suppliers

*   **Entities**: `PurchaseOrder`, `Supplier`
*   **Attributes**: `PurchaseOrder.supplierId` links to `Supplier.id`.
*   **Relationship**: A `PurchaseOrder` is sent to a `Supplier`.
*   **Cardinality**: **One-to-Many** (A `Supplier` can receive many `PurchaseOrder`s; a `PurchaseOrder` is from one `Supplier`).

### Purchase Orders & Products

*   **Entities**: `PurchaseOrder`, `Product`
*   **Attributes**: `PurchaseOrder.items` is an array of `PurchaseOrderItem`. `PurchaseOrderItem.productId` links to `Product.sku`.
*   **Relationship**: A `PurchaseOrder` contains `Product`s to be procured.
*   **Cardinality**: **Many-to-Many** (A `PurchaseOrder` can contain multiple `Product`s; a `Product` can be on many `PurchaseOrder`s). Implemented via the `PurchaseOrderItem` join object.

### Suppliers & Products

*   **Entities**: `Supplier`, `Product`
*   **Attributes**: `Supplier.productsSupplied` is an array of `Product.sku` values. `Product.supplierIds` is an array of `Supplier.id` values.
*   **Relationship**: A `Supplier` provides a `Product`.
*   **Cardinality**: **Many-to-Many** (A `Supplier` can supply many `Product`s; a `Product` can be sourced from many `Supplier`s).

---

## Marketing Relationships

### Campaigns & Products

*   **Entities**: `Campaign`, `Product`
*   **Attributes**: `Campaign.applicableProductIds` is an array of `Product.sku` values.
*   **Relationship**: A `Campaign` can promote specific `Product`s.
*   **Cardinality**: **Many-to-Many** (A `Campaign` can apply to many `Product`s; a `Product` can be in many `Campaign`s).

### Discounts & Products

*   **Entities**: `Discount`, `Product`
*   **Attributes**: `Discount.applicableProductIds` is an array of `Product.sku` values.
*   **Relationship**: A `Discount` can be restricted to specific `Product`s.
*   **Cardinality**: **Many-to-Many** (A `Discount` can apply to many `Product`s; a `Product` can have many `Discount`s).

### Campaigns & Affiliates

*   **Entities**: `Campaign`, `Affiliate`
*   **Attributes**: `Campaign.allowedAffiliateIds` is an array of `Affiliate.id` values.
*   **Relationship**: A `Campaign` can be restricted for use by specific `Affiliate`s.
*   **Cardinality**: **Many-to-Many** (A `Campaign` can be available to many `Affiliate`s; an `Affiliate` can participate in many `Campaign`s).

---

## Financial Relationships

*   **Entities**: `Transaction`, `Order`
*   **Attributes**: `Transaction.orderId` links to `Order.id`.
*   **Relationship**: A `Transaction` records the payment for an `Order`.
*   **Cardinality**: **One-to-One** (optional) (An `Order` has one corresponding sales `Transaction`; a `Transaction` can be linked to one `Order`).

*   **Entities**: `Transaction`, `PurchaseOrder`
*   **Attributes**: `Transaction.purchaseOrderId` links to `PurchaseOrder.id`.
*   **Relationship**: A `Transaction` records the expense for a `PurchaseOrder`.
*   **Cardinality**: **One-to-One** (optional) (A `PurchaseOrder` has one corresponding expense `Transaction`).

*   **Entities**: `Transaction`, `Staff`
*   **Attributes**: `Transaction.payoutForStaffId` links to `Staff.id`.
*   **Relationship**: A `Transaction` records a payout (commission/salary) to a `Staff` member.
*   **Cardinality**: **Many-to-One** (optional) (Many payout `Transaction`s can be linked to one `Staff` member).

---

## Support & Communication Relationships

*   **Entities**: `SupportTicket`, `Customer`
*   **Attributes**: `SupportTicket.merchantId` links to `Customer.id`.
*   **Relationship**: A `Customer` submits a `SupportTicket`.
*   **Cardinality**: **Many-to-One** (A `Customer` can submit many `SupportTicket`s; a `SupportTicket` belongs to one `Customer`).

*   **Entities**: `Communication`, `Customer`
*   **Attributes**: A `Communication` object is stored within a `Customer`'s record. A `threadId` can link a `Communication` to another `Communication`.
*   **Relationship**: A `Communication` is a record of an interaction with a `Customer`.
*   **Cardinality**: **One-to-Many** (nested) (A `Customer` can have many `Communication` records).

*   **Entities**: `DeliveryNote`, `Order`
*   **Attributes**: `DeliveryNote` objects are stored within an `Order`'s `deliveryNotes` array.
*   **Relationship**: A `DeliveryNote` is a log entry for an `Order`'s delivery process.
*   **Cardinality**: **One-to-Many** (nested) (An `Order` can have many `DeliveryNote`s).

---

## Conceptual & Non-Database Relationships

The following relationships are handled by application logic rather than direct database links:

*   **Templates to Entities**: `ProductTemplate`, `EmailTemplate`, etc., act as blueprints. They are used to **create** new entities (`Product`, `Campaign`), but no persistent link is stored from the created entity back to the template.
*   **Settings Entities**: `ShippingZone`, `Location`, and `AffiliateProgramSettings` are configuration entities. They are related to other entities through application logic (e.g., an `Order`'s shipping address country determines which `ShippingZone` applies), not through stored ID references in the core business entities.
