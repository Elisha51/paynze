# Styling & Theming Guide

This guide covers how to style the application using ShadCN UI, Tailwind CSS, and `lucide-react` for icons.

## UI Components with ShadCN

This project uses [ShadCN UI](https://ui.shadcn.com/) for its component library. These are not traditional npm-installed components; instead, they are copy-pasteable components that you can own and modify.

-   **Location:** All UI components are located in `/src/components/ui/`.
-   **Adding New Components:** To add a new component from ShadCN, use the CLI:
    ```bash
    npx shadcn-ui@latest add [component-name]
    ```
-   **Customization:** Feel free to modify the component files directly in `/src/components/ui/` to meet your specific needs.

## Styling with Tailwind CSS

Styling is handled primarily with [Tailwind CSS](https://tailwindcss.com/).

-   **Utility-First:** Use Tailwind's utility classes directly in your JSX for styling (e.g., `className="p-4 bg-primary text-primary-foreground"`).
-   **Configuration:** The Tailwind configuration is located in `tailwind.config.ts`.
-   **Responsive Design:** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to build responsive layouts.

## Theming

The application's color scheme and overall theme are controlled by CSS variables defined in `/src/app/globals.css`. This approach allows for easy and consistent theming across the entire application.

### How to Change the Theme

1.  **Open `src/app/globals.css`:** This file contains the HSL color definitions for the `:root` (light mode).
2.  **Modify HSL Values:** To change a color, update its corresponding HSL (Hue, Saturation, Lightness) values. For example, to change the primary color, find the `--primary` variable and adjust its value.

    ```css
    :root {
      /* ... other variables */
      --primary: 204 90% 61%; /* Current primary color */
      /* To make it green, you might change it to: */
      --primary: 142 76% 36%;
      /* ... */
    }
    ```

3.  **Key Colors to Customize:**
    -   `--background`: The main page background color.
    -   `--foreground`: The primary text color.
    -   `--primary`: The main brand color used for buttons, links, and active states.
    -   `--secondary`: Used for less prominent elements.
    -   `--accent`: Used for highlights and secondary call-to-actions.
    -   `--destructive`: Used for error states and delete actions.
    -   `--card`: The background color of card components.
    -   `--border`: The color for borders and separators.

### Pre-built Themes

This project also includes several pre-built themes that can be applied by adding a class to the `<html>` element in `src/app/layout.tsx`. These are defined in `globals.css` and offer a quick way to change the store's look and feel.

Example pre-built themes:
- `theme-minimal-retail`
- `theme-modern-boutique`
- `theme-catalog-pro`

## Icons with Lucide React

For iconography, this project uses [`lucide-react`](https://lucide.dev/guide/packages/lucide-react).

-   **Usage:** Import icons directly from the library.
    ```tsx
    import { ShoppingCart } from 'lucide-react';

    function MyComponent() {
      return <ShoppingCart className="h-5 w-5" />;
    }
    ```
-   **Finding Icons:** Browse the full set of available icons on the [Lucide website](https://lucide.dev/).
