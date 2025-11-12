
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { getProductTemplates } from '@/services/templates';
import type { ProductTemplate } from '@/lib/types';
import * as Lucide from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { PlusCircle, Edit, Users, Copy, Download } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useAuth } from '@/context/auth-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

const TemplateCard = ({ template }: { template: ProductTemplate }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex-row items-start gap-4">
            <div className="p-3 rounded-md bg-primary/10">
                <Icon name={template.icon} className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-xs text-muted-foreground">by {template.author}</p>
            </div>
        </CardHeader>
        <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">{template.description}</p>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
            <Button asChild>
                <Link href={`/dashboard/products/add?template=${template.id}`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Use Template
                </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Download className="h-3 w-3"/> {template.usageCount} times used
            </p>
        </CardFooter>
    </Card>
);

const MyTemplateCard = ({ template }: { template: ProductTemplate }) => (
     <Card className="flex flex-col">
        <CardHeader className="flex-row items-start gap-4">
            <div className="p-3 rounded-md bg-primary/10">
                <Icon name={template.icon} className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant={template.published ? 'default' : 'secondary'}>
                    {template.published ? 'Published' : 'Private'}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">{template.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/templates/${template.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Link>
            </Button>
            <Button asChild>
                <Link href={`/dashboard/products/add?template=${template.id}`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Use
                </Link>
            </Button>
        </CardFooter>
    </Card>
);


export function ProductTemplatesTab() {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth(); // Assuming business name is part of user/auth context

  useEffect(() => {
    async function loadTemplates() {
      const fetchedTemplates = await getProductTemplates();
      setTemplates(fetchedTemplates);
    }
    loadTemplates();
  }, []);

  const myTemplates = templates.filter(t => t.author === user?.name || t.author === 'Kato Coffee Roasters'); // Second condition for demo
  const communityTemplates = templates.filter(t => t.published);

  const filteredCommunityTemplates = communityTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Tabs defaultValue="my-templates">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            <TabsTrigger value="hub">Template Hub</TabsTrigger>
        </TabsList>
        <TabsContent value="my-templates" className="mt-6">
            <Card>
                 <CardHeader>
                    <CardTitle>My Templates</CardTitle>
                    <CardDescription>Manage your private templates or publish them to the community.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {myTemplates.map(template => (
                           <MyTemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                     {myTemplates.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold">You haven't created any templates yet.</h3>
                            <p className="text-muted-foreground mt-1">Create a template to reuse product configurations.</p>
                            <Button asChild className="mt-4">
                                <Link href="/dashboard/templates/add">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Your First Template
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="hub" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Template Hub</CardTitle>
                    <CardDescription>Discover official and community-made templates to kickstart your product setup.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search Template Hub..."
                            className="pl-10 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredCommunityTemplates.map(template => (
                           <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
