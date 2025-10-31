

'use client';

import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { getProductTemplates } from '@/services/templates';
import { useState, useEffect } from 'react';
import type { ProductTemplate } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function EditProductTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const canEditTemplates = user?.permissions.templates.edit;

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

  if (!canEditTemplates) {
      return (
           <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Access Denied</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">You do not have permission to edit product templates.</p>
                   <Button variant="outline" onClick={() => router.back()} className="mt-4">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                  </Button>
              </CardContent>
          </Card>
      )
  }
  
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
