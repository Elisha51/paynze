
'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { AffiliatesTab } from '@/components/dashboard/affiliates-tab';
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { campaignColumns } from '@/components/dashboard/analytics/report-columns';
import type { Campaign, Discount, Order } from '@/lib/types';
import { getCampaigns, getDiscounts } from '@/services/marketing';
import { getOrders } from '@/services/orders';
import { MarketingAnalyticsReport } from '@/components/dashboard/analytics/marketing-analytics-report';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();


  useEffect(() => {
    async function loadData() {
        const [campaignsData, discountsData, ordersData] = await Promise.all([
          getCampaigns(),
          getDiscounts(),
          getOrders()
        ]);
        setCampaigns(campaignsData);
        setDiscounts(discountsData);
        setOrders(ordersData);
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

  return (
    <DashboardPageLayout 
        title="Marketing"
        cta={activeTab === 'analytics' ? <DateRangePicker date={dateRange} setDate={setDateRange} /> : <></>}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
    >
      <DashboardPageLayout.TabContent value="overview">
        <DashboardPageLayout.Content>
          <p>Marketing overview coming soon.</p>
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="campaigns">
        <DashboardPageLayout.Content>
            <DataTable columns={campaignColumns} data={campaigns} />
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
       <DashboardPageLayout.TabContent value="discounts">
        <DashboardPageLayout.Content>
          <p>Discounts content coming soon.</p>
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
