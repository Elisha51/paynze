# Entity Relationship Diagram (ERD) - Conceptual Model

This document outlines the conceptual relationships between the core data entities in the system. It is designed to serve as a blueprint for database schema design and backend development. Each section details an entity, its purpose, its attributes, and its relationships with other entities.

---

## Entity: Product

-   **Description**: Represents an item for sale in the store catalog. This is a central entity linked to orders, inventory, and marketing.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `productType` | `string` | The type of product (e.g., "Physical", "Digital", "Service"). |
    | `name` | `string` | The display name of the product. |
    | `shortDescription` | `string` | A brief summary for listings. |
    | `longDescription` | `string` | A detailed description for the product page (supports Markdown). |
    | `status` | `string` | The current state of the product (e.g., "draft", "published"). |
    | `images` | `(ProductImage \| File)[]` | An array of image objects or uploaded files. |
    | `videoUrl` | `string` | A URL to a promotional video. |
    | `sku` | `string` | A unique identifier for the base product. |
    | `barcode` | `string` | The product's GTIN, UPC, etc. |
    | `inventoryTracking` | `string` | The method used to track stock (e.g., "Track Quantity"). |
    | `lowStockThreshold` | `number` | The stock level at which to trigger a low stock alert. |
    | `requiresShipping` | `boolean` | Indicates if the product is physical and needs to be shipped. |
    | `weight` | `number` | The weight of the product in kilograms. |
    | `dimensions` | `object` | An object containing length, width, and height. |
    | `retailPrice` | `number` | The primary selling price. |
    | `currency` | `string` | The currency code (e.g., "UGX"). |
    | `compareAtPrice` | `number` | A higher price to show the product is on sale. |
    | `wholesalePricing` | `WholesalePrice[]` | An array of pricing tiers for different customer groups. |
    | `isTaxable` | `boolean` | Indicates if tax should be applied. |
    | `costPerItem` | `number` | The cost of acquiring the product, for profit tracking. |
    | `category` | `string` | The name of the `Category` this product belongs to. |
    | `tags` | `string[]` | An array of descriptive tags. |
    | `supplierIds` | `string[]` | An array of `Supplier` IDs. |
    | `hasVariants` | `boolean` | Indicates if the product has different options like size or color. |
    | `options` | `ProductOption[]` | An array defining the variant options. |
    | `variants` | `ProductVariant[]` | An array of all possible product variations. |
-   **Relationships**:
    -   **Product to Order**: (Many-to-Many) Implemented via the `OrderItem` join object. An Order can contain many Products, and a Product can appear in many Orders. The link is `OrderItem.sku` -> `Product.sku` or `ProductVariant.sku`.
    -   **Product to Category**: (Many-to-One) A Product belongs to one Category. The link is `Product.category` (string name) -> `Category.name`.
    -   **Product to Supplier**: (Many-to-Many) A Product can be sourced from multiple Suppliers, and a Supplier can provide multiple Products. The link is an array of IDs: `Product.supplierIds` <-> `Supplier.productsSupplied`.
    -   **Product to Campaign/Discount**: (Many-to-Many) A Product can be featured in many marketing Campaigns or be eligible for many Discounts. The link is `Campaign.applicableProductIds` or `Discount.applicableProductIds`.
    -   **Product to UserProfile (Customer)**: (Many-to-Many) A Customer can add many Products to their wishlist. The link is `UserProfile.wishlist` containing `Product.sku` values.

---

## Entity: Order

