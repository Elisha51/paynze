# Marketing Module

## Overview

The Marketing module provides the tools to promote products, engage customers, and drive sales. It encompasses promotional campaigns, discount management, and an affiliate program.

## Core Concepts

-   **Campaign (`Campaign` type):** Represents a marketing initiative, like an email newsletter or SMS blast. Campaigns can be targeted to specific `CustomerGroups` and can be associated with promotional banners on the storefront.

-   **Discount (`Discount` type):** A code that customers can use to get a percentage off, a fixed amount off, or "Buy X, Get Y" offers. Discounts can be restricted to certain customer groups, products, or have usage limits.

-   **Affiliate (`Affiliate` type):** A partner or influencer who promotes the store in exchange for a commission on referred sales. Each affiliate gets a unique referral link.

## Key Interactions with Other Modules

### 1. Customers Module

-   **Connection:** `Campaigns` and `Discounts` can be targeted to specific `CustomerGroups` (e.g., "Wholesaler", "VIP").
-   **Impact:** The system checks a customer's `customerGroup` to determine their eligibility for certain discounts or marketing communications.

### 2. Products Module

-   **Connection:** `Discounts` can be configured to apply only to specific `Products` or entire product categories.
-   **Impact:** The storefront and checkout process validates cart items against discount rules to determine eligibility. `Campaigns` can also feature specific products in banners or messages.

### 3. Orders Module

-   **Connection:** When an order is created with an affiliate referral code (`?ref=UNIQUEID`), the order is linked to the `Affiliate` via `salesAgentId`.
-   **Impact:** When a referred order is successfully paid for, the `handleCommission` function is triggered to calculate the affiliate's commission based on the rules in the affiliate program settings. This updates the `pendingCommission` on the `Affiliate` object.
