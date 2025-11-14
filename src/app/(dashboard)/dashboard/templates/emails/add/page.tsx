
'use client';
import { EmailTemplateForm } from "@/components/dashboard/email-template-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function AddEmailTemplatePage() {
    return (
        <DashboardPageLayout title="Create Email Template" backHref="/dashboard/templates?tab=email-templates">
             <EmailTemplateForm />
        </DashboardPageLayout>
    );
}
