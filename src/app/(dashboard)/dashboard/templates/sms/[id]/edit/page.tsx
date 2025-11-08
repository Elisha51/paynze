'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { getSmsTemplates } from '@/services/templates';
import type { SmsTemplate } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const availableVariables = [
    { variable: '{{customerName}}', description: "The customer's full name" },
    { variable: '{{storeName}}', description: "Your store's name" },
    { variable: '{{orderId}}', description: "The order confirmation number" },
];

export default function EditSmsTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const [template, setTemplate] = useState<SmsTemplate | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      const allTemplates = await getSmsTemplates();
      const foundTemplate = allTemplates.find(t => t.id === id);
      setTemplate(foundTemplate || null);
    }
    loadTemplate();
  }, [id]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setTemplate(prev => prev ? ({ ...prev, [id]: value }) : null);
  };

  const handleSave = () => {
    toast({
        title: 'Template Saved!',
        description: `The SMS template "${template?.name}" has been updated.`
    });
    router.push('/dashboard/templates?tab=sms-templates');
  }

  if (!template) {
    return <p>Loading template...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Edit "{template.name}" Template</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>SMS Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input id="name" value={template.name} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={template.description} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" value={template.message} onChange={handleInputChange} className="min-h-[120px]" />
                        <p className="text-xs text-muted-foreground">{template.message.length} characters. 1 SMS is 160 characters.</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-5 w-5"/>
                    Available Variables
                </CardTitle>
                <CardDescription>Use these placeholders in your message. They will be replaced with real data.</CardDescription>
                </CardHeader>
                <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    {availableVariables.map(v => (
                        <li key={v.variable} className="flex justify-between">
                            <code className="bg-muted px-1 rounded">{v.variable}</code>
                            <span>{v.description}</span>
                        </li>
                    ))}
                </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    