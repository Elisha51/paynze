
'use client';
import { WhatsAppTemplateForm } from "@/components/dashboard/whatsapp-template-form";
import { getWhatsAppTemplates } from "@/services/templates";
import type { WhatsAppTemplate } from "@/lib/types";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function EditWhatsAppTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const [template, setTemplate] = useState<WhatsAppTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTemplate() {
            const allTemplates = await getWhatsAppTemplates();
            const foundTemplate = allTemplates.find(t => t.id === id);
            setTemplate(foundTemplate || null);
            setIsLoading(false);
        }
        if (id) {
            loadTemplate();
        }
    }, [id]);

    if (isLoading) {
        return (
            <DashboardPageLayout title="Loading Template...">
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full max-w-4xl mx-auto" />
                </div>
            </DashboardPageLayout>
        );
    }
    
    if (!template) {
         return (
            <DashboardPageLayout title="Error" backHref="/dashboard/templates?tab=whatsapp-templates">
                <p>Template not found.</p>
            </DashboardPageLayout>
        );
    }

    return (
        <DashboardPageLayout title={`Edit "${template?.name}" Template`} backHref="/dashboard/templates?tab=whatsapp-templates">
             <WhatsAppTemplateForm initialTemplate={template} />
        </DashboardPageLayout>
    );
}
