

import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { DataService } from './data-service';

const mockTransactions: Transaction[] = [
    { id: 'TRN-001', date: '2024-07-25', description: 'Sale from Order #ORD-002', amount: 160000, type: 'Income', category: 'Sales', status: 'Cleared', paymentMethod: 'Cash' },
    { id: 'TRN-002', date: '2024-07-25', description: 'Sale from Order #ORD-001', amount: 75000, type: 'Income', category: 'Sales', status: 'Cleared', paymentMethod: 'Mobile Money' },
    { id: 'TRN-003', date: '2024-07-24', description: 'Sale from Order #ORD-003', amount: 10000, type: 'Income', category: 'Sales', status: 'Cleared', paymentMethod: 'Mobile Money' },
    { id: 'TRN-004', date: '2024-07-24', description: 'Purchase Order #PO-002 Payment', amount: -1300000, type: 'Expense', category: 'Inventory', status: 'Pending', paymentMethod: 'Bank Transfer' },
    { id: 'TRN-005', date: '2024-07-23', description: 'Monthly Utilities', amount: -150000, type: 'Expense', category: 'Utilities', status: 'Cleared', paymentMethod: 'Mobile Money' },
    { id: 'TRN-006', date: '2024-07-23', description: 'Sale from Order #ORD-005', amount: 75000, type: 'Income', category: 'Sales', status: 'Pending', paymentMethod: 'Cash' },

];

const transactionService = new DataService<Transaction>('transactions', () => mockTransactions);

export async function getTransactions(): Promise<Transaction[]> {
    const transactions = await transactionService.getAll();
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = { ...transaction, id: `TRN-${Date.now()}` };
    await transactionService.create(newTransaction, { prepend: true });
    return newTransaction;
}
