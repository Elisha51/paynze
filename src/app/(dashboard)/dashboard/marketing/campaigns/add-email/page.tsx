'use client';

import { CampaignForm } from '@/components/dashboard/campaign-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddEmailCampaignPage() {
  return (
    <DashboardPageLayout title="Create Email Campaign" backHref="/dashboard/marketing?tab=campaigns">
        <CampaignForm channel="Email" />
    </DashboardPageLayout>
  );
}
