
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Info } from 'lucide-react';
import type { WhatsAppTemplate } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addWhatsAppTemplate, updateWhatsAppTemplate } from '@/services/templates';

const availableVariables = [
    { variable: '{{customerName}}', description: "The customer's full name" },
    { variable: '{{storeName}}', description: "Your store's name" },
    { variable: '{{orderId}}', description: "The order confirmation number" },
];

const emptyTemplate: Partial<WhatsAppTemplate> = {
    name: '',
    description: '',
    message: '',
}

export function WhatsAppTemplateForm({ initialTemplate }: { initialTemplate?: WhatsAppTemplate | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Partial<WhatsAppTemplate>>(initialTemplate || emptyTemplate);
  const isEditing = !!initialTemplate;
  
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setTemplate(prev => prev ? ({ ...prev, [id]: value }) : null);
  };

  const handleSave = async () => {
    if (!template?.name || !template?.message) {
        toast({ variant: 'destructive', title: 'Name and message are required.'});
        return;
    }
    
    if (isEditing) {
        await updateWhatsAppTemplate(template as WhatsAppTemplate);
    } else {
        await addWhatsAppTemplate(template as Omit<WhatsAppTemplate, 'id'>);
    }

    toast({
        title: isEditing ? 'Template Updated' : 'Template Created',
        description: `The WhatsApp template "${template?.name}" has been saved.`
    });
    router.push('/dashboard/templates?tab=whatsapp-templates');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input id="name" value={template?.name || ''} onChange={handleInputChange} placeholder="e.g. Abandoned Cart Reminder"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={template?.description || ''} onChange={handleInputChange} placeholder="Sent to customers who left items in cart."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" value={template?.message || ''} onChange={handleInputChange} className="min-h-[120px]" placeholder="Hi {{customerName}}! We noticed you left some items in your cart..."/>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
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
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Template</Button>
            </div>
        </div>
    </div>
  );
}
