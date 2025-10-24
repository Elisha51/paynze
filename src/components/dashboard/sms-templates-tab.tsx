
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSmsTemplates } from '@/services/templates';
import type { SmsTemplate } from '@/lib/types';

export function SmsTemplatesTab() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      const fetchedTemplates = await getSmsTemplates();
      setTemplates(fetchedTemplates);
    }
    loadTemplates();
  }, []);

  return (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>SMS Templates</CardTitle>
            <CardDescription>Manage templates for automated SMS notifications.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
            <Card key={template.id}>
                <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                   <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">"{template.message}"</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline">Edit</Button>
                </CardFooter>
            </Card>
            ))}
        </CardContent>
    </Card>
  );
}
