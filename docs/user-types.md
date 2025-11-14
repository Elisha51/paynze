# User Types & Roles

This document outlines the different types of users that interact with the application, each with distinct roles and levels of access.

## 1. Merchant (Admin)

The **Merchant** is the primary owner and administrator of the entire system.

-   **Onboarding:** This is the user who goes through the initial sign-up and setup process.
-   **Access:** They have full `Admin` privileges, granting them complete access to all modules in the dashboard, including sensitive areas like **Settings**, **Billing**, and **Staff Management**.
-   **Identity:** Within the data structure, the initial merchant is simply the first `Staff` member created with the "Admin" role.

### Key Routes & Access:
-   **Initial Sign Up:** `/signup`
-   **Onboarding Wizard:** `/get-started`
-   **Login:** `/login`
-   **Main Dashboard:** `/dashboard`

## 2. Staff

A **Staff** member is an internal user invited by the Merchant or a Manager to help run the business.

-   **Access:** Their access is controlled by the `Role` they are assigned (e.g., "Manager", "Sales Agent", "Agent"). Roles are defined in **Settings > Staff & Permissions**.
-   **Functionality:** They log in through the main `/login` page and interact with the dashboard according to their permissions. They can be assigned to orders, track their own tasks, and earn commissions based on rules set in their `Role`.
-   **Distinction from Affiliates:** Staff are considered internal team members, distinct from external marketing affiliates.

### Key Routes & Access:
-   **Login:** `/login`
-   **Dashboard:** `/dashboard/*` (access to modules is permission-dependent)
-   **Personal Tasks:** `/dashboard/my-tasks`
-   **Profile Settings:** `/dashboard/my-profile`

## 3. Affiliate

An **Affiliate** is an external partner who promotes the store in exchange for a commission.

-   **Onboarding:** They sign up through a public-facing form and must be approved by a Merchant in the dashboard.
-   **Access:** Affiliates do **not** have access to the main business dashboard. They have their own separate, simplified dashboard where they can view their unique referral link, track clicks, see referred sales, and monitor their commission earnings.
-   **Interaction:** Their primary connection to the system is through referral links (`?ref=UNIQUEID`). When a customer makes a purchase using this link, the resulting `Order` is attributed to the affiliate, and commission is calculated.

### Key Routes & Access:
-   **Public Sign Up:** `/affiliate-signup`
-   **Affiliate Login:** `/affiliate-login`
-   **Affiliate Dashboard:** `/affiliate/dashboard`

## 4. Customer

A **Customer** is an end-user who shops on the public-facing storefront.

-   **Onboarding:** They can browse the store as a guest, or they can create an account.
-   **Access:** Customers have no access to the business dashboard. If they are logged in, they have access to a personal account section where they can view their order history, manage their profile, and see their wishlist.
-   **Interaction:** They interact with the **Products** module by viewing items, the **Orders** module by making purchases, and the **Customers** module by having a profile that tracks their purchase history and group status.

### Key Routes & Access:
-   **Storefront Home:** `/store`
-   **Product Pages:** `/store/product/[sku]`
-   **Shopping Cart & Checkout:** `/checkout`
-   **Login/Sign Up:** `/store/login`, `/store/signup`
-   **Personal Account:** `/store/account/*`
    -   Profile: `/store/account`
    -   Orders: `/store/account/orders`
    -   Wishlist: `/store/account/wishlist`
    -   Vouchers: `/store/account/discounts`
    -   Notifications: `/store/account/notifications`