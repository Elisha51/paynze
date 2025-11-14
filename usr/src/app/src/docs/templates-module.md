# Templates Module

## Overview

The Templates module is a powerful utility layer designed to streamline and standardize content creation across the application. It provides a centralized place to manage reusable skeletons for products and various communication channels, ensuring consistency and saving time.

## Core Concepts

-   **Product Template (`ProductTemplate` type):** A pre-configured blueprint for a `Product`. It can define default values for almost any product attribute, such as its type, category, inventory tracking method, and even pre-filled variants and options (e.g., a "T-Shirt" template with "Size" and "Color" options).

-   **Communication Templates (`EmailTemplate`, `SmsTemplate`, `WhatsAppTemplate` types):** Reusable message formats for different communication channels. These templates support dynamic variables (e.g., `{{customerName}}`, `{{orderId}}`) that are replaced with real data when a message is sent.

## Key Interactions with Other Modules

### 1. Products Module

-   **Connection:** When a user creates a new `Product`, they have the option to start from a `ProductTemplate`.
-   **Impact:** Selecting a template pre-fills the product creation form with all the data defined in the template. This is particularly useful for businesses that sell many similar items, as it enforces consistency in categorization, options, and other attributes, significantly speeding up the product listing process.

### 2. Marketing Module

-   **Connection:** `Campaigns` utilize `EmailTemplate`, `SmsTemplate`, and `WhatsAppTemplate` to define their message content.
-   **Impact:** Instead of writing a new message for every campaign, merchants can select a pre-designed and pre-written template. This ensures brand consistency in marketing communications and allows for rapid deployment of new campaigns.

### 3. Orders & Notifications Module (Conceptual)

-   **Connection:** While not explicitly implemented in the mock services, a logical extension is for automated notifications (e.g., "Order Confirmation," "Order Shipped") to be powered by these templates.
-   **Potential Impact:** The system would use a specific `EmailTemplate` or `SmsTemplate` for each transactional event. This would allow merchants to easily customize the content and branding of automated messages sent to customers at various stages of the order lifecycle without needing to change any code.