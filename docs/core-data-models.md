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
