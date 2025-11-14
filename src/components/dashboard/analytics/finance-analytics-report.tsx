
'use client';
import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { ChartTooltipContent, ChartConfig, ChartContainer } from '@/components/ui/chart';
import { DataTable } from '@/components/dashboard/data-table';
import { transactionsColumns } from './report-columns';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--chart-2))',
  },
  expense: {
    label: 'Expense',
    color: 'hsl(var(--chart-5))',
  },
  Sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
  Services: { label: 'Services', color: 'hsl(var(--chart-2))' },
  Inventory: { label: 'Inventory', color: 'hsl(var(--chart-3))' },
  Utilities: { label: 'Utilities', color: 'hsl(var(--chart-4))' },
  Salaries: { label: 'Salaries', color: 'hsl(var(--chart-5))' },
  Marketing: { label: 'Marketing', color: 'hsl(var(--chart-1))' },
  Other: { label: 'Other', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export function FinanceAnalyticsReport({ transactions, dateRange }: { transactions: Transaction[], dateRange?: DateRange }) {

  const reportData = useMemo(() => {
    return transactions.filter(transaction => {
        if (!dateRange?.from) return true;
        const transactionDate = new Date(transaction.date);
        return transactionDate >= dateRange.from && transactionDate <= (dateRange.to || new Date());
    });
  }, [transactions, dateRange]);

  const { summaryMetrics, chartData, incomeByCategory, expenseByCategory } = useMemo(() => {
    const currency = reportData.length > 0 ? reportData[0].currency : 'UGX';

    if (reportData.length === 0) {
      return { 
        summaryMetrics: { grossIncome: 0, totalExpenses: 0, netProfit: 0, currency },
        chartData: [],
        incomeByCategory: [],
        expenseByCategory: [],
      };
    }
    
    const grossIncome = reportData.filter(t => t.type === 'Income').reduce((sum, row) => sum + row.amount, 0);
    const totalExpenses = reportData.filter(t => t.type === 'Expense').reduce((sum, row) => sum + row.amount, 0); // Expenses are negative
    const netProfit = grossIncome + totalExpenses;
    
    const dataByDate: {[key: string]: { date: string, income: number, expense: number }} = {};
    reportData.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dataByDate[date]) {
            dataByDate[date] = { date, income: 0, expense: 0 };
        }
        if (t.type === 'Income') {
            dataByDate[date].income += t.amount;
        } else {
            dataByDate[date].expense += Math.abs(t.amount);
        }
    });

    const formattedChartData = Object.values(dataByDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const incomeData = reportData.filter(t => t.type === 'Income').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const expenseData = reportData.filter(t => t.type === 'Expense').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
    }, {} as Record<string, number>);

    return {
      summaryMetrics: {
        grossIncome,
        totalExpenses: Math.abs(totalExpenses),
        netProfit,
        currency,
      },
      chartData: formattedChartData,
      incomeByCategory: Object.entries(incomeData).map(([name, value]) => ({ name, value, fill: `var(--color-${name})` })),
      expenseByCategory: Object.entries(expenseData).map(([name, value]) => ({ name, value, fill: `var(--color-${name})` })),
    };
  }, [reportData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: summaryMetrics.currency }).format(amount);
  };
  
  const formatCurrencyForChart = (value: number) => {
    if (value === 0) return '0';
    if (Math.abs(value) >= 1000000) return `${formatCurrency(value / 1000000).replace(/(\.00|,00)/, '')}M`;
    if (Math.abs(value) >= 1000) return `${formatCurrency(value / 1000).replace(/(\.00|,00)/, '')}k`;
    return formatCurrency(value);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.grossIncome)}</div>
            <p className="text-xs text-muted-foreground">Total revenue received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Total money spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.netProfit)}</div>
            <p className="text-xs text-muted-foreground">Income minus expenses</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Income vs. Expenses</CardTitle>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="aspect-video">
              <BarChart data={chartData} barGap={4}>
                  <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                  />
                  <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrencyForChart(value)}
                  />
                  <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                          indicator="dot"
                      />}
                  />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Income by Category</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="mx-auto aspect-square">
                    <PieChart>
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                hideLabel
                                formatter={(value) => formatCurrency(value as number)}
                            />}
                        />
                        <Pie
                            data={incomeByCategory}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {incomeByCategory.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="mx-auto aspect-square">
                    <PieChart>
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                hideLabel
                                formatter={(value) => formatCurrency(value as number)}
                            />}
                        />
                        <Pie
                            data={expenseByCategory}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {expenseByCategory.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Transactions in Period</CardTitle>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={transactionsColumns}
                data={reportData}
            />
        </CardContent>
      </Card>
    </div>
  );
}
