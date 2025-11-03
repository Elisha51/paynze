
'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { AffiliatesTab } from '@/components/dashboard/affiliates-tab';
import { EmailTemplatesTab } from '@/components/dashboard/email-templates-tab';
import { SmsTemplatesTab } from '@/components/dashboard/sms-templates-tab';
import { useState } from 'react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const tabs = [
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'affiliates', label: 'Affiliates' },
    { value: 'discounts', label: 'Discounts' },
    { value: 'templates', label: 'Automations' },
  ];

  const filterTabs = [
      { value: 'email', label: 'Email Templates' },
      { value: 'sms', label: 'SMS Templates' }
  ];

  return (
    <DashboardPageLayout 
        title="Marketing"
        cta={<></>}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
    >
      <DashboardPageLayout.TabContent value="campaigns">
        <DashboardPageLayout.Content>
          <p>Campaigns content coming soon.</p>
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="affiliates">
         <DashboardPageLayout.Content>
            <AffiliatesTab />
         </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
       <DashboardPageLayout.TabContent value="discounts">
        <DashboardPageLayout.Content>
          <p>Discounts content coming soon.</p>
        </DashboardPageLayout.Content>
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="templates">
         <DashboardPageLayout.FilterTabs filterTabs={filterTabs} defaultValue="email">
            <DashboardPageLayout.TabContent value="email">
                <EmailTemplatesTab />
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="sms">
                <SmsTemplatesTab />
            </DashboardPageLayout.TabContent>
         </DashboardPageLayout.FilterTabs>
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
