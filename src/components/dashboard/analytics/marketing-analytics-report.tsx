
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
import { DateRange } from 'react-day-picker';

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

export function MarketingAnalyticsReport({ campaigns, discounts, dateRange }: { campaigns: Campaign[], discounts: Discount[], dateRange?: DateRange }) {

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (!dateRange?.from) return true;
      const startDate = new Date(c.startDate);
      return startDate >= dateRange.from && startDate <= (dateRange.to || new Date());
    });
  }, [campaigns, dateRange]);


  const { 
    summaryMetrics,
    campaignChannelData,
    discountChartData,
   } = useMemo(() => {
    const totalReach = filteredCampaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalRedemptions = discounts.reduce((sum, d) => sum + d.redemptions, 0); // Note: Discounts aren't filtered by date in mock data
    
    const bestCampaign = [...filteredCampaigns]
        .filter(c => c.status === 'Completed' || c.status === 'Active')
        .sort((a,b) => parseFloat(b.ctr) - parseFloat(a.ctr))[0];

    const bestDiscount = [...discounts]
        .sort((a,b) => b.redemptions - a.redemptions)[0];

    const reachByChannel = filteredCampaigns.reduce((acc, c) => {
        if (!acc[c.channel]) {
            acc[c.channel] = 0;
        }
        acc[c.channel] += c.sent;
        return acc;
    }, {} as Record<string, number>);

    const campaignData = Object.entries(reachByChannel).map(([name, sent]) => ({ name, sent }));
    
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
  }, [filteredCampaigns, discounts]);

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
            <p className="text-xs text-muted-foreground">Messages sent in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Redemptions</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalRedemptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total coupons used (all time)</p>
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
            <p className="text-xs text-muted-foreground">{summaryMetrics.bestDiscount?.redemptions.toLocaleString() || 0} redemptions (all time)</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Campaign Reach by Channel</CardTitle>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="w-full aspect-video">
              <RechartsBarChart data={campaignChannelData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
        <CardContent>
            <ChartContainer config={chartConfig} className="w-full aspect-video">
              <RechartsBarChart data={discountChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
