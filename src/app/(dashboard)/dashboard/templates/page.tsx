

'use client';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { ProductTemplatesTab } from '@/components/dashboard/product-templates-tab';
import { EmailTemplatesTab } from '@/components/dashboard/email-templates-tab';
import { SmsTemplatesTab } from '@/components/dashboard/sms-templates-tab';
import { WhatsAppTemplatesTab } from '@/components/dashboard/whatsapp-templates-tab';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('product-templates');
  const { user } = useAuth();
  const canEditProducts = user?.permissions.products.edit;

  const tabs = [
    { value: 'product-templates', label: 'Product Templates' },
    { value: 'email-templates', label: 'Email Templates' },
    { value: 'sms-templates', label: 'SMS Templates' },
    { value: 'whatsapp-templates', label: 'WhatsApp Templates' },
  ];
  
  const getCta = () => {
    if (!canEditProducts) return null;
    
    if (activeTab === 'product-templates') {
      return (
        <Button asChild>
          <Link href="/dashboard/templates/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product Template
          </Link>
        </Button>
      );
    }
    // Add CTAs for other tabs if needed
    return null;
  }

  return (
    <DashboardPageLayout 
      title="Templates"
      description="Manage reusable templates for products and communications."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      cta={getCta()}
    >
      <DashboardPageLayout.TabContent value="product-templates">
        <ProductTemplatesTab />
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="email-templates">
        <EmailTemplatesTab />
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="sms-templates">
        <SmsTemplatesTab />
      </DashboardPageLayout.TabContent>
      <DashboardPageLayout.TabContent value="whatsapp-templates">
        <WhatsAppTemplatesTab />
      </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}
