
'use client';
import { SmsTemplateForm } from "@/components/dashboard/sms-template-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function AddSmsTemplatePage() {
    return (
        <DashboardPageLayout title="Create SMS Template" backHref="/dashboard/templates?tab=sms-templates">
            <SmsTemplateForm />
        </DashboardPageLayout>
    );
}
