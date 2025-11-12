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
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';

const Icon = ({ name, ...props }: { name: string } & Lucide.LucideProps) => {
    const LucideIcon = Lucide[name as keyof typeof Lucide] as Lucide.LucideIcon;
    return LucideIcon ? <LucideIcon {...props} /> : <Lucide.Package {...props} />;
};

const TemplateCard = ({ template, onCopy, isCopied }: { template: ProductTemplate, onCopy: (template: ProductTemplate) => void, isCopied: boolean }) => (
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
            <Button onClick={() => onCopy(template)} disabled={isCopied}>
                <Copy className="mr-2 h-4 w-4" /> {isCopied ? 'Copied' : 'Copy to My Templates'}
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
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      if (isUserLoading) return;
      setIsLoading(true);
      try {
        const templates = await getProductTemplates();
        setAllTemplates(templates);
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [isUserLoading]);

  const myTemplates = useMemo(() => {
    if (!user) return [];
    return allTemplates.filter(t => t.author === user.name);
  }, [allTemplates, user]);

  const communityTemplates = useMemo(() => {
    return allTemplates.filter(t => t.published);
  }, [allTemplates]);

  const filteredCommunityTemplates = useMemo(() => {
    if (!searchQuery) return communityTemplates;
    const lowercasedQuery = searchQuery.toLowerCase();
    return communityTemplates.filter(t => 
      t.name.toLowerCase().includes(lowercasedQuery) ||
      t.description.toLowerCase().includes(lowercasedQuery) ||
      t.author.toLowerCase().includes(lowercasedQuery)
    );
  }, [communityTemplates, searchQuery]);

  const handleCopyTemplate = async (templateToCopy: ProductTemplate) => {
    if (!user) {
        toast({ variant: 'destructive', title: "You must be logged in to copy templates."});
        return;
    };
    
    try {
        const newTemplate = await addProductTemplate(templateToCopy, user.name);
        setAllTemplates(prev => [...prev, newTemplate]);
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

  const renderGrid = (templates: ProductTemplate[], isMyTemplates: boolean) => {
    if (isLoading || isUserLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[250px] w-full" />)}
        </div>
      );
    }

    if (templates.length === 0) {
       if (isMyTemplates) {
            return (
              <EmptyState
                icon={<PlusCircle className="h-12 w-12 text-muted-foreground" />}
                title="You haven't created any templates yet."
                description="Create a template from scratch or copy one from the Template Hub to get started."
                cta={
                  <Button asChild>
                      <Link href="/dashboard/templates/add">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Your First Template
                      </Link>
                  </Button>
                }
              />
            );
       }
       if (searchQuery) {
            return (
              <EmptyState
                icon={<Search className="h-12 w-12 text-muted-foreground" />}
                title="No Templates Found"
                description="No community templates match your search query."
              />
            );
       }
       return (
        <EmptyState
            icon={<Lucide.Archive className="h-12 w-12 text-muted-foreground" />}
            title="No Community Templates"
            description="There are no community templates available at the moment. Check back later!"
        />
       );
    }

    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map(template => {
          if(isMyTemplates) {
            return <MyTemplateCard key={template.id} template={template} />;
          }
          const isCopied = myTemplates.some(myTpl => myTpl.name === template.name && myTpl.author === template.author);
          return <TemplateCard key={template.id} template={template} onCopy={handleCopyTemplate} isCopied={isCopied} />;
        })}
      </div>
    );
  };

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
                     {renderGrid(myTemplates, true)}
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
                    {renderGrid(filteredCommunityTemplates, false)}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
