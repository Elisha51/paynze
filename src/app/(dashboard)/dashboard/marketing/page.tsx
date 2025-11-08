
'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { AffiliatesTab } from '@/components/dashboard/affiliates-tab';
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { campaignColumns } from '@/components/dashboard/analytics/report-columns';
import type { Campaign, Discount, Order, Affiliate } from '@/lib/types';
import { getCampaigns, getDiscounts } from '@/services/marketing';
import { getOrders } from '@/services/orders';
import { MarketingAnalyticsReport } from '@/components/dashboard/analytics/marketing-analytics-report';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Gift, Users, PlusCircle } from 'lucide-react';
import { getAffiliates } from '@/services/affiliates';
import { DiscountsTab } from '@/components/dashboard/discounts-tab';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


function MarketingOverview({ campaigns, discounts, affiliates }: { campaigns: Campaign[], discounts: Discount[], affiliates: Affiliate[] }) {
    const totalCampaigns = campaigns.length;
    const totalDiscounts = discounts.length;
    const totalAffiliates = affiliates.length;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCampaigns}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
                    <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalDiscounts}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAffiliates}</div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();


  useEffect(() => {
    async function loadData() {
        const [campaignsData, discountsData, ordersData, affiliatesData] = await Promise.all([
          getCampaigns(),
          getDiscounts(),
          getOrders(),
          getAffiliates()
        ]);
        setCampaigns(campaignsData);
        setDiscounts(discountsData);
        setOrders(ordersData);
        setAffiliates(affiliatesData.filter(a => a.status === 'Active'));
    }
    loadData();
  }, []);
  
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'discounts', label: 'Discounts' },
    { value: 'affiliates', label: 'Affiliates' },
    { value: 'analytics', label: 'Analytics' },
  ];
  
  const campaignStatusOptions = [
      { value: 'Active', label: 'Active'},
      { value: 'Scheduled', label: 'Scheduled'},
      { value: 'Draft', label: 'Draft'},
      { value: 'Completed', label: 'Completed'},
  ];
  
  const campaignChannelOptions = [
      { value: 'Email', label: 'Email'},
      { value: 'SMS', label: 'SMS'},
      { value: 'Push', label: 'Push'},
  ];

  const getCta = () => {
    if (activeTab === 'analytics') {
      return <DateRangePicker date={dateRange} setDate={setDateRange} />;
    }
    if (activeTab === 'campaigns') {
      return (
        <Button asChild>
          <Link href="/dashboard/marketing/campaigns/add"><PlusCircle className="mr-2 h-4 w-4" /> Create Campaign</Link>
        </Button>
      );
    }
    if (activeTab === 'discounts') {
      return (
         <Button asChild>
          <Link href="/dashboard/marketing/discounts/add"><PlusCircle className="mr-2 h-4 w-4" /> Create Discount</Link>
        </Button>
      );
    }
    return null;
  }

  return (
    <DashboardPageLayout 
        title="Marketing"
        cta={getCta()}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
    >
      <DashboardPageLayout.TabContent value="overview">
        <DashboardPageLayout.Content>
          <MarketingOverview campaigns={campaigns} discounts={discounts} affiliates={affiliates} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="campaigns">
        <DashboardPageLayout.Content>
            <DataTable 
                columns={campaignColumns} 
                data={campaigns} 
                filters={[
                    { columnId: 'status', title: 'Status', options: campaignStatusOptions },
                    { columnId: 'channel', title: 'Channel', options: campaignChannelOptions },
                ]}
            />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
       <DashboardPageLayout.TabContent value="discounts">
        <DashboardPageLayout.Content>
          <DiscountsTab />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
       <DashboardPageLayout.TabContent value="affiliates">
         <DashboardPageLayout.Content>
            <AffiliatesTab />
         </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="analytics">
        <DashboardPageLayout.Content>
            <MarketingAnalyticsReport campaigns={campaigns} discounts={discounts} orders={orders} dateRange={dateRange} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
