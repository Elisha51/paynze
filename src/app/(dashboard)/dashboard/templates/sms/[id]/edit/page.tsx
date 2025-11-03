
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditSmsTemplatePage() {
  const params = useParams();
  const id = params.id;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit SMS Template</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          The form for editing SMS template "{id}" will be available here.
          This feature is currently under construction.
        </p>
         <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/templates?tab=sms-templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Templates
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