-   **Description**: Represents a customer's transaction for one or more products. It is the central record of a sale.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the order. |
    | `customerId` | `string` | The ID of the `UserProfile` (Customer) who placed the order. |
    | `customerName` | `string` | Customer's name at the time of order. |
    | `customerEmail` | `string` | Customer's email at the time of order. |
    | `date` | `string` | The ISO timestamp when the order was placed. |
    | `status` | `string` | The current fulfillment status (e.g., "Awaiting Payment", "Paid", "Shipped"). |
    | `fulfillmentMethod`| `string` | How the customer will receive the order (e.g., "Delivery", "Pickup"). |
    | `channel` | `string` | The source of the order (e.g., "Online", "Manual"). |
    | `items` | `OrderItem[]` | An array of products included in the order. |
    | `total` | `number` | The final amount paid for the order. |
    | `currency` | `string` | The currency code (e.g., "UGX"). |
    | `shippingAddress` | `object` | The customer's shipping address. |
    | `payment` | `PaymentDetails` | An object containing the payment method and status. |
    | `shippingCost` | `number` | The cost of shipping. |
    | `taxes` | `number` | The total taxes applied. |
    | `salesAgentId` | `string` | The ID of the `StaffProfile` or `Affiliate` who gets sales credit. |
    | `assignedStaffId` | `string` | The ID of the `StaffProfile` assigned to fulfill the order. |
    | `fulfilledByStaffId`| `string` | The ID of the `StaffProfile` who completed the fulfillment. |
-   **Relationships**:
    -   **Order to UserProfile (Customer)**: (Many-to-One) Many Orders can belong to a single Customer. The link is `Order.customerId` -> `UserProfile.id`.
    -   **Order to StaffProfile (Assignee)**: (Many-to-One) Many Orders can be assigned to or fulfilled by a single Staff member. The links are `Order.assignedStaffId` -> `StaffProfile.id` and `Order.fulfilledByStaffId` -> `StaffProfile.id`.
    -   **Order to StaffProfile/Affiliate (Sales Credit)**: (Many-to-One) Many Orders can be credited to a single sales agent (staff or affiliate). The link is `Order.salesAgentId` -> `StaffProfile.id` or `Affiliate.id`.
    -   **Order to Transaction**: (One-to-One, optional) A paid Order corresponds to one income `Transaction`. The link is `Transaction.orderId` -> `Order.id`.

---

## Entity: UserProfile (Customer)

-   **Description**: Represents an individual customer's profile, purchase history, and preferences.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the customer. |
    | `name` | `string` | The customer's full name. |
    | `email` | `string` | The customer's email address. |
    | `phone` | `string` | The customer's phone number. |
    | `customerGroup` | `string` | The segment the customer belongs to (e.g., "Retailer"). |
    | `lastOrderDate` | `string` | The date of the customer's most recent order. |
    | `totalSpend` | `number` | The cumulative amount of money the customer has spent. |
    | `createdAt` | `string` | The ISO timestamp when the customer profile was created. |
    | `source` | `string` | How the customer was added (e.g., "Manual", "Online"). |
    | `wishlist` | `string[]` | An array of `Product.sku` values the customer is interested in. |
    | `createdById` | `string` | The ID of the `StaffProfile` who manually created the customer. |
-   **Relationships**:
    -   **UserProfile to Order**: (One-to-Many) A Customer can have many Orders. The link is `Order.customerId` -> `UserProfile.id`.
    -   **UserProfile to StaffProfile**: (Many-to-One, optional) For manually created customers, many Customers can be created by a single Staff member. The link is `UserProfile.createdById` -> `StaffProfile.id`.
    -   **UserProfile to Product (Wishlist)**: (Many-to-Many) A Customer can have many Products in their wishlist. The link is the `UserProfile.wishlist` array of `Product.sku`s.
    -   **UserProfile to SupportTicket**: (One-to-Many) A Customer can submit many Support Tickets. The link is `SupportTicket.merchantId` -> `UserProfile.id`.

---

## Entity: StaffProfile (Staff)

-   **Description**: Represents an internal team member with specific roles and permissions.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the staff member. |
    | `name` | `string` | The staff member's full name. |
    | `email` | `string` | The email address used for logging in. |
    | `phone` | `string` | The staff member's phone number. |
    | `avatarUrl` | `string` | URL for the profile picture. |
    | `role` | `string` | The name of the assigned `Role` entity. |
    | `status` | `string` | The account status (e.g., "Active", "Pending"). |
    | `onlineStatus` | `string` | The current presence status ("Online", "Offline"). |
    | `totalCommission`| `number` | The amount of unpaid commission the staff member has earned. |
    | `payoutHistory` | `Payout[]` | A history of past commission payouts. |
    | `attributes` | `object` | A key-value store for custom data defined by the `Role`. |
-   **Relationships**:
    -   **StaffProfile to Role**: (Many-to-One) Many Staff members can share the same Role. The link is `StaffProfile.role` (string name) -> `Role.name`.
    -   **StaffProfile to Order**: (One-to-Many) A Staff member can be assigned to, fulfill, or be credited for many Orders. The links are `Order.assignedStaffId`, `Order.fulfilledByStaffId`, `Order.salesAgentId` -> `StaffProfile.id`.
    -   **StaffProfile to UserProfile (Customer)**: (One-to-Many) A Staff member can manually create many Customers. The link is `UserProfile.createdById` -> `StaffProfile.id`.
    -   **StaffProfile to Transaction**: (One-to-Many, optional) A Staff member can receive many payout Transactions. The link is `Transaction.payoutForStaffId` -> `StaffProfile.id`.

---

## Entity: PurchaseOrder

-   **Description**: A record for an inventory procurement transaction from a Supplier.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the purchase order. |
    | `supplierId` | `string` | The ID of the `Supplier` being ordered from. |
    | `supplierName` | `string` | The name of the supplier. |
    | `status` | `string` | The current state of the PO (e.g., "Draft", "Sent", "Received"). |
    | `items` | `PurchaseOrderItem[]`| An array of products being ordered. |
    | `orderDate` | `string` | The date the purchase order was created. |
    | `expectedDelivery` | `string` | The estimated delivery date. |
    | `totalCost` | `number` | The total cost of the purchase order. |
    | `currency` | `string` | The currency code for the cost. |
-   **Relationships**:
    -   **PurchaseOrder to Supplier**: (Many-to-One) Many Purchase Orders can be sent to a single Supplier. The link is `PurchaseOrder.supplierId` -> `Supplier.id`.
    -   **PurchaseOrder to Product**: (Many-to-Many) Implemented via the `PurchaseOrderItem` join object. A PO can contain many Products, and a Product can be on many POs. The link is `PurchaseOrderItem.productId` -> `Product.sku`.
    -   **PurchaseOrder to Transaction**: (One-to-One, optional) A paid Purchase Order corresponds to one expense `Transaction`. The link is `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.

---

## Entity: Supplier

-   **Description**: Represents a vendor from whom products are procured.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the supplier. |
    | `name` | `string` | The supplier's business name. |
    | `contactName` | `string` | The name of the primary contact person. |
    | `email` | `string` | The supplier's contact email. |
    | `phone` | `string` | The supplier's contact phone number. |
    | `address` | `string` | The physical address of the supplier. |
    | `productsSupplied` | `string[]` | An array of `Product.sku` values that this supplier provides. |
-   **Relationships**:
    -   **Supplier to PurchaseOrder**: (One-to-Many) A Supplier can receive many Purchase Orders. The link is `PurchaseOrder.supplierId` -> `Supplier.id`.
    -   **Supplier to Product**: (Many-to-Many) A Supplier can provide multiple Products. The link is an array of SKUs: `Supplier.productsSupplied` <-> `Product.supplierIds`.

---

## Entity: Campaign

-   **Description**: A marketing initiative, such as an SMS blast or email newsletter.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the campaign. |
    | `name` | `string` | The name of the marketing campaign. |
    | `status` | `string` | The current state (e.g., "Active", "Draft", "Completed"). |
    | `channel` | `string` | The communication channel used (e.g., "Email", "SMS"). |
    | `audience` | `string` | The target customer group for the campaign. |
    | `sent` | `number` | The number of messages sent. |
    | `openRate` | `string` | The percentage of recipients who opened the message. |
    | `ctr` | `string` | The click-through rate. |
    | `startDate` | `string` | The date the campaign begins. |
    | `applicableProductIds`| `string[]` | An array of `Product.sku` values this campaign promotes. |
    | `allowedAffiliateIds`| `string[]` | An array of `Affiliate.id` values allowed for this campaign. |
    | `banner` | `CampaignBanner` | Configuration for a promotional banner on the storefront. |
-   **Relationships**:
    -   **Campaign to Product**: (Many-to-Many) A Campaign can promote specific Products. The link is the `Campaign.applicableProductIds` array of `Product.sku`s.
    -   **Campaign to Affiliate**: (Many-to-Many) A Campaign can be restricted to specific Affiliates. The link is the `Campaign.allowedAffiliateIds` array of `Affiliate.id`s.

---

## Entity: Discount

-   **Description**: A promotional code for customers to use at checkout.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `code` | `string` | The unique code customers enter (e.g., "EID20"). |
    | `type` | `string` | The type of discount ("Percentage", "Fixed Amount", "Buy X Get Y"). |
    | `value` | `number` | The numeric value of the discount. |
    | `status` | `string` | The current state ("Active", "Expired", "Scheduled"). |
    | `redemptions` | `number` | The number of times the discount has been used. |
    | `minPurchase` | `number` | The minimum order total required to use the discount. |
    | `customerGroup`| `string` | The customer group eligible for this discount. |
    | `usageLimit` | `number \| null` | The total number of times the discount can be used. |
    | `onePerCustomer` | `boolean` | Limits use to once per customer. |
    | `applicableProductIds` | `string[]` | An array of `Product.sku` values this discount applies to. |
-   **Relationships**:
    -   **Discount to Product**: (Many-to-Many) A Discount can be restricted to specific Products. The link is the `Discount.applicableProductIds` array of `Product.sku`s.

---

## Entity: Affiliate

-   **Description**: An external marketing partner who earns commissions on referred sales.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the affiliate. |
    | `name` | `string` | The affiliate's name. |
    | `status` | `string` | The affiliate's account status ("Active", "Pending", "Suspended"). |
    | `contact` | `string` | Mobile Money or bank details for payouts. |
    | `uniqueId` | `string` | The unique code used in their referral link (e.g., `?ref=UNIQUEID`). |
    | `linkClicks` | `number` | Total clicks on the referral link. |
    | `conversions`| `number` | The total number of successful sales referred. |
    | `pendingCommission` | `number` | The total unpaid commission earned. |
    | `paidCommission` | `number` | The total commission paid out to date. |
    | `payoutHistory` | `Payout[]` | A history of past payouts. |
-   **Relationships**:
    -   **Affiliate to Order**: (One-to-Many) An Affiliate can be credited with many sales Orders. The link is `Order.salesAgentId` -> `Affiliate.id`.
    -   **Affiliate to Campaign**: (Many-to-Many) An Affiliate can participate in multiple Campaigns. The link is `Campaign.allowedAffiliateIds` containing `Affiliate.id`s.

---

## Entity: Transaction

-   **Description**: A single financial event in the ledger, representing income or expense.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | A unique identifier for the transaction. |
    | `date` | `string` | The date the transaction occurred. |
    | `description` | `string` | A description of the financial event (e.g., "Sale from Order #123"). |
    | `amount` | `number` | The value of the transaction. Positive for income, negative for expenses. |
    | `currency` | `string` | The currency of the transaction. |
    | `type` | `string` | Either "Income" or "Expense". |
    | `category` | `string` | The financial category (e.g., "Sales", "Inventory", "Salaries"). |
    | `status` | `string` | The state of the transaction ("Cleared", "Pending"). |
    | `paymentMethod` | `string` | The method of payment (e.g., "Cash", "Mobile Money"). |
    | `orderId` | `string` | Link to the `Order` if it's a sales transaction. |
    | `purchaseOrderId`| `string` | Link to the `PurchaseOrder` if it's an inventory expense. |
    | `payoutForStaffId`| `string` | Link to the `StaffProfile` if it's a commission or salary payout. |
-   **Relationships**:
    -   **Transaction to Order**: (One-to-One, optional) A sales Transaction is linked to one Order. Link: `Transaction.orderId` -> `Order.id`.
    -   **Transaction to PurchaseOrder**: (One-to-One, optional) An inventory expense Transaction is linked to one Purchase Order. Link: `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.
    -   **Transaction to StaffProfile**: (Many-to-One, optional) Many payout Transactions can be for a single Staff member. Link: `Transaction.payoutForStaffId` -> `StaffProfile.id`.

