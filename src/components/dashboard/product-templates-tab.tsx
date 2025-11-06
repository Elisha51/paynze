
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getProductTemplates } from '@/services/templates';
import type { ProductTemplate } from '@/lib/types';
import * as Lucide from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

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
            <Card className="border-dashed flex flex-col items-center justify-center text-center p-4">
                 <div className="p-4 rounded-full bg-muted mb-2">
                   <PlusCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                 <h3 className="font-semibold">Add from Scratch</h3>
                <p className="text-sm text-muted-foreground mb-4">Create a new product from a blank slate.</p>
                <Button asChild>
                    <Link href="/dashboard/products/add">Start Fresh</Link>
                </Button>
            </Card>

            {templates.map(template => (
                <Card 
                    key={template.id}
                    className="flex flex-col items-center justify-between text-center p-4"
                >
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Icon name={template.icon} className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                     <Button asChild className="mt-4 w-full">
                        <Link href={`/dashboard/products/add?template=${template.id}`}>Use Template</Link>
                    </Button>
                </Card>
            ))}
        </div>
    </div>
  );
}
