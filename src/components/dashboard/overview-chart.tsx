'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { salesData } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={salesData}>
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
          tickFormatter={(value) => `KES ${value / 1000}k`}
        />
        <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
