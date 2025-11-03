
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEmailTemplates } from '@/services/templates';
import type { EmailTemplate } from '@/lib/types';
import Link from 'next/link';

export function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      const fetchedTemplates = await getEmailTemplates();
      setTemplates(fetchedTemplates);
    }
    loadTemplates();
  }, []);

  return (
    <Card className="mt-4">
        <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Manage templates for automated customer emails.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
            <Card key={template.id}>
                <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm font-medium">Subject: <span className="font-normal text-muted-foreground">{template.subject}</span></p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/templates/emails/${template.id}/edit`}>Edit</Link>
                    </Button>
                </CardFooter>
            </Card>
            ))}
        </CardContent>
    </Card>
  );
}
