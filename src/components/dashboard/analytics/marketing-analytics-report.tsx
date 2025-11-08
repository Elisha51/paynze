
'use client';
import { useMemo } from 'react';
import type { Campaign, Discount, Order } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Send, Gift, TrendingUp, BarChart, DollarSign, ShoppingCart } from 'lucide-react';
import { ChartTooltipContent, ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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

export function MarketingAnalyticsReport({ campaigns, discounts, orders, dateRange }: { campaigns: Campaign[], discounts: Discount[], orders: Order[], dateRange?: DateRange }) {

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (!dateRange?.from) return true;
      const startDate = new Date(c.startDate);
      return startDate >= dateRange.from && startDate <= (dateRange.to || new Date());
    });
  }, [campaigns, dateRange]);
  
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!dateRange?.from) return true;
      const orderDate = new Date(o.date);
      return orderDate >= dateRange.from && orderDate <= (dateRange.to || new Date());
    });
  }, [orders, dateRange]);


  const { 
    summaryMetrics,
    campaignChannelData,
    discountChartData,
   } = useMemo(() => {
    const totalReach = filteredCampaigns.reduce((sum, c) => sum + c.sent, 0);

    // Mock discount usage on orders
    const ordersWithDiscounts = filteredOrders.filter((o, i) => i % 5 === 0);
    const totalRedemptions = ordersWithDiscounts.length;
    const revenueFromDiscounts = ordersWithDiscounts.reduce((sum, o) => sum + o.total, 0);

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

    const campaignData = Object.keys(reachByChannel).map((name, index) => ({ name, sent: reachByChannel[name] }));
    
    const discountData = discounts.map((d, index) => ({ name: d.code, redemptions: d.redemptions }));
      
    return {
        summaryMetrics: {
            totalReach,
            totalRedemptions,
            bestCampaign,
            bestDiscount,
            revenueFromDiscounts,
            ordersWithDiscounts: ordersWithDiscounts.length,
        },
        campaignChannelData: campaignData,
        discountChartData: discountData
    };
  }, [filteredCampaigns, discounts, filteredOrders]);
  
  const formatCurrency = (amount: number) => {
    const currency = filteredOrders[0]?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  return (
    <div className="space-y-6">
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue from Discounts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.revenueFromDiscounts)}</div>
            <p className="text-xs text-muted-foreground">From {summaryMetrics.ordersWithDiscounts} orders in period</p>
          </CardContent>
        </Card>
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
            <p className="text-xs text-muted-foreground">Discounted orders in period</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Campaign Reach by Channel</CardTitle>
        </CardHeader>
        <CardContent className="w-full aspect-video">
            <ChartContainer config={chartConfig}>
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
                  <Bar dataKey="sent" fill="var(--color-sent)" radius={[4, 4, 0, 0]}>
                    {campaignChannelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                    ))}
                  </Bar>
              </RechartsBarChart>
            </ChartContainer>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Discount Redemptions (All Time)</CardTitle>
        </CardHeader>
        <CardContent className="w-full aspect-video">
            <ChartContainer config={chartConfig}>
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
                  <Bar dataKey="redemptions" fill="var(--color-redemptions)" radius={[4, 4, 0, 0]}>
                     {discountChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                    ))}
                  </Bar>
              </RechartsBarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
