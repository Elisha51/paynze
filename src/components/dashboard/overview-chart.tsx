
'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';
import { Order } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function OverviewChart({ orders }: { orders: Order[] }) {
  const salesData = useMemo(() => {
    const now = new Date();
    const last12Months = eachMonthOfInterval({
      start: subMonths(now, 11),
      end: now,
    });
    
    const monthlySales = last12Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const total = orders
        .filter(order => {
          const orderDate = new Date(order.date);
          return order.paymentStatus === 'Paid' && orderDate >= monthStart && orderDate <= monthEnd;
        })
        .reduce((sum, order) => sum + order.total, 0);

      return {
        name: format(month, 'MMM'),
        total,
      };
    });

    return monthlySales;
  }, [orders]);

  const currency = orders.length > 0 ? orders[0].currency : 'UGX';

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${currency} ${value / 1000000}M`;
    if (value >= 1000) return `${currency} ${value / 1000}k`;
    return `${currency} ${value}`;
  }

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart data={salesData} accessibilityLayer>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => formatYAxis(value)}
        />
        <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value as number)} />}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
