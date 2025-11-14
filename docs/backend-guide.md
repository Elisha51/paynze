# Backend & Data Integration Guide

This document explains the backend architecture, focusing on how data is structured, managed, and secured. While the current implementation uses Firebase (Firestore and Firebase Authentication), the principles described here are designed to be adaptable.

## Core Backend Components

The backend is responsible for two primary functions:

1.  **Authentication:** Managing user identity (merchants, staff, customers, affiliates) and controlling access to the system.
2.  **Database:** Persisting all application data, such as products, orders, and customer profiles.

## The `backend.json` Blueprint

A critical file in this project is `docs/backend.json`. It is essential to understand its purpose:

-   **It is a BLUEPRINT, not a live config file:** This file is an Intermediate Representation (IR) that describes the *intended* structure of the database and its data entities. It defines the "shape" of our data (the schema).
-   **It has NO direct effect on the backend:** Modifying this file does **not** automatically provision, deploy, or change cloud resources.
-   **It is the Source of Truth for Code Generation:** This file is used as a static reference to ensure consistency when generating code that interacts with the backend. It ensures that both frontend components and backend services agree on the same data structures.

### Structure of `backend.json`

-   **`entities`**: This section defines all the core data models (like `Product`, `Customer`, `Order`) using JSON Schema. This is the "what"—the abstract definition of our data objects.
-   **`firestore`**: This section maps the abstract entities to concrete database locations (collections and documents). This is the "where." For example, it specifies that documents matching the `UserProfile` entity should be stored in the `/users/{userId}` collection.

## Authentication

-   **Providers:** User identity is managed through Firebase Authentication, supporting providers like Email/Password and Google Sign-In.
-   **Roles & Permissions:** Once authenticated, a user's capabilities are determined by the `Role` assigned to them (e.g., "Admin", "Manager", "Agent"). Permissions for each role are defined in the **Settings** module of the dashboard. The backend security rules enforce these permissions, ensuring users can only access the data and perform the actions allowed by their role.

## Database (Firestore)

-   **Data Model:** Firestore is used as the primary database. It's a NoSQL, document-based database. The structure is defined by the collections mapped in `backend.json`.
-   **Client-Side SDK:** All data fetching and mutations happen on the client-side using the Firebase SDK. There is no traditional backend server with API endpoints for CRUD operations.
-   **Security Rules:** Data access is not controlled by API endpoints but by **Firestore Security Rules**. These rules are a critical part of the backend. They live in `firestore.rules` and define who can read, write, or delete data in any given path. For example, a rule might state that a user can only read their own `Order` document.