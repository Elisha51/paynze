
'use client';

import { useState } from 'react';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, BarChart, FileText, Gift, TrendingUp, Edit, Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MarketingAnalyticsReport } from '@/components/dashboard/analytics/marketing-analytics-report';

// Mock data types
export type Campaign = {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Draft' | 'Completed';
  channel: 'Email' | 'SMS' | 'Push';
  sent: number;
  openRate: string;
  ctr: string;
  audience: string;
  startDate: string;
  endDate?: string;
  description: string;
};

export type Discount = {
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  status: 'Active' | 'Expired' | 'Scheduled';
  redemptions: number;
  minPurchase: number;
  customerGroup: 'Everyone' | 'New Customers' | 'Wholesalers';
};

// Mock data
const mockCampaigns: Campaign[] = [
  { id: 'CAM-001', name: 'Eid al-Adha Sale', status: 'Completed', channel: 'Email', sent: 5203, openRate: '25.4%', ctr: '3.1%', audience: 'All Subscribers', startDate: '2024-06-10', endDate: '2024-06-17', description: 'A week-long sale for the Eid al-Adha holiday.' },
  { id: 'CAM-002', name: 'New Fabric Launch', status: 'Active', channel: 'SMS', sent: 1250, openRate: 'N/A', ctr: '8.2%', audience: 'Previous Fabric Buyers', startDate: '2024-07-20', description: 'Announcing our new line of premium Kitenge fabrics.' },
  { id: 'CAM-003', name: 'Weekend Flash Sale', status: 'Scheduled', channel: 'Push', sent: 0, openRate: 'N/A', ctr: 'N/A', audience: 'App Users', startDate: '2024-08-02', endDate: '2024-08-04', description: 'A 48-hour flash sale for users with our app.' },
  { id: 'CAM-004', name: 'Abandoned Cart Reminder', status: 'Active', channel: 'Email', sent: 842, openRate: '45.1%', ctr: '12.5%', audience: 'Cart Abandoners', startDate: '2024-01-01', description: 'Automated email to recover abandoned carts.' },
];

const mockDiscounts: Discount[] = [
  { code: 'NEWBIE10', type: 'Percentage', value: 10, status: 'Active', redemptions: 152, minPurchase: 0, customerGroup: 'New Customers' },
  { code: 'SALE5K', type: 'Fixed Amount', value: 5000, status: 'Active', redemptions: 88, minPurchase: 50000, customerGroup: 'Everyone' },
  { code: 'FLASH20', type: 'Percentage', value: 20, status: 'Expired', redemptions: 210, minPurchase: 0, customerGroup: 'Everyone' },
];

const getCampaignColumns = (): ColumnDef<Campaign>[] => [
    { accessorKey: 'name', header: 'Campaign', cell: ({ row }) => <Link href={`/dashboard/marketing/campaigns/${row.original.id}`} className="font-medium hover:underline">{row.original.name}</Link> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'channel', header: 'Channel' },
    { accessorKey: 'sent', header: 'Sent' },
    { accessorKey: 'openRate', header: 'Open Rate' },
    { accessorKey: 'ctr', header: 'CTR' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/marketing/campaigns/${row.original.id}`}><Info className="mr-2 h-4 w-4" /> View</Link>
        </Button>
      )
    }
];

const getDiscountColumns = (): ColumnDef<Discount>[] => [
    { accessorKey: 'code', header: 'Discount Code', cell: ({ row }) => <Badge variant="outline" className="font-mono">{row.original.code}</Badge> },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => row.original.type === 'Percentage' ? `${row.original.value}%` : `UGX ${row.original.value.toLocaleString()}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'redemptions', header: 'Redemptions' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/marketing/discounts/${row.original.code}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
        </Button>
      )
    }
];


export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'discounts', label: 'Discounts' },
    { value: 'analytics', label: 'Analytics' },
  ];
  
  const campaignColumns = getCampaignColumns();
  const discountColumns = getDiscountColumns();

  const cta = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Create New <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
             <Link href="/dashboard/marketing/campaigns/add">
              <FileText className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href="/dashboard/marketing/discounts/add">
              <Gift className="mr-2 h-4 w-4" />
              New Discount
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  return (
    <DashboardPageLayout 
        title="Marketing" 
        tabs={tabs} 
        cta={cta} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
    >
      <DashboardPageLayout.TabContent value="overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockCampaigns.filter(c => c.status === 'Active').length}</div>
                    <p className="text-xs text-muted-foreground">Currently running marketing campaigns</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
                    <Gift className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockDiscounts.filter(d => d.status === 'Active').length}</div>
                    <p className="text-xs text-muted-foreground">Active discount codes</p>
                </CardContent>
            </Card>
        </div>
      </DashboardPageLayout.TabContent>
      
      <DashboardPageLayout.TabContent value="campaigns">
        <Card>
            <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>Manage and view performance of your marketing campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={campaignColumns} data={mockCampaigns} />
            </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>

      <DashboardPageLayout.TabContent value="discounts">
        <Card>
            <CardHeader>
                <CardTitle>Discounts & Coupons</CardTitle>
                <CardDescription>Create and manage discount codes for your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={discountColumns} data={mockDiscounts} />
            </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>
      
      <DashboardPageLayout.TabContent value="analytics">
         <MarketingAnalyticsReport campaigns={mockCampaigns} discounts={mockDiscounts} />
      </DashboardPageLayout.TabContent>

    </DashboardPageLayout>
  );
}
