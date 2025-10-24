
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getProductTemplates } from '@/services/templates';
import type { ProductTemplate } from '@/lib/types';
import * as Lucide from 'lucide-react';
import Link from 'next/link';

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
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>Product Templates</CardTitle>
            <CardDescription>Create and manage reusable configurations for faster product listing.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map(template => (
                <Link key={template.id} href={`/dashboard/templates/${template.id}/edit`} passHref>
                    <Card 
                        className="cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center text-center p-4 h-full"
                    >
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Icon name={template.icon} className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                    </Card>
                </Link>
            ))}
        </CardContent>
    </Card>
  );
}
