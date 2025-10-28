

import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

let transactions: Transaction[] = [
    { id: 'TRN-001', date: '2024-07-25', description: 'Cash Sale from Order #ORD-002', amount: 160000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Cleared' },
    { id: 'TRN-002', date: '2024-07-25', description: 'Mobile Money Sale from Order #ORD-001', amount: 75000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Cleared' },
    { id: 'TRN-003', date: '2024-07-24', description: 'Mobile Money Sale from Order #ORD-003', amount: 10000, currency: 'KES', type: 'Income', category: 'Sales', status: 'Cleared' },
    { id: 'TRN-004', date: '2024-07-24', description: 'Purchase Order #PO-002 Payment', amount: -1300000, currency: 'UGX', type: 'Expense', category: 'Inventory', status: 'Pending' },
    { id: 'TRN-005', date: '2024-07-23', description: 'Monthly Utilities', amount: -150000, currency: 'UGX', type: 'Expense', category: 'Utilities', status: 'Cleared' },
    { id: 'TRN-006', date: '2024-07-23', description: 'Cash Sale from Order #ORD-005', amount: 75000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Pending' },

];

export async function getTransactions(): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTransaction: Transaction = { ...transaction, id: `TRN-${Date.now()}` };
    transactions.unshift(newTransaction);
    return newTransaction;
}
