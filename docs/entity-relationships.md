# Entity Relationship Diagram (ERD) - Conceptual Model

This document provides a comprehensive breakdown of all data entities within the system. Each section details an entity, its full list of attributes, and its relationships with other entities, serving as a blueprint for database schema design and backend development.

---

## Core Business Entities

### Entity: Product

-   **Description**: Represents an item for sale in the store catalog. This is a central entity linked to orders, inventory, and marketing.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `productType` | `string` | The type of product (e.g., "Physical", "Digital", "Service"). |
| `name` | `string` | The display name of the product. |
| `shortDescription` | `string` | A brief summary for listings. |
| `longDescription` | `string` | A detailed description for the product page (supports Markdown). |
| `status` | `string` | The current state of the product (e.g., "draft", "published", "archived", "Pre-Order"). |
| `images` | `(ProductImage \| File)[]` | An array of image objects or uploaded files. |
| `videoUrl` | `string` | A URL to a promotional video. |
| `sku` | `string` | A unique identifier for the base product. |
| `barcode` | `string` | The product's GTIN, UPC, etc. |
| `inventoryTracking`| `string` | The method used to track stock (e.g., "Track Quantity", "Track with Serial Numbers", "Don't Track"). |
| `unitOfMeasure` | `string` | The unit for stock tracking (e.g., "kg", "m", "unit"). |
| `lowStockThreshold`| `number` | The stock level at which to trigger a low stock alert. |
| `requiresShipping` | `boolean` | Indicates if the product is physical and needs to be shipped. |
| `weight` | `number` | The weight of the product in kilograms. |
| `dimensions` | `object` | An object containing length, width, and height. |
| `digitalFile` | `File` | The downloadable file for a digital product. |
| `downloadLimit` | `number` | The number of times a digital file can be downloaded. |
| `serviceDuration` | `string` | The duration for a service product (e.g., "1 hour"). |
| `retailPrice` | `number` | The primary selling price. |
| `currency` | `string` | The currency code (e.g., "UGX"). |
| `compareAtPrice` | `number` | A higher price to show the product is on sale. |
| `wholesalePricing`| `WholesalePrice[]` | An array of pricing tiers for different customer groups. |
| `isTaxable` | `boolean` | Indicates if tax should be applied. |
| `taxClass` | `string` | The tax category for the product. |
| `costPerItem` | `number` | The cost of acquiring the product, for profit tracking. |
| `preorderSettings`| `PreorderSettings` | Settings for pre-order products, including payment type and deposit amount. |
| `category` | `string` | The name of the `Category` this product belongs to. |
| `tags` | `string[]` | An array of descriptive tags. |
| `supplierIds` | `string[]` | An array of `Supplier` IDs. |
| `collections` | `string[]` | An array of collection names this product belongs to. |
| `productVisibility`| `string[]` | Channels where the product is visible (e.g., "Online Store", "POS"). |
| `seo` | `object` | SEO settings like page title, meta description, and URL handle. |
| `hasVariants` | `boolean` | Indicates if the product has different options like size or color. |
| `options` | `ProductOption[]` | An array defining the variant options (e.g., name: "Size", values: ["S", "M"]). |
| `variants` | `ProductVariant[]` | An array of all possible product variations. |
| `templateId` | `string` | The ID of a `ProductTemplate` used to create this product. |
| `customFields` | `object` | A key-value store for any additional custom data. |

