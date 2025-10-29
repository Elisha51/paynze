

'use client';

import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { TabsContent } from '@/components/ui/tabs';
import { ProductTemplatesTab } from '@/components/dashboard/product-templates-tab';
import { EmailTemplatesTab } from '@/components/dashboard/email-templates-tab';
import { SmsTemplatesTab } from '@/components/dashboard/sms-templates-tab';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function TemplatesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const canEditProducts = user?.permissions.products.edit;

    const activeTab = searchParams.get('tab') || 'products';

    const handleTabChange = (tab: string) => {
        router.push(`${pathname}?tab=${tab}`);
    };

    const tabs = [
        { value: 'products', label: 'Product Templates' },
        { value: 'email', label: 'Email Templates' },
        { value: 'sms', label: 'SMS Templates' },
    ];

    const cta = (
      canEditProducts && (
        <Button asChild>
          <Link href="/dashboard/templates/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Template
          </Link>
        </Button>
      )
  );

    return (
        <DashboardPageLayout 
            title="Templates" 
            tabs={tabs} 
            cta={cta} 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
        >
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
