'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSmsTemplates, addSmsTemplate } from '@/services/templates';
import type { SmsTemplate } from '@/lib/types';
import Link from 'next/link';
import { PlusCircle, Edit, Copy, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';

const TemplateCard = ({ template, onCopy, isCopied }: { template: SmsTemplate, onCopy: (template: SmsTemplate) => void, isCopied: boolean }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">"{template.message}"</p>
        </CardContent>
        <CardFooter>
            <Button onClick={() => onCopy(template)} disabled={isCopied} className="w-full">
                <Copy className="mr-2 h-4 w-4" /> {isCopied ? 'Copied' : 'Copy to My Templates'}
            </Button>
        </CardFooter>
    </Card>
);

const MyTemplateCard = ({ template }: { template: SmsTemplate }) => (
     <Card className="flex flex-col">
         <CardHeader>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
             <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">"{template.message}"</p>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/templates/sms/${template.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

export function SmsTemplatesTab() {
  const [allTemplates, setAllTemplates] = useState<SmsTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const templates = await getSmsTemplates();
        setAllTemplates(templates);
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const myTemplates = useMemo(() => {
    return allTemplates.filter(t => !t.id.startsWith('sms-'));
  }, [allTemplates]);

  const communityTemplates = useMemo(() => {
    return allTemplates.filter(t => t.id.startsWith('sms-'));
  }, [allTemplates]);

  const filteredCommunityTemplates = useMemo(() => {
    if (!searchQuery) return communityTemplates;
    const lowercasedQuery = searchQuery.toLowerCase();
    return communityTemplates.filter(t => 
      t.name.toLowerCase().includes(lowercasedQuery) ||
      t.description.toLowerCase().includes(lowercasedQuery)
    );
  }, [communityTemplates, searchQuery]);

  const handleCopyTemplate = async (templateToCopy: SmsTemplate) => {
    try {
      const newTemplateData = {
        name: templateToCopy.name,
        description: templateToCopy.description,
        message: templateToCopy.message,
      };
      
      const newTemplate = await addSmsTemplate(newTemplateData);
      
      setAllTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template Copied!",
        description: `"${templateToCopy.name}" has been added to "My Templates".`
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Copy Failed' });
    }
  }

  const renderGrid = (templates: SmsTemplate[], isMyTemplates: boolean) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[200px] w-full" />)}
        </div>
      );
    }

    if (templates.length === 0) {
       if (isMyTemplates) {
            return (
              <EmptyState
                icon={<PlusCircle className="h-12 w-12 text-muted-foreground" />}
                title="You haven't created any SMS templates yet."
                description="Create a template from scratch or copy one from the Template Hub."
                cta={
                  <Button asChild>
                      <Link href="/dashboard/templates/sms/add">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create SMS Template
                      </Link>
                  </Button>
                }
              />
            );
       }
       return (
        <EmptyState
            icon={<Search className="h-12 w-12 text-muted-foreground" />}
            title="No Templates Found"
            description="No community templates match your search query."
        />
       );
    }

    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => {
          if(isMyTemplates) {
            return <MyTemplateCard key={template.id} template={template} />;
          }
          const isCopied = myTemplates.some(myTpl => myTpl.name === template.name);
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
                    <CardTitle>My SMS Templates</CardTitle>
                    <CardDescription>Manage your custom SMS templates.</CardDescription>
                </CardHeader>
                <CardContent>
                     {renderGrid(myTemplates, true)}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="hub" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>SMS Template Hub</CardTitle>
                    <CardDescription>Find pre-built templates for quick notifications.</CardDescription>
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