-   **Relationships**:
    -   **One-to-Many with `ProductVariant`**: `Product` contains an array of `ProductVariant` objects. A `Product` has many `ProductVariant`s.
    -   **Many-to-One with `Category`**: A `Product` belongs to one `Category`. The link is `Product.category` (string name) -> `Category.name`.
    -   **Many-to-Many with `Supplier`**: A `Product` can be sourced from multiple `Supplier`s. The link is an array of IDs: `Product.supplierIds` <-> `Supplier.productsSupplied`.
    -   **Many-to-Many with `Campaign`/`Discount`**: A `Product` can be featured in many marketing `Campaign`s or be eligible for many `Discount`s. The links are `Campaign.applicableProductIds` and `Discount.applicableProductIds`.
    -   **Many-to-Many with `UserProfile` (Customer)**: A `Customer` can add many `Product`s to their wishlist. The link is `UserProfile.wishlist` containing `Product.sku` values.
    -   **Many-to-Many with `Order`**: A `Product` can appear in many `Order`s. This is implemented via the `OrderItem` join object.
    -   **Many-to-Many with `PurchaseOrder`**: A `Product` can be on many `PurchaseOrder`s. This is implemented via the `PurchaseOrderItem` join object.

---

### Entity: Order

-   **Description**: Represents a customer's transaction for one or more products. It is the central record of a sale.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the order. |
| `customerId` | `string` | The ID of the `UserProfile` (Customer) who placed the order. |
| `customerName` | `string` | Customer's name at the time of order. |
| `customerEmail` | `string` | Customer's email at the time of order. |
| `customerPhone` | `string` | Customer's phone number at the time of order. |
| `date` | `string` | The ISO timestamp when the order was placed. |
| `status` | `string` | The current fulfillment status (e.g., "Awaiting Payment", "Paid", "Shipped"). |
| `fulfillmentMethod`| `string` | How the customer will receive the order (e.g., "Delivery", "Pickup"). |
| `channel` | `string` | The source of the order (e.g., "Online", "Manual", "POS"). |
| `items` | `OrderItem[]` | An array of products included in the order. |
| `total` | `number` | The final amount paid for the order. |
| `currency` | `string` | The currency code (e.g., "UGX"). |
| `shippingAddress` | `object` | The customer's shipping address. |
| `payment` | `PaymentDetails` | An object containing the payment method and status. |
| `shippingCost` | `number` | The cost of shipping. |
| `taxes` | `number` | The total taxes applied. |
| `salesAgentId` | `string` | The ID of the `StaffProfile` or `Affiliate` who gets sales credit. |
| `salesAgentName` | `string` | The name of the sales agent for display. |
| `assignedStaffId` | `string` | The ID of the `StaffProfile` assigned to fulfill the order. |
| `assignedStaffName` | `string` | The name of the assigned staff member for display. |
| `fulfilledByStaffId`| `string` | The ID of the `StaffProfile` who completed the fulfillment. |
| `fulfilledByStaffName`| `string` | The name of the staff member who fulfilled the order. |
| `deliveryNotes` | `DeliveryNote[]`| An array of notes made during delivery. |
| `proofOfDeliveryUrl`| `string` | A URL to an image or document for proof of delivery. |
-   **Relationships**:
    -   **Many-to-One with `UserProfile` (Customer)**: Many `Order`s can belong to a single `Customer`. The link is `Order.customerId` -> `UserProfile.id`.
    -   **Many-to-One with `StaffProfile`**: An `Order` can be associated with multiple `StaffProfile`s for different roles (sales, assignment, fulfillment). The links are `Order.salesAgentId`, `Order.assignedStaffId`, and `Order.fulfilledByStaffId` -> `StaffProfile.id`.
    -   **Many-to-One with `Affiliate`**: An `Order` can be credited to one `Affiliate`. The link is `Order.salesAgentId` -> `Affiliate.id`.
    -   **One-to-One with `Transaction`**: A paid `Order` generates one income `Transaction`. The link is `Transaction.orderId` -> `Order.id`.

---

### Entity: UserProfile (Customer)

