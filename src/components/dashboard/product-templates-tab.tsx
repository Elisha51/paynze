
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getProductTemplates } from '@/services/templates';
import type { ProductTemplate } from '@/lib/types';
import * as Lucide from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { PlusCircle, Edit } from 'lucide-react';

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

export function ProductTemplatesTab() {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      const fetchedTemplates = await getProductTemplates();
      setTemplates(fetchedTemplates);
    }
    loadTemplates();
  }, []);

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map(template => (
                <Card 
                    key={template.id}
                    className="flex flex-col text-center p-4 group"
                >
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Icon name={template.icon} className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                     <Button asChild className="mt-4 w-full" variant="outline">
                        <Link href={`/dashboard/templates/${template.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Template
                        </Link>
                    </Button>
                </Card>
            ))}
        </div>
    </div>
  );
}
