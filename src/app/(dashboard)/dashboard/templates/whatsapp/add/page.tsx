
'use client';
import { WhatsAppTemplateForm } from "@/components/dashboard/whatsapp-template-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function AddWhatsAppTemplatePage() {
    return (
        <DashboardPageLayout title="Create WhatsApp Template" backHref="/dashboard/templates?tab=whatsapp-templates">
            <WhatsAppTemplateForm />
        </DashboardPageLayout>
    );
}
