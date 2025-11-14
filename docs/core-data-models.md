# Core Data Models

This document provides a high-level overview of the main data structures used throughout the application. For the definitive source of truth and full list of fields, please refer to `src/lib/types.ts`.

## Product

The `Product` object is the foundation of the catalog, representing any item the business sells.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | The unique identifier for the product, often a SKU. |
| `name` | `string` | The display name of the product. |
| `description` | `string` | Detailed information about the product. |
| `retailPrice` | `number` | The primary selling price for a single unit. |
| `variants` | `ProductVariant[]` | An array of product versions, such as different sizes or colors, each with its own SKU, price, and inventory. |
| `inventoryTracking` | `string` | The method used to track stock (e.g., "Track Quantity", "Don't Track"). |
| `category` | `string` | The category the product belongs to (e.g., "Apparel", "Fabrics"). |
| `status` | `string` | The current state of the product listing (e.g., "published", "draft"). |

---

## Order

The `Order` object is the central record for any sales transaction.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | A unique identifier for the order. |
| `customerId` | `string` | The ID of the customer who placed the order. |
| `items` | `OrderItem[]` | An array of products included in the order. |
| `total` | `number` | The final amount paid for the order. |
| `status` | `string` | The current state of the order (e.g., "Awaiting Payment", "Paid", "Shipped"). |
| `fulfillmentMethod` | `string` | How the customer will receive the order (e.g., "Delivery", "Pickup"). |
| `payment` | `PaymentDetails` | An object containing the payment method and status. |
| `assignedStaffId` | `string` | The ID of the staff member assigned to fulfill the order. |

---

## Customer

The `Customer` object represents an individual who has interacted with or purchased from the store.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | The unique identifier for the customer. |
| `name` | `string` | The customer's full name. |
| `email` | `string` | The customer's email address. |
| `phone` | `string` | The customer's phone number. |
| `customerGroup`| `string` | The segment the customer belongs to (e.g., "Retailer", "Wholesaler"). |
| `totalSpend` | `number` | The cumulative amount of money the customer has spent. |
| `orders` | `Order[]` | A history of the customer's past orders. |

---

## Staff

The `Staff` object represents an internal team member who uses the business dashboard.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | The unique identifier for the staff member. |
| `name` | `string` | The staff member's full name. |
| `email` | `string` | The email address used for logging in. |
| `role` | `string` | The assigned role, which dictates their permissions (e.g., "Admin", "Manager", "Agent"). |
| `status` | `string` | The current status of the staff member's account (e.g., "Active", "Pending"). |
| `totalCommission`| `number` | The amount of unpaid commission the staff member has earned. |

---

## Transaction (Finances)

The `Transaction` object is a single entry in the financial ledger, representing either income or an expense.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | A unique identifier for the transaction. |
| `date` | `string` | The date the transaction occurred. |
| `description` | `string` | A description of the financial event (e.g., "Sale from Order #123"). |
| `amount` | `number` | The value of the transaction. Positive for income, negative for expenses. |
| `type` | `string` | Either "Income" or "Expense". |
| `category` | `string` | The financial category (e.g., "Sales", "Inventory", "Salaries"). |

---

## Campaign (Marketing)

The `Campaign` object represents a marketing initiative, such as an SMS blast or email newsletter.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | A unique identifier for the campaign. |
| `name` | `string` | The name of the marketing campaign. |
| `status` | `string` | The current state (e.g., "Active", "Draft", "Completed"). |
| `channel` | `string` | The communication channel used (e.g., "Email", "SMS"). |
| `audience` | `string` | The target customer group for the campaign. |
| `startDate` | `string` | The date the campaign begins. |

---

## Discount (Marketing)

The `Discount` object represents a promotional code that customers can use at checkout.

| Key Field | Type | Description |
| --- | --- | --- |
| `code` | `string` | The unique code customers enter (e.g., "EID20"). |
| `type` | `string` | The type of discount ("Percentage", "Fixed Amount", "Buy X Get Y"). |
| `value` | `number` | The numeric value of the discount. |
| `status` | `string` | The current state ("Active", "Expired", "Scheduled"). |
| `minPurchase` | `number` | The minimum order total required to use the discount. |
| `customerGroup`| `string` | The customer group eligible for this discount. |

---

## Affiliate (Marketing)

The `Affiliate` object represents an external marketing partner who earns commissions on referred sales.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | A unique identifier for the affiliate. |
| `name` | `string` | The affiliate's name. |
| `uniqueId` | `string` | The unique code used in their referral link (e.g., `?ref=UNIQUEID`). |
| `status` | `string` | The affiliate's account status ("Active", "Pending", "Suspended"). |
| `pendingCommission` | `number` | The total unpaid commission earned. |
| `conversions`| `number` | The total number of successful sales referred. |

---

## Supplier (Procurement)

The `Supplier` object represents a vendor from whom products are purchased.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | A unique identifier for the supplier. |
| `name` | `string` | The supplier's business name. |
| `contactName` | `string` | The name of the primary contact person. |
| `email` | `string` | The supplier's contact email. |
| `productsSupplied` | `string[]` | An array of product SKUs that this supplier provides. |

---

## Purchase Order (Procurement)

The `PurchaseOrder` is the primary record for an inventory procurement transaction.

| Key Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | A unique identifier for the purchase order (e.g., "PO-001"). |
| `supplierId` | `string` | The ID of the supplier being ordered from. |
| `items` | `PurchaseOrderItem[]` | An array of products being ordered. |
| `totalCost` | `number` | The total cost of the purchase order. |
| `status` | `string` | The current state of the order (e.g., "Draft", "Sent", "Received"). |
| `orderDate` | `string` | The date the purchase order was created. |
