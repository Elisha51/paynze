// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting product descriptions based on product name and category.
 *
 * - `suggestProductDescription` - A function that suggests a product description.
 * - `SuggestProductDescriptionInput` - The input type for the `suggestProductDescription` function.
 * - `SuggestProductDescriptionOutput` - The output type for the `suggestProductDescription` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product.'),
});

export type SuggestProductDescriptionInput = z.infer<typeof SuggestProductDescriptionInputSchema>;

const SuggestProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A suggested description for the product.'),
});

export type SuggestProductDescriptionOutput = z.infer<typeof SuggestProductDescriptionOutputSchema>;

export async function suggestProductDescription(input: SuggestProductDescriptionInput): Promise<SuggestProductDescriptionOutput> {
  return suggestProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProductDescriptionPrompt',
  input: {schema: SuggestProductDescriptionInputSchema},
  output: {schema: SuggestProductDescriptionOutputSchema},
  prompt: `You are an expert e-commerce product description writer.

  Based on the product name and category provided, generate a compelling and informative product description.

  Product Name: {{{productName}}}
  Category: {{{category}}}

  Description:`, // Requesting just the description
});

const suggestProductDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestProductDescriptionFlow',
    inputSchema: SuggestProductDescriptionInputSchema,
    outputSchema: SuggestProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