-   **Description**: Represents an individual customer's profile, purchase history, and preferences. Also referred to as `Customer`.
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
| `currency` | `string` | The primary currency of the customer. |
| `createdAt` | `string` | The ISO timestamp when the customer profile was created. |
| `orders` | `Order[]` | An array of the customer's past orders (loaded on-demand). |
| `communications` | `Communication[]`| A log of interactions with the customer. |
| `wishlist` | `string[]` | An array of `Product.sku` values the customer is interested in. |
| `discounts` | `Discount[]` | An array of available discounts for the customer. |
| `source` | `string` | How the customer was added (e.g., "Manual", "Online"). |
| `createdById` | `string` | The ID of the `StaffProfile` who manually created the customer. |
| `createdByName` | `string` | The name of the staff member for display. |
-   **Relationships**:
    -   **One-to-Many with `Order`**: A `Customer` can have many `Order`s. The link is `Order.customerId` -> `UserProfile.id`.
    -   **Many-to-One with `StaffProfile`**: For manually created customers, many `Customer`s can be created by a single `Staff` member. The link is `UserProfile.createdById` -> `StaffProfile.id`.
    -   **Many-to-Many with `Product` (Wishlist)**: A `Customer` can have many `Product`s in their wishlist. The link is the `UserProfile.wishlist` array of `Product.sku`s.
    -   **One-to-Many with `SupportTicket`**: A `Customer` can submit many `SupportTicket`s. The link is `SupportTicket.merchantId` -> `UserProfile.id`.
    -   **One-to-Many with `Communication`**: A `Customer` can have a log of many `Communication`s.

---

### Entity: StaffProfile (Staff Member)

-   **Description**: Represents an internal team member with specific roles and permissions. Also referred to as `Staff`.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the staff member. |
| `name` | `string` | The staff member's full name. |
| `email` | `string` | The email address used for logging in. |
| `phone` | `string` | The staff member's phone number. |
| `avatarUrl` | `string` | URL for the profile picture. |
| `role` | `StaffRoleName` | The name of the assigned `Role` entity. |
| `status` | `string` | The account status (e.g., "Active", "Pending Verification"). |
| `rejectionReason` | `string` | A note on why a pending application was rejected. |
| `verificationDocuments`| `object[]` | An array of objects with `name` and `url` for verification files. |
| `lastLogin` | `string` | The ISO timestamp of the last login. |
| `onlineStatus` | `string` | The current presence status ("Online", "Offline"). |
| `assignedOrders` | `Order[]` | A list of orders currently assigned to this staff member (loaded on-demand). |
| `completionRate` | `number` | A performance metric, e.g., for deliveries. |
| `totalSales` | `number` | Total sales value attributed to this staff member. |
| `totalCommission`| `number` | The amount of unpaid commission the staff member has earned. |
| `payoutHistory` | `Payout[]` | A history of past commission payouts. |
| `bonuses` | `Bonus[]` | A history of awarded bonuses. |
| `attributes` | `object` | A key-value store for custom data defined by the `Role`. |
| `schedule` | `Shift[]` | An array defining the weekly work schedule. |
| `currency` | `string` | The currency for commissions and payouts. |
-   **Relationships**:
    -   **Many-to-One with `Role`**: Many `Staff` members can share the same `Role`. The link is `StaffProfile.role` (string name) -> `Role.name`.
    -   **One-to-Many with `Order`**: A `Staff` member can be associated with many `Order`s (as sales agent, assignee, or fulfiller).
    -   **One-to-Many with `UserProfile` (Customer)**: A `Staff` member can manually create many `Customer`s.
    -   **One-to-Many with `Transaction`**: A `Staff` member can receive many payout `Transaction`s. The link is `Transaction.payoutForStaffId` -> `StaffProfile.id`.
    -   **One-to-Many with `StaffActivity`**: A `Staff` member's actions are logged as many `StaffActivity` records.

---

## Procurement Entities

### Entity: PurchaseOrder

