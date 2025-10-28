
'use client';

import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

interface DailySummaryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function DailySummary({ transactions, isLoading }: DailySummaryProps) {

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  const dailySummaries = useMemo(() => {
    return Object.entries(groupedTransactions).map(([date, dailyTransactions]) => {
      const income = dailyTransactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dailyTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const currency = dailyTransactions[0]?.currency || 'UGX';

      return {
        date,
        income,
        expenses,
        net: income + expenses,
        transactions: dailyTransactions,
        currency,
      };
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [groupedTransactions]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  if (isLoading) {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <div className="flex gap-4">
                           <Skeleton className="h-5 w-1/4" />
                           <Skeleton className="h-5 w-1/4" />
                           <Skeleton className="h-5 w-1/4" />
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    )
  }

  if (dailySummaries.length === 0) {
    return (
        <Card>
            <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Transactions Recorded</h3>
                <p className="mt-1 text-sm text-muted-foreground">Once you start making sales or adding expenses, your daily summaries will appear here.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {dailySummaries.map(summary => (
        <AccordionItem value={summary.date} key={summary.date} className="border-none">
            <Card>
                <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex-1 text-left space-y-1">
                        <h3 className="font-semibold text-lg">{format(new Date(summary.date), 'PPP')}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Income: <span className="font-medium text-green-600">{formatCurrency(summary.income, summary.currency)}</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Expenses: <span className="font-medium text-red-600">{formatCurrency(Math.abs(summary.expenses), summary.currency)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Wallet className="h-4 w-4" />
                                Net: <span className="font-semibold text-primary">{formatCurrency(summary.net, summary.currency)}</span>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summary.transactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell><Badge variant={t.type === 'Income' ? 'default' : 'secondary'}>{t.type}</Badge></TableCell>
                                    <TableCell>{t.category}</TableCell>
                                    <TableCell className={`text-right font-mono ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount, t.currency)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </AccordionContent>
            </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
