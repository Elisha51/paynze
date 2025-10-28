
'use client';
import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

type DailySummaryProps = {
    transactions: Transaction[];
};

export function DailySummary({ transactions }: DailySummaryProps) {

    const dailySummaries = useMemo(() => {
        const groups = transactions.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), 'yyyy-MM-dd');
            if (!acc[date]) {
                acc[date] = {
                    date: transaction.date,
                    transactions: [],
                    income: 0,
                    expense: 0,
                };
            }
            acc[date].transactions.push(transaction);
            if (transaction.type === 'Income') {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expense += transaction.amount; // amount is negative for expenses
            }
            return acc;
        }, {} as Record<string, { date: string, transactions: Transaction[], income: number, expense: number }>);
        
        return Object.values(groups).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);
    
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No transactions recorded yet.</p>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Settlement Summary</CardTitle>
                <CardDescription>A day-by-day breakdown of your financial activities.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {dailySummaries.map((summary) => {
                        const netTotal = summary.income + summary.expense;
                        return (
                            <AccordionItem value={summary.date} key={summary.date}>
                                <AccordionTrigger>
                                    <div className="flex justify-between items-center w-full pr-4">
                                        <div className="text-left">
                                            <p className="font-semibold text-lg">{format(new Date(summary.date), 'PPP')}</p>
                                            <p className="text-sm text-muted-foreground">{summary.transactions.length} transactions</p>
                                        </div>
                                        <div className="flex gap-4 text-right">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Income</p>
                                                <p className="font-semibold text-green-600">{formatCurrency(summary.income, 'UGX')}</p>
                                            </div>
                                             <div>
                                                <p className="text-xs text-muted-foreground">Expenses</p>
                                                <p className="font-semibold text-red-600">{formatCurrency(Math.abs(summary.expense), 'UGX')}</p>
                                            </div>
                                             <div>
                                                <p className="text-xs text-muted-foreground">Net</p>
                                                <p className={cn("font-bold", netTotal >= 0 ? 'text-green-700' : 'text-red-700')}>{formatCurrency(netTotal, 'UGX')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
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
                                                    <TableCell>
                                                        <Badge variant={t.type === 'Income' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                                                            {t.type === 'Income' ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>}
                                                            {t.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{t.category}</TableCell>
                                                    <TableCell className={cn("text-right font-mono", t.type === 'Income' ? 'text-green-600' : 'text-red-600')}>
                                                        {formatCurrency(t.amount, t.currency)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                 </Accordion>
            </CardContent>
        </Card>
    )
}
