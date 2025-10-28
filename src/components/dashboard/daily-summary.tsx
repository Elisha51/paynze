
'use client';
import { useMemo, useState } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


type DailySummaryProps = {
    transactions: Transaction[];
};

export function DailySummary({ transactions }: DailySummaryProps) {
    const [daysToShow, setDaysToShow] = useState(5);

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
    
    const visibleSummaries = dailySummaries.slice(0, daysToShow);

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
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Daily Settlement Summary</CardTitle>
                    <CardDescription>A day-by-day breakdown of your financial activities.</CardDescription>
                </div>
                <div className="w-[180px]">
                    <Select value={String(daysToShow)} onValueChange={(v) => setDaysToShow(Number(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Show days..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">Last 5 days</SelectItem>
                            <SelectItem value="10">Last 10 days</SelectItem>
                            <SelectItem value="20">Last 20 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {visibleSummaries.map((summary) => {
                        const netTotal = summary.income + summary.expense;
                        return (
                            <AccordionItem value={summary.date} key={summary.date}>
                                <div className="flex justify-between items-center w-full hover:bg-muted/50 rounded-md">
                                    <AccordionTrigger className="flex-1 py-4 px-4 hover:no-underline">
                                        <div className="text-left">
                                            <p className="font-semibold text-lg">{format(new Date(summary.date), 'PPP')}</p>
                                            <p className="text-sm text-muted-foreground">{summary.transactions.length} transactions</p>
                                        </div>
                                    </AccordionTrigger>
                                     <div className="flex items-center gap-4 text-right pr-4">
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                                                <DropdownMenuItem>Mark as Reconciled</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
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
