
'use client';
import { useMemo } from 'react';
import type { Campaign, Discount } from '@/app/dashboard/marketing/page';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Gift, TrendingUp, BarChart, Users } from 'lucide-react';
import { ChartTooltipContent, ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip } from 'recharts';

const chartConfig = {
  sent: {
    label: 'Sent',
    color: 'hsl(var(--primary))',
  },
  redemptions: {
    label: 'Redemptions',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function MarketingAnalyticsReport({ campaigns, discounts }: { campaigns: Campaign[], discounts: Discount[] }) {

  const { campaignChartData, discountChartData } = useMemo(() => {
    const campaignData = campaigns
      .filter(c => c.status === 'Completed' || c.status === 'Active')
      .map(c => ({ name: c.name, sent: c.sent }));

    const discountData = discounts
      .map(d => ({ name: d.code, redemptions: d.redemptions }));
      
    return { campaignChartData: campaignData, discountChartData: discountData };
  }, [campaigns, discounts]);

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Campaign Reach</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <RechartsBarChart data={campaignChartData}>
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
                      allowDecimals={false}
                  />
                  <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="sent" fill="var(--color-sent)" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ChartContainer>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Discount Redemptions</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <RechartsBarChart data={discountChartData}>
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
                      allowDecimals={false}
                  />
                  <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
