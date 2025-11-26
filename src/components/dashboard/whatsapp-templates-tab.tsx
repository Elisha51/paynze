'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWhatsAppTemplates, addWhatsAppTemplate } from '@/services/templates';
import type { WhatsAppTemplate } from '@/lib/types';
import Link from 'next/link';
import { PlusCircle, Edit, Copy, Search, Settings, File, Phone, Link2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { EmptyState } from '../ui/empty-state';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import Image from 'next/image';

const TemplateCard = ({ template, onCopy, isCopied }: { template: WhatsAppTemplate, onCopy: (template: WhatsAppTemplate) => void, isCopied: boolean }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Badge variant="outline">{template.category}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
             {template.media && (
              <div className="relative h-32 w-full bg-muted rounded-md overflow-hidden">
                <Image src={template.media.url} alt={template.name} fill className="object-cover" />
              </div>
            )}
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">"{template.message}"</p>
        </CardContent>
        <CardFooter>
            <Button onClick={() => onCopy(template)} disabled={isCopied} className="w-full">
                <Copy className="mr-2 h-4 w-4" /> {isCopied ? 'Copied' : 'Copy to My Templates'}
            </Button>
        </CardFooter>
    </Card>
);

const MyTemplateCard = ({ template }: { template: WhatsAppTemplate }) => (
     <Card className="flex flex-col">
         <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Badge variant="outline">{template.category}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
            {template.media && (
              <div className="relative h-32 w-full bg-muted rounded-md overflow-hidden">
                <Image src={template.media.url} alt={template.name} fill className="object-cover" />
              </div>
            )}
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">"{template.message}"</p>
            {template.buttons && template.buttons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.buttons.map((btn, i) => (
                  <Button key={i} variant="secondary" size="sm" className="pointer-events-none">
                    {btn.type === 'cta' && <Link2 className="mr-2 h-4 w-4" />}
                    {btn.type === 'reply' && <Phone className="mr-2 h-4 w-4" />}
                    {btn.text}
                  </Button>
                ))}
              </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/templates/whatsapp/${template.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

export function WhatsAppTemplatesTab() {
  const [allTemplates, setAllTemplates] = useState<WhatsAppTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const templates = await getWhatsAppTemplates();
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
    return allTemplates.filter(t => !t.id.startsWith('wa-'));
  }, [allTemplates]);

  const communityTemplates = useMemo(() => {
    return allTemplates.filter(t => t.id.startsWith('wa-'));
  }, [allTemplates]);

  const filteredCommunityTemplates = useMemo(() => {
    if (!searchQuery) return communityTemplates;
    const lowercasedQuery = searchQuery.toLowerCase();
    return communityTemplates.filter(t => 
      t.name.toLowerCase().includes(lowercasedQuery) ||
      t.description.toLowerCase().includes(lowercasedQuery)
    );
  }, [communityTemplates, searchQuery]);

  const handleCopyTemplate = async (templateToCopy: WhatsAppTemplate) => {
    try {
      const newTemplateData: Omit<WhatsAppTemplate, 'id'> = {
        name: templateToCopy.name,
        description: templateToCopy.description,
        message: templateToCopy.message,
        category: templateToCopy.category,
        media: templateToCopy.media,
        buttons: templateToCopy.buttons,
      };
      
      const newTemplate = await addWhatsAppTemplate(newTemplateData);
      
      setAllTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template Copied!",
        description: `"${templateToCopy.name}" has been added to "My Templates".`
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Copy Failed' });
    }
  }

  const renderGrid = (templates: WhatsAppTemplate[], isMyTemplates: boolean) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[250px] w-full" />)}
        </div>
      );
    }

    if (templates.length === 0) {
       if (isMyTemplates) {
            return (
              <EmptyState
                icon={<PlusCircle className="h-12 w-12 text-muted-foreground" />}
                title="You haven't created any WhatsApp templates yet."
                description="Create a template from scratch or copy one from the Template Hub."
                cta={
                  <Button asChild>
                      <Link href="/dashboard/templates/whatsapp/add">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create WhatsApp Template
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
    <Tabs defaultValue="my-templates">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            <TabsTrigger value="hub">Template Hub</TabsTrigger>
        </TabsList>
        <TabsContent value="my-templates" className="mt-6">
            <Card>
                 <CardHeader>
                    <CardTitle>My WhatsApp Templates</CardTitle>
                    <CardDescription>Manage your custom templates for WhatsApp campaigns. All templates require approval from Meta.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert className="mb-6">
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Automate Your Communications</AlertTitle>
                        <AlertDescription>
                            Your WhatsApp templates can be sent automatically based on triggers like new orders or abandoned carts. 
                            <Button variant="link" asChild className="p-0 h-auto ml-1 font-semibold"><Link href="/dashboard/settings?tab=notifications">Configure Automations</Link></Button>
                        </AlertDescription>
                    </Alert>
                     {renderGrid(myTemplates, true)}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="hub" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp Template Hub</CardTitle>
                    <CardDescription>Find pre-built, approved templates for common e-commerce scenarios.</CardDescription>
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
