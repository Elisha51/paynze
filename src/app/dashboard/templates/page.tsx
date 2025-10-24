
'use client';

import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { TabsContent } from '@/components/ui/tabs';
import { ProductTemplatesTab } from '@/components/dashboard/product-templates-tab';
import { EmailTemplatesTab } from '@/components/dashboard/email-templates-tab';
import { SmsTemplatesTab } from '@/components/dashboard/sms-templates-tab';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {

    const tabs = [
        { value: 'products', label: 'Product Templates' },
        { value: 'email', label: 'Email Templates' },
        { value: 'sms', label: 'SMS Templates' },
    ];

    const cta = (
      <Button asChild>
        <Link href="/dashboard/templates/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Template
        </Link>
      </Button>
  );

    return (
        <DashboardPageLayout title="Templates" tabs={tabs} cta={cta}>
            <TabsContent value="products">
                <ProductTemplatesTab />
            </TabsContent>
            <TabsContent value="email">
                <EmailTemplatesTab />
            </TabsContent>
            <TabsContent value="sms">
                <SmsTemplatesTab />
            </TabsContent>
        </DashboardPageLayout>
    );
}
