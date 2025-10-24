// src/ai/flows/classify-customers.ts
'use server';
/**
 * @fileOverview A flow for classifying customers based on their purchasing patterns.
 *
 * - classifyCustomer - A function that classifies a customer based on their purchase history.
 * - ClassifyCustomerInput - The input type for the classifyCustomer function.
 * - ClassifyCustomerOutput - The return type for the classifyCustomer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyCustomerInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer to classify.'),
  purchaseHistory: z.array(
    z.object({
      productId: z.string().describe('The ID of the product purchased.'),
      quantity: z.number().describe('The quantity of the product purchased.'),
      price: z.number().describe('The price of the product.'),
      category: z.string().describe('The category of the product.'),
      timestamp: z.string().describe('The timestamp of the purchase.'),
    })
  ).describe('The purchase history of the customer.'),
});
export type ClassifyCustomerInput = z.infer<typeof ClassifyCustomerInputSchema>;

const ClassifyCustomerOutputSchema = z.object({
  customerGroup: z.string().describe('The classification of the customer (e.g., high-value, wholesale, specific interest group).'),
  reason: z.string().describe('The reason for the classification based on purchase history.'),
});
export type ClassifyCustomerOutput = z.infer<typeof ClassifyCustomerOutputSchema>;

export async function classifyCustomer(input: ClassifyCustomerInput): Promise<ClassifyCustomerOutput> {
  return classifyCustomerFlow(input);
}

const classifyCustomerPrompt = ai.definePrompt({
  name: 'classifyCustomerPrompt',
  input: {schema: ClassifyCustomerInputSchema},
  output: {schema: ClassifyCustomerOutputSchema},
  prompt: `You are an expert marketing analyst tasked with classifying customers based on their purchase history.

  Analyze the following purchase history and classify the customer into one of the following groups: high-value, wholesale, specific interest group, or default.

  Provide a brief reason for the classification.

  Purchase History:
  {{#each purchaseHistory}}
  - Product ID: {{productId}}, Quantity: {{quantity}}, Price: {{price}}, Category: {{category}}, Timestamp: {{timestamp}}
  {{/each}}
  `,
});

const classifyCustomerFlow = ai.defineFlow(
  {
    name: 'classifyCustomerFlow',
    inputSchema: ClassifyCustomerInputSchema,
    outputSchema: ClassifyCustomerOutputSchema,
  },
  async input => {
    const {output} = await classifyCustomerPrompt(input);
    return output!;
  }
);
