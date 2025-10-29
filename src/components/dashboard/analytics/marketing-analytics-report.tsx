
'use client';
import { useMemo } from 'react';
import type { Campaign, Discount } from '@/app/dashboard/marketing/page';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Send, Gift, TrendingUp, BarChart } from 'lucide-react';
import { ChartTooltipContent, ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip } from 'recharts';

const chartConfig = {
  reach: {
    label: 'Reach',
    color: 'hsl(var(--primary))',
  },
  redemptions: {
    label: 'Redemptions',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function MarketingAnalyticsReport({ campaigns, discounts }: { campaigns: Campaign[], discounts: Discount[] }) {

  const { 
    summaryMetrics,
    campaignChannelData,
    discountChartData,
   } = useMemo(() => {
    const totalReach = campaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalRedemptions = discounts.reduce((sum, d) => sum + d.redemptions, 0);
    
    const bestCampaign = [...campaigns]
        .filter(c => c.status === 'Completed' || c.status === 'Active')
        .sort((a,b) => parseFloat(b.ctr) - parseFloat(a.ctr))[0];

    const bestDiscount = [...discounts]
        .sort((a,b) => b.redemptions - a.redemptions)[0];

    const reachByChannel = campaigns.reduce((acc, c) => {
        if (!acc[c.channel]) {
            acc[c.channel] = 0;
        }
        acc[c.channel] += c.sent;
        return acc;
    }, {} as Record<string, number>);

    const campaignData = Object.entries(reachByChannel).map(([name, reach]) => ({ name, reach }));
    
    const discountData = discounts.map(d => ({ name: d.code, redemptions: d.redemptions }));
      
    return {
        summaryMetrics: {
            totalReach,
            totalRedemptions,
            bestCampaign,
            bestDiscount
        },
        campaignChannelData: campaignData,
        discountChartData: discountData
    };
  }, [campaigns, discounts]);

  return (
    <div className="space-y-6">
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marketing Reach</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total messages sent across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Redemptions</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalRedemptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total coupons used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performing Campaign</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{summaryMetrics.bestCampaign?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">By Click-Through Rate ({summaryMetrics.bestCampaign?.ctr || '0%'})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Discount</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{summaryMetrics.bestDiscount?.code || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{summaryMetrics.bestDiscount?.redemptions.toLocaleString() || 0} redemptions</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Campaign Reach by Channel</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <RechartsBarChart data={campaignChannelData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
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
                  <Bar dataKey="reach" fill="var(--color-reach)" radius={[4, 4, 0, 0]} />
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
              <RechartsBarChart data={discountChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
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
