
'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { AffiliatesTab } from '@/components/dashboard/affiliates-tab';
import { EmailTemplatesTab } from '@/components/dashboard/email-templates-tab';
import { SmsTemplatesTab } from '@/components/dashboard/sms-templates-tab';
import { useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { campaignColumns } from '@/components/dashboard/analytics/report-columns';
import type { Campaign } from '@/lib/types';
import { getCampaigns } from '@/services/marketing';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useState(() => {
    async function loadData() {
        const campaignsData = await getCampaigns();
        setCampaigns(campaignsData);
    }
    loadData();
  });
  
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'discounts', label: 'Discounts' },
    { value: 'affiliates', label: 'Affiliates' },
  ];

  return (
    <DashboardPageLayout 
        title="Marketing"
        cta={<></>}
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
    </DashboardPageLayout>
  );
}
