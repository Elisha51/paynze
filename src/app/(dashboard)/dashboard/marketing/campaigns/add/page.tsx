'use client';

import { CampaignForm } from '@/components/dashboard/campaign-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddCampaignPage() {
  return (
    <DashboardPageLayout title="Create New Campaign" backHref="/dashboard/marketing?tab=campaigns">
        <CampaignForm />
    </DashboardPageLayout>
  );
}
