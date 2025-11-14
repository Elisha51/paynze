# Settings Module

## Overview

The Settings module is the central control panel for the entire application. It is where merchants configure global settings that affect how the storefront appears, how orders are processed, how payments are handled, and how team members can interact with the system. Unlike other modules that manage day-to-day business data (like orders or products), the Settings module defines the rules and environment in which those modules operate.

## Key Configuration Areas

### 1. General & Storefront

-   **Connection:** These settings define the store's identity, including its name, logo, currency, and domain (`subdomain` or `customDomain`).
-   **Impact:** The selected currency is used for all transactions in the **Products**, **Orders**, and **Finances** modules. The storefront theme directly impacts the UI of the public-facing store, which displays data from the **Products** module.

### 2. Locations & Shipping

-   **Connection:** This area defines physical locations (warehouses, retail stores) and shipping zones with associated delivery methods and costs.
-   **Impact:**
    -   **Products Module:** Locations are used to track inventory levels (`stockByLocation`).
    -   **Orders Module:** Shipping zones and delivery methods determine the available shipping options and costs during the checkout process.
    -   **Procurement Module:** Locations are used as receiving points for `PurchaseOrders`.

### 3. Payments & Billing

-   **Connection:** Configures customer-facing payment options (e.g., Cash on Delivery, Mobile Money) and the merchant's payout accounts. It also manages the subscription plan for the platform itself.
-   **Impact:**
    -   **Orders Module:** Determines which payment methods are available to customers at checkout.
    -   **Finances Module:** Payout settings dictate where the merchant receives their funds.
    -   **Across All Modules:** The selected subscription plan can enable or disable access to entire features or modules (e.g., the Affiliate Program or advanced analytics).

### 4. Staff & Permissions

-   **Connection:** This is where `Roles` and their associated `Permissions` are defined.
-   **Impact:** This has a system-wide impact. The permissions assigned to a role dictate what a logged-in `Staff` member can view, create, edit, or delete within every other module.

### 5. Affiliate Program

-   **Connection:** Configures the rules for the **Marketing** module's affiliate program, including commission rates and payout thresholds.
-   **Impact:** Directly controls the commission calculation logic in the **Orders** module when a sale is referred by an `Affiliate`. It also determines when an affiliate is eligible for a payout in the **Finances** module.

### 6. Notifications

-   **Connection:** This section connects system events to the **Templates** module.
-   **Impact:** It allows merchants to set up automated communications. For example, an "Order Shipped" event in the **Orders** module can be configured to automatically send a specific `SmsTemplate` or `EmailTemplate` to the customer.