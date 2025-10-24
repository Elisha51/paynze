
'use client';

import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { getProductTemplates } from '@/services/templates';
import { useState, useEffect } from 'react';
import type { ProductTemplate } from '@/lib/types';

export default function EditProductTemplatePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [template, setTemplate] = useState<ProductTemplate | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      const allTemplates = await getProductTemplates();
      const foundTemplate = allTemplates.find(t => t.id === id);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      }
    }
    loadTemplate();
  }, [id]);
  
  if(!template) {
      return <div>Loading template...</div>
  }

  return <ProductTemplateForm initialTemplate={template} />;
}

    