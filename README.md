# Next.js E-commerce & Business Management Starter

This is a comprehensive starter kit built with Next.js and Firebase, designed to provide a robust foundation for an all-in-one e-commerce and business management platform. It was bootstrapped using Firebase Studio.

## Tech Stack

This project is built on a modern, scalable, and developer-friendly stack:

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (from Google)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore & Authentication)
-   **Progressive Web App (PWA):** Enabled with `@ducanh2912/next-pwa` for offline capabilities.

## Getting Started

Follow these steps to get the project running on your local machine.

### 1. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the `.env.example` file (if it exists) or creating it from scratch. You will need to populate this with your Firebase project configuration keys.

```bash
cp .env.example .env
```

Your `.env` file will need your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## Project Structure

The project follows a standard Next.js App Router structure:

-   **/src/app/**: Contains all the application routes.
    -   **/src/app/(dashboard)/**: Routes for the main business management dashboard (e.g., `/dashboard/orders`).
    -   **/src/app/(storefront)/**: Routes for the public-facing customer store (e.g., `/store`, `/product/[sku]`).
    -   **/src/app/api/**: API routes, including webhooks.
-   **/src/components/**: Reusable React components, organized by feature (dashboard, storefront, ui, etc.).
-   **/src/context/**: Global React context providers (e.g., `AuthContext`, `CartContext`).
-   **/src/ai/**: Contains all Genkit-related code for generative AI features.
    -   **/src/ai/flows/**: Defines the AI flows that orchestrate calls to language models.
-   **/src/firebase/**: Firebase configuration and helper files for the current implementation.
-   **/src/lib/**: Utility functions, type definitions, and mock data.
-   **/src/services/**: Mock data services that simulate database interactions.
-   **/docs/**: Markdown documentation for the project's architecture and modules.

## Key Concepts

### AI with Genkit

This project uses **Genkit** to integrate generative AI features.

-   **Flows (`src/ai/flows/`):** These are server-side functions that define a series of steps for an AI task, such as generating a product description or classifying a customer.
-   **Zod Schemas:** Inputs and outputs for AI flows are strongly typed using Zod, ensuring data consistency.
-   **Developer UI:** You can inspect, run, and trace your AI flows using the Genkit developer UI, typically available at `http://localhost:4000` when running `genkit:watch`.

### Backend Integration

-   **Configuration:** The current backend implementation uses Firebase. Configuration settings are centralized in `src/firebase/config.ts`.
-   **Authentication:** User authentication is managed via `src/context/auth-context.tsx`, which handles both merchant (Staff) and customer logins.
-   **Data Model:** The `backend.json` file in the `/docs` directory serves as a blueprint for the application's data structure, independent of the database used. **It is not a live representation** but is used as a reference for code generation and understanding the intended data schema.

### Styling

The UI is built with ShadCN components and styled with Tailwind CSS.

-   **Theme:** Global styles and CSS variables for theming are located in `src/app/globals.css`.
-   **Customization:** To customize the theme, modify the HSL color variables in `globals.css` and adjust the Tailwind configuration in `tailwind.config.ts`.

### Offline Capabilities (PWA)

The application is configured as a Progressive Web App, enabling it to work offline and be "installed" on devices. This is managed by the configuration in `next.config.ts`. Cached assets and navigation fallbacks ensure a smooth user experience even without a stable internet connection.
