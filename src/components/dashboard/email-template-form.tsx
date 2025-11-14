
'use client';

import { ArrowLeft, Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { EmailTemplate } from '@/lib/types';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Textarea } from '../ui/textarea';

const availableVariables = [
    { variable: '{{customerName}}', description: "The customer's full name" },
    { variable: '{{storeName}}', description: "Your store's name" },
    { variable: '{{orderId}}', description: "The order confirmation number" },
    { variable: '{{orderTotal}}', description: "The total amount of the order" },
];

type EmailTemplateFormProps = {
    initialTemplate?: EmailTemplate | null;
}

export function EmailTemplateForm({ initialTemplate }: EmailTemplateFormProps) {
    const [template, setTemplate] = useState<Partial<EmailTemplate> | null>(initialTemplate);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (initialTemplate) {
            setTemplate(initialTemplate);
        }
    }, [initialTemplate]);

    if (!template) {
        // This can happen if the template ID is invalid
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Template Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The requested email template could not be found.</p>
                </CardContent>
            </Card>
        );
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setTemplate(prev => prev ? ({ ...prev, [id]: value }) : null);
    };

    const handleBodyChange = (value: string) => {
        setTemplate(prev => prev ? ({ ...prev, body: value }) : null);
    }

    const handleSave = () => {
        // In a real app, this would call a service to save the template
        console.log("Saving template:", template);
        toast({
            title: "Template Saved",
            description: `The "${template.name}" email template has been updated.`
        });
        router.push('/dashboard/templates?tab=email-templates');
    }
    
    return (
         <div className="space-y-6 max-w-4xl mx-auto">
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" value={template.subject || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Body</Label>
                                <RichTextEditor id="body" value={template.body || ''} onChange={handleBodyChange} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Details</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input id="name" value={template.name || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={template.description || ''} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-base">
                                <Info className="h-5 w-5"/>
                                Available Variables
                            </CardTitle>
                            <CardDescription>Use these placeholders in your subject or body. They will be replaced with real data.</CardDescription>
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
        </div>
    );
}
