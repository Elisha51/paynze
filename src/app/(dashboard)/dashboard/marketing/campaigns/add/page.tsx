
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddCampaignPage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Campaign</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          The form for creating new marketing campaigns will be available here.
          This feature is currently under construction.
        </p>
         <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/marketing?tab=campaigns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
