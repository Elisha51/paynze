'use server';
/**
 * @fileOverview A flow for reconciling financial transactions against a bank statement.
 * 
 * - reconcileTransactions - A function that matches recorded transactions with a bank statement.
 * - ReconciliationInput - The input type for the function.
 * - ReconciliationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Transaction } from '@/lib/types';

const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.enum(['Income', 'Expense']),
  category: z.string(),
  status: z.string(),
  paymentMethod: z.string(),
});

const ReconciliationInputSchema = z.object({
  statement: z.string().describe('The full text content of the bank or mobile money statement.'),
  recordedTransactions: z.array(TransactionSchema).describe('An array of transactions already recorded in the system for the specified period.'),
});

export type ReconciliationInput = z.infer<typeof ReconciliationInputSchema>;

const MatchedTransactionSchema = z.object({
  statementDetails: z.string().describe("The relevant line item from the statement."),
  transactionId: z.string().describe("The ID of the matched transaction from the user's records."),
  confidence: z.enum(['High', 'Medium', 'Low']).describe('The confidence level of the match.'),
  reason: z.string().describe("The reason for the match (e.g., matching amounts and close dates).")
});

const UnmatchedItemSchema = z.object({
  details: z.string().describe("The details of the unmatched transaction from the statement or user records."),
  reason: z.string().describe("A brief explanation of why this might be unmatched (e.g., 'Possible bank fee', 'Transaction may not have cleared yet').")
});

const ReconciliationOutputSchema = z.object({
  matchedTransactions: z.array(MatchedTransactionSchema).describe("Transactions that appear in both the statement and the user's records."),
  unmatchedStatementItems: z.array(UnmatchedItemSchema).describe("Transactions that are on the statement but not in the user's records."),
  unmatchedUserItems: z.array(UnmatchedItemSchema).describe("Transactions that are in the user's records but not on the statement.")
});

export type ReconciliationOutput = z.infer<typeof ReconciliationOutputSchema>;

export async function reconcileTransactions(input: ReconciliationInput): Promise<ReconciliationOutput> {
  return reconcileTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reconcileTransactionsPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: ReconciliationInputSchema },
  output: { schema: ReconciliationOutputSchema },
  prompt: `You are an expert accountant AI specializing in financial reconciliation for small businesses.
  Your task is to meticulously compare a provided bank/mobile money statement with a list of user-recorded transactions for a specific period.
  
  Carefully analyze both lists and categorize them into three groups:
  1.  **Matched Transactions**: Identify pairs of transactions that correspond to each other. A match can be based on amount, date proximity, and description hints. Pay attention to the paymentMethod in the user's records to help guide your matching. Assign a confidence level (High, Medium, Low) for each match.
  2.  **Unmatched Statement Items**: List all items from the bank statement that have no corresponding entry in the user's records. Suggest a possible reason (e.g., 'Bank Fee', 'Unrecorded Sale', 'ATM Withdrawal').
  3.  **Unmatched User Items**: List all items from the user's records that do not appear on the statement for this period. Suggest a possible reason (e.g., 'Pending transaction', 'Cash payment not banked', 'Transaction cleared in a different period').

  Use the provided JSON schemas for the output. Be meticulous, accurate, and provide clear reasoning.

  **Bank/Mobile Money Statement:**
  ---
  {{{statement}}}
  ---

  **User's Recorded Transactions for the Period:**
  ---
  {{#each recordedTransactions}}
  - ID: {{id}}, Date: {{date}}, Amount: {{amount}} {{currency}}, Desc: {{description}}, Method: {{paymentMethod}}
  {{/each}}
  ---
  `,
});

const reconcileTransactionsFlow = ai.defineFlow(
  {
    name: 'reconcileTransactionsFlow',
    inputSchema: ReconciliationInputSchema,
    outputSchema: ReconciliationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
