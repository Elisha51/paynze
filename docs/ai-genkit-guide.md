# AI & Genkit Integration Guide

This guide explains how to build, test, and integrate Generative AI features into the application using Google's Genkit framework.

## Core Concepts

-   **Genkit:** A framework from Google designed to help developers build, deploy, and manage production-grade AI-powered features.
-   **Flow:** A server-side function that orchestrates a series of steps in an AI task. For example, a flow might take a product name, call a language model to generate a description, and return the result in a structured format. Flows are the primary way the application's frontend interacts with the AI backend.
-   **Prompt:** A template that defines the instructions sent to a language model (LLM). In this project, we use Handlebars templating within prompts to dynamically insert data.
-   **Zod Schemas:** We use Zod to define strongly-typed schemas for the inputs and outputs of our AI flows. This ensures data consistency, provides validation, and enables structured data generation from the LLM.
-   **Developer UI:** Genkit includes a built-in developer UI for inspecting, running, and tracing AI flows, making development and debugging much more efficient.

## File Structure

All Genkit-related code is located in the `/src/ai/` directory:

-   **/src/ai/genkit.ts**: Initializes and configures the global Genkit instance and plugins.
-   **/src/ai/flows/**: Each file in this directory defines a single, self-contained AI flow (e.g., `suggest-product-descriptions.ts`).
-   **/src/ai/dev.ts**: The entry point for running the Genkit Developer UI.

## Creating a New AI Flow

Follow these steps to add a new AI-powered feature.

### 1. Define the Flow File

Create a new file in `/src/ai/flows/`, for example, `your-flow-name.ts`.

### 2. Add the 'use server' Directive

All flow files must start with the `'use server';` directive. This marks them as server-side code that can be securely called from client components (React Server Components).

```typescript
'use server';
```

### 3. Define Input and Output Schemas with Zod

Define the expected input and the desired output structures using Zod. This provides type safety and tells the LLM what kind of data to return.

```typescript
import { z } from 'genkit';

export const YourFlowInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  // Add other input fields as needed
});
export type YourFlowInput = z.infer<typeof YourFlowInputSchema>;

export const YourFlowOutputSchema = z.object({
  suggestion: z.string().describe('The AI-generated suggestion.'),
  // Add other output fields as needed
});
export type YourFlowOutput = z.infer<typeof YourFlowOutputSchema>;
```

### 4. Create the Prompt

Use `ai.definePrompt()` to create a prompt template.

-   **`name`**: A unique name for your prompt.
-   **`model`**: Specify the language model to use (e.g., `googleai/gemini-pro`).
-   **`input` & `output`**: Reference the Zod schemas you just created.
-   **`prompt`**: Write the instructions for the LLM. Use Handlebars syntax `{{{variableName}}}` to insert data from your input schema.

```typescript
import { ai } from '@/ai/genkit';

const yourPrompt = ai.definePrompt({
  name: 'yourPromptName',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: YourFlowInputSchema },
  output: { schema: YourFlowOutputSchema },
  prompt: `You are a marketing expert. Generate a suggestion for the product: {{{productName}}}.`,
});
```

### 5. Define the Flow

Use `ai.defineFlow()` to wrap your prompt in a flow. This makes it available to the Genkit system and your application. The flow takes the input, calls the prompt, and returns the structured output.

```typescript
const yourFlow = ai.defineFlow(
  {
    name: 'yourFlowName',
    inputSchema: YourFlowInputSchema,
    outputSchema: YourFlowOutputSchema,
  },
  async (input) => {
    const { output } = await yourPrompt(input);
    return output!;
  }
);
```

### 6. Create and Export a Wrapper Function

Finally, create and export an `async` wrapper function that calls the flow. This is the function your Next.js components will import and call.

```typescript
export async function generateSuggestion(input: YourFlowInput): Promise<YourFlowOutput> {
  return yourFlow(input);
}
```

### 7. Register the Flow

To make your new flow accessible in the Genkit Developer UI, import it in `/src/ai/dev.ts`:

```typescript
// src/ai/dev.ts
import './flows/your-flow-name.ts';
// Add other flows here
```

## Testing with the Genkit Developer UI

The Genkit Dev UI is the best way to test and debug your flows.

1.  **Start the Dev UI:**
    ```bash
    npm run genkit:watch
    ```
2.  **Access the UI:** Open your browser to `http://localhost:4000`.
3.  **Select Your Flow:** Find your flow in the list on the left.
4.  **Provide Input:** Use the JSON editor to provide input that matches your `YourFlowInputSchema`.
5.  **Run and Inspect:** Click "Run" to execute the flow. You can inspect the input, output, and see a detailed trace of the execution, including the exact prompt sent to the LLM.