-   **Description**: A record for an inventory procurement transaction from a `Supplier`.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the purchase order (e.g., "PO-001"). |
| `supplierId` | `string` | The ID of the `Supplier` being ordered from. |
| `supplierName` | `string` | The name of the supplier. |
| `status` | `string` | The current state of the PO (e.g., "Draft", "Sent", "Received", "Awaiting Approval"). |
| `items` | `PurchaseOrderItem[]`| An array of products being ordered. |
| `orderDate` | `string` | The date the purchase order was created. |
| `expectedDelivery` | `string` | The estimated delivery date. |
| `totalCost` | `number` | The total cost of the purchase order. |
| `currency` | `string` | The currency code for the cost. |
| `supplierProposedChanges`| `object` | An object containing changes proposed by the supplier. |
| `supplierNotes` | `string` | Notes from the supplier regarding the order. |
| `supplierETA` | `string` | A new estimated delivery date proposed by the supplier. |
-   **Relationships**:
    -   **Many-to-One with `Supplier`**: Many `PurchaseOrder`s can be sent to a single `Supplier`. The link is `PurchaseOrder.supplierId` -> `Supplier.id`.
    -   **One-to-One with `Transaction`**: A paid `PurchaseOrder` corresponds to one expense `Transaction`. The link is `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.

### Entity: Supplier

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
    -   **One-to-Many with `PurchaseOrder`**: A `Supplier` can receive many `PurchaseOrder`s.
    -   **Many-to-Many with `Product`**: A `Supplier` can provide multiple `Product`s.

---

## Marketing Entities

### Entity: Campaign

-   **Description**: A marketing initiative, such as an SMS blast or email newsletter.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the campaign. |
| `name` | `string` | The name of the marketing campaign. |
| `status` | `string` | The current state (e.g., "Active", "Draft", "Completed", "Scheduled"). |
| `channel` | `string` | The communication channel used (e.g., "Email", "SMS", "Push"). |
| `sent` | `number` | The number of messages sent. |
| `openRate` | `string` | The percentage of recipients who opened the message. |
| `ctr` | `string` | The click-through rate. |
| `audience` | `string` | The target customer group for the campaign. |
| `startDate` | `string` | The date the campaign begins. |
| `endDate` | `string` | The date the campaign ends. |
| `description` | `string` | Internal description of the campaign's purpose. |
| `applicableProductIds`| `string[]` | An array of `Product.sku` values this campaign promotes. |
| `banner` | `CampaignBanner` | Configuration for a promotional banner on the storefront. |
| `affiliateAccess` | `string` | Controls which affiliates can use this campaign ('none', 'all', 'specific'). |
| `allowedAffiliateIds`| `string[]` | An array of `Affiliate.id` values allowed for this campaign. |
-   **Relationships**:
    -   **Many-to-Many with `Product`**: A `Campaign` can promote specific `Product`s. The link is the `Campaign.applicableProductIds` array.
    -   **Many-to-Many with `Affiliate`**: A `Campaign` can be restricted to specific `Affiliate`s. The link is the `Campaign.allowedAffiliateIds` array.

### Entity: Discount

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
| `startDate` | `string` | The date the discount becomes active. |
| `endDate` | `string` | The date the discount expires. |
| `description` | `string` | An internal description for the discount. |
| `applicableProductIds` | `string[]` | An array of `Product.sku` values this discount applies to. |
| `bogoDetails` | `BogoDetails` | Defines the rules for a 'Buy X, Get Y' discount. |
| `allowedAffiliateIds`| `string[]` | An array of `Affiliate.id` values allowed to use this discount. |
-   **Relationships**:
    -   **Many-to-Many with `Product`**: A `Discount` can be restricted to specific `Product`s. The link is the `Discount.applicableProductIds` array.

### Entity: Affiliate

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
| `totalSales` | `number` | The total sales value generated by this affiliate. |
| `pendingCommission`| `number` | The total unpaid commission earned. |
| `paidCommission` | `number` | The total commission paid out to date. |
| `payoutHistory` | `Payout[]` | A history of past payouts. |
-   **Relationships**:
    -   **One-to-Many with `Order`**: An `Affiliate` can be credited with many sales `Order`s. The link is `Order.salesAgentId` -> `Affiliate.id`.

---

## Supporting Entities

### Entity: Transaction

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
    -   **One-to-One with `Order`**: A sales `Transaction` is linked to one `Order`. Link: `Transaction.orderId` -> `Order.id`.
    -   **One-to-One with `PurchaseOrder`**: An inventory expense `Transaction` is linked to one `PurchaseOrder`. Link: `Transaction.purchaseOrderId` -> `PurchaseOrder.id`.
    -   **Many-to-One with `StaffProfile`**: Many payout `Transaction`s can be for a single `Staff` member. Link: `Transaction.payoutForStaffId` -> `StaffProfile.id`.

### Entity: Category

-   **Description**: Organizes products into a hierarchy for navigation and management. This entity powers the "Categories" tab in the Products module.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the category. |
| `name` | `string` | The display name of the category. |
| `parentId` | `string \| null` | The ID of the parent `Category` for creating subcategories. |
-   **Relationships**:
    -   **One-to-Many with `Product`**: A `Category` can contain many `Product`s. The link is `Product.category` -> `Category.name`.
    -   **One-to-Many with `Category` (Self-referencing)**: A parent `Category` can have many child `Category`s (subcategories). The link is `Category.parentId` -> `Category.id`.

### Entity: Role

-   **Description**: Defines permissions and attributes for a staff role, governing access control across the entire application.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `name` | `StaffRoleName` | Unique name of the role (e.g., "Manager", "Agent"). |
| `description` | `string` | A summary of the role's purpose. |
| `permissions` | `Permissions` | An object defining CRUD permissions for each module. |
| `assignableAttributes` | `AssignableAttribute[]`| Custom fields for staff with this role. |
| `commissionRules` | `CommissionRule[]` | Rules for calculating commissions. |
-   **Relationships**:
    -   **One-to-Many with `StaffProfile`**: A `Role` can be assigned to many `Staff` members. The link is `StaffProfile.role` -> `Role.name`.

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
    -   **Many-to-One with `UserProfile` (Customer)**: Many `SupportTicket`s can be submitted by a single `Customer`. The link is `SupportTicket.merchantId` -> `UserProfile.id`.

### Entity: Location

-   **Description**: Represents a physical location like a warehouse or store where inventory is held.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the location. |
| `name` | `string` | The name of the location (e.g., "Main Warehouse"). |
| `address` | `string` | The physical address of the location. |
| `isPickupLocation`| `boolean` | Indicates if customers can pick up orders from here. |
| `isDefault` | `boolean` | Indicates if this is the default location for new stock. |
-   **Relationships**:
    -   This is a configuration entity. It is linked to `ProductVariant`s via the `stockByLocation` array, where the `locationName` string should match a `Location.name`.

### Entity: ShippingZone

-   **Description**: Defines a geographical area for specific shipping rates.
-   **Attributes**:
| Attribute | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the zone. |
| `name` | `string` | The name of the zone (e.g., "Domestic", "East Africa"). |
| `countries` | `string[]` | An array of country names included in this zone. |
| `deliveryMethods`| `DeliveryMethod[]`| An array of available delivery options for this zone. |
-   **Relationships**:
    -   This is a configuration entity. It is linked to `Order`s through application logic, where an `Order.shippingAddress.country` is used to determine the applicable zone and available `deliveryMethods`.

---

## Conceptual & Non-Database Relationships

-   **Templates**: `ProductTemplate`, `EmailTemplate`, etc., are blueprints. They are used to **create** new entities (`Product`, `Campaign`), but no persistent link is stored from the created entity back to the template (except for `Product.templateId` for reference).
-   **Join/Embedded Objects**: `OrderItem`, `PurchaseOrderItem`, `ProductVariant`, `WholesalePrice`, `DeliveryNote`, and `Communication` are not independent entities but exist as arrays within their parent objects (`Order`, `PurchaseOrder`, `Product`, and `UserProfile` respectively).
-   **Settings Entities**: `AffiliateProgramSettings` and `OnboardingFormData` are stored as single JSON objects (e.g., in `localStorage` for this mock app) and are not relational database entities. They provide global configuration that influences the behavior of other entities.
