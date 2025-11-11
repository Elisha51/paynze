
'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getProductTemplates } from '@/services/templates';
import type { ProductTemplate } from '@/lib/types';
import * as Lucide from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Skeleton } from '@/components/ui/skeleton';

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

function TemplateCard({ template, href }: { template: Partial<ProductTemplate> & { id: string, name: string }, href: string }) {
    return (
        <Card className="border-dashed flex flex-col items-center justify-center text-center p-4 hover:border-solid hover:border-primary hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-muted mb-2">
               <Icon name={template.icon || 'PlusCircle'} className="h-8 w-8 text-muted-foreground" />
            </div>
             <h3 className="font-semibold">{template.name}</h3>
            {template.description && <p className="text-sm text-muted-foreground mb-4">{template.description}</p>}
            <div className="flex-grow" />
            <Button asChild className="w-full mt-2">
                <Link href={href}>
                    {template.id === 'scratch' ? 'Start Fresh' : 'Use Template'}
                </Link>
            </Button>
        </Card>
    );
}

export default function AddProductPage() {
    const [templates, setTemplates] = useState<ProductTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTemplates() {
            setIsLoading(true);
            const fetchedTemplates = await getProductTemplates();
            setTemplates(fetchedTemplates);
            setIsLoading(false);
        }
        loadTemplates();
    }, []);

    const allOptions: (ProductTemplate | { id: string, name: string, description: string, icon: string })[] = [
        {
            id: 'scratch',
            name: 'Start from Scratch',
            description: 'Create a new product with a blank slate.',
            icon: 'PlusCircle'
        },
        ...templates,
    ];

    if (isLoading) {
        return (
             <DashboardPageLayout title="Add Product" description="Choose a starting point for your new product.">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                 </div>
             </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title="Add Product" description="Choose a starting point for your new product." backHref="/dashboard/products">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allOptions.map(template => (
                    <TemplateCard 
                        key={template.id}
                        template={template}
                        href={template.id === 'scratch' ? '/dashboard/products/add-form' : `/dashboard/products/add-form?template=${template.id}`}
                    />
                ))}
            </div>
        </DashboardPageLayout>
    );
}
