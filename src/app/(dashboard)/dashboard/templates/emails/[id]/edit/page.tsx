'use client';
import { EmailTemplateForm } from "@/components/dashboard/email-template-form";
import { getEmailTemplates } from "@/services/templates";
import type { EmailTemplate } from "@/lib/types";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function EditEmailTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const [template, setTemplate] = useState<EmailTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTemplate() {
            const allTemplates = await getEmailTemplates();
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
            <div className="space-y-6">
                 <Skeleton className="h-10 w-1/4" />
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    return <EmailTemplateForm initialTemplate={template} />;
}