---

## Product Organization

### Entity: Category

-   **Description**: Organizes products into a hierarchy for navigation and management.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the category. |
    | `name` | `string` | The display name of the category. |
    | `parentId` | `string \| null` | The ID of the parent `Category` for creating subcategories. |
-   **Relationships**:
    -   **Category to Product**: (One-to-Many) A Category can contain many Products. The link is `Product.category` (string name) -> `Category.name`.
    -   **Category to Category (Self-referencing)**: (One-to-Many) A parent Category can have many child Categories (subcategories). The link is `Category.parentId` -> `Category.id`.

---

## Staff & Permissions

### Entity: Role

-   **Description**: Defines permissions and attributes for a staff role.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `name` | `string` | Unique name of the role (e.g., "Manager", "Agent"). |
    | `description` | `string` | A summary of the role's purpose. |
    | `permissions` | `Permissions` | An object defining CRUD permissions for each module. |
    | `assignableAttributes` | `AssignableAttribute[]`| Custom fields for staff with this role. |
    | `commissionRules` | `CommissionRule[]` | Rules for calculating commissions. |
-   **Relationships**:
    -   **Role to StaffProfile**: (One-to-Many) A Role can be assigned to many Staff members. The link is `StaffProfile.role` (string name) -> `Role.name`.

---

## Support

### Entity: SupportTicket

-   **Description**: Represents a single support request from a user.
-   **Attributes**:
    | Attribute | Type | Description |
    | --- | --- | --- |
    | `id` | `string` | Unique identifier for the support ticket. |
    | `merchantId` | `string` | The ID of the `UserProfile` (Customer) who submitted the ticket. |
    | `subject` | `string` | The subject line of the ticket. |
    | `category` | `string` | The category of the support request (e.g., "Billing"). |
    | `description` | `string` | The detailed description of the issue. |
    | `status` | `string` | The current state of the ticket (e.g., "Open", "Resolved"). |
    | `createdAt` | `string` | The ISO timestamp when the ticket was created. |
-   **Relationships**:
    -   **SupportTicket to UserProfile (Customer)**: (Many-to-One) Many Support Tickets can be submitted by a single Customer. The link is `SupportTicket.merchantId` -> `UserProfile.id`.

---

## Conceptual & Non-Database Relationships

The following relationships are handled by application logic rather than direct database links:

-   **Templates to Entities**: `ProductTemplate`, `EmailTemplate`, etc., act as blueprints. They are used to **create** new entities (`Product`, `Campaign`), but no persistent link is stored from the created entity back to the template.
-   **Settings Entities**: `ShippingZone`, `Location`, and `AffiliateProgramSettings` are configuration entities. They are related to other entities through application logic (e.g., an `Order`'s shipping address country determines which `ShippingZone` applies), not through stored ID references in the core business entities.
-   **Join Objects**: `OrderItem` and `PurchaseOrderItem` are not independent entities but serve as join objects within `Order` and `PurchaseOrder` respectively to create a Many-to-Many relationship with `Product`.
-   **Nested Documents**: `DeliveryNote` and `Communication` are stored as arrays within `Order` and `UserProfile` respectively, representing a nested one-to-many relationship rather than a separate collection.
