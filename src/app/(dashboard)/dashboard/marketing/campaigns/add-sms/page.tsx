'use client';

import { CampaignForm } from '@/components/dashboard/campaign-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddSmsCampaignPage() {
  return (
    <DashboardPageLayout title="Create SMS Campaign" backHref="/dashboard/marketing?tab=campaigns">
        <CampaignForm channel="SMS" />
    </DashboardPageLayout>
  );
}
