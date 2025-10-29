
'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';
import { Order } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function OverviewChart({ orders, currency }: { orders: Order[], currency: string }) {
  const salesData = useMemo(() => {
     if (orders.length === 0) return [];
    
    const dateArray = orders.map(o => new Date(o.date));
    const minDate = new Date(Math.min(...dateArray.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...dateArray.map(date => date.getTime())));
    const diffDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);

    if (diffDays <= 31) { // Group by day
      const days = eachDayOfInterval({ start: minDate, end: maxDate });
      return days.map(day => {
        const total = orders
          .filter(order => new Date(order.date).toDateString() === day.toDateString() && order.payment.status === 'completed')
          .reduce((sum, order) => sum + order.total, 0);
        return { name: format(day, 'MMM d'), total };
      });
    } else { // Group by month
      const months = eachMonthOfInterval({ start: minDate, end: maxDate });
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const total = orders
          .filter(order => {
            const orderDate = new Date(order.date);
            return order.payment.status === 'completed' && orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum, order) => sum + order.total, 0);
        return { name: format(month, 'MMM'), total };
      });
    }
  }, [orders]);

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
