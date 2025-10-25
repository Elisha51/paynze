
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

let transactions: Transaction[] = [
    { id: 'TRN-001', date: format(new Date(), 'yyyy-MM-dd'), description: 'Sale from Order #ORD-001', amount: 75000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Cleared' },
    { id: 'TRN-002', date: '2024-07-14', description: 'Purchase Order #PO-002', amount: -1300000, currency: 'UGX', type: 'Expense', category: 'Inventory', status: 'Pending' },
    { id: 'TRN-003', date: '2024-07-14', description: 'Sale from Order #ORD-002', amount: 35000, currency: 'UGX', type: 'Income', category: 'Sales', status: 'Cleared' },
];

export async function getTransactions(): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...transactions];
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTransaction: Transaction = { ...transaction, id: `TRN-${Date.now()}` };
    transactions.unshift(newTransaction);
    return newTransaction;
}
