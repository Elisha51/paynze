'use client';

import { CampaignForm } from '@/components/dashboard/campaign-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddWhatsAppCampaignPage() {
  return (
    <DashboardPageLayout title="Create WhatsApp Campaign" backHref="/dashboard/marketing?tab=campaigns">
        <CampaignForm channel="WhatsApp" />
    </DashboardPageLayout>
  );
}
