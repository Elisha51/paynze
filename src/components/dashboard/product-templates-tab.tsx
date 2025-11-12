
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductTemplates, addProductTemplate } from '@/services/templates';
import type { ProductTemplate } from '@/lib/types';
import * as Lucide from 'lucide-react';
import Link from 'next/link';
import { PlusCircle, Edit, Download, Copy, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useAuth } from '@/context/auth-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

const TemplateCard = ({ template, onCopy }: { template: ProductTemplate, onCopy: (template: ProductTemplate) => void }) => (
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
            <Button onClick={() => onCopy(template)}>
                <Copy className="mr-2 h-4 w-4" /> Copy to My Templates
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
  const [allTemplates, setAllTemplates] = useState<ProductTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadTemplates() {
      const templates = await getProductTemplates();
      setAllTemplates(templates);
    }
    loadTemplates();
  }, []);

  const myTemplates = useMemo(() => {
      if (!user) return [];
      return allTemplates.filter(t => t.author === user.name);
  }, [allTemplates, user]);
  
  const communityTemplates = useMemo(() => {
      const filtered = allTemplates.filter(t => {
          // A template is in the community hub if it's published
          // AND it's not authored by the current user (to avoid duplicates)
          const isPublished = t.published;
          const isNotMine = user ? t.author !== user.name : true;
          return isPublished && isNotMine;
      });

      if (!searchQuery) {
          return filtered;
      }
      return filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [allTemplates, user, searchQuery]);

  const handleCopyTemplate = async (templateToCopy: ProductTemplate) => {
    if (!user) {
        toast({ variant: 'destructive', title: "You must be logged in to copy templates."});
        return;
    };
    
    try {
        const updatedTemplates = await addProductTemplate(templateToCopy, user.name);
        setAllTemplates(updatedTemplates);
        toast({
            title: "Template Copied!",
            description: `"${templateToCopy.name}" has been added to "My Templates".`
        });
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Copy Failed',
            description: 'Could not copy the template. Please try again.'
        });
    }
  }

  return (
    <Tabs defaultValue="hub">
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
                            <p className="text-muted-foreground mt-1">Create a template or copy one from the Template Hub.</p>
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
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search hub..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {communityTemplates.map(template => (
                           <TemplateCard key={template.id} template={template} onCopy={handleCopyTemplate} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
