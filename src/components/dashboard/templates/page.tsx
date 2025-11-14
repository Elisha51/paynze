
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
    
    let href = '';
    let label = '';

    switch (activeTab) {
      case 'product-templates':
        href = '/dashboard/templates/add';
        label = 'Add Product Template';
        break;
      case 'email-templates':
        href = '/dashboard/templates/emails/add';
        label = 'Add Email Template';
        break;
      case 'sms-templates':
        href = '/dashboard/templates/sms/add';
        label = 'Add SMS Template';
        break;
      case 'whatsapp-templates':
        href = '/dashboard/templates/whatsapp/add';
        label = 'Add WhatsApp Template';
        break;
      default:
        return null;
    }

    return (
      <Button asChild>
        <Link href={href}>
          <PlusCircle className="mr-2 h-4 w-4" /> {label}
        </Link>
      </Button>
    );
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
