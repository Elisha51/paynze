
'use client';

import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { getProductTemplates } from '@/services/templates';
import { useState, useEffect } from 'react';
import type { ProductTemplate } from '@/lib/types';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductTemplatePage() {
  const params = useParams();
  const id = params.id as string;
  const [template, setTemplate] = useState<ProductTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    async function loadTemplate() {
      try {
        setLoading(true);
        const allTemplates = await getProductTemplates();
        const foundTemplate = allTemplates.find(t => t.id === id);
        if (foundTemplate) {
          setTemplate(foundTemplate);
        } else {
          setError('Template not found.');
        }
      } catch (err) {
        setError('Failed to load template.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [id]);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                </div>
                <div className="ml-auto">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  if (!template) {
      return <div className="text-center text-muted-foreground">Template not found.</div>;
  }

  return <ProductTemplateForm initialTemplate={template} />;
}
