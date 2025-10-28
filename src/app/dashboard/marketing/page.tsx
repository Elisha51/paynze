
'use client';

import { useState } from 'react';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, BarChart, FileText, Gift, MessageCircle, TrendingUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';

// Mock data types
type Campaign = {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Draft' | 'Completed';
  channel: 'Email' | 'SMS' | 'Push';
  sent: number;
  openRate: string;
  ctr: string;
};

type Discount = {
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  status: 'Active' | 'Expired';
  redemptions: number;
};

// Mock data
const mockCampaigns: Campaign[] = [
  { id: 'CAM-001', name: 'Eid al-Adha Sale', status: 'Completed', channel: 'Email', sent: 5203, openRate: '25.4%', ctr: '3.1%' },
  { id: 'CAM-002', name: 'New Fabric Launch', status: 'Active', channel: 'SMS', sent: 1250, openRate: 'N/A', ctr: '8.2%' },
  { id: 'CAM-003', name: 'Weekend Flash Sale', status: 'Scheduled', channel: 'Push', sent: 0, openRate: 'N/A', ctr: 'N/A' },
  { id: 'CAM-004', name: 'Abandoned Cart Reminder', status: 'Active', channel: 'Email', sent: 842, openRate: '45.1%', ctr: '12.5%' },
];

const mockDiscounts: Discount[] = [
  { code: 'NEWBIE10', type: 'Percentage', value: 10, status: 'Active', redemptions: 152 },
  { code: 'SALE5K', type: 'Fixed Amount', value: 5000, status: 'Active', redemptions: 88 },
  { code: 'FLASH20', type: 'Percentage', value: 20, status: 'Expired', redemptions: 210 },
];

// Columns for Campaigns Table
const campaignColumns: ColumnDef<Campaign>[] = [
    { accessorKey: 'name', header: 'Campaign' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'channel', header: 'Channel' },
    { accessorKey: 'sent', header: 'Sent' },
    { accessorKey: 'openRate', header: 'Open Rate' },
    { accessorKey: 'ctr', header: 'CTR' },
];

// Columns for Discounts Table
const discountColumns: ColumnDef<Discount>[] = [
    { accessorKey: 'code', header: 'Discount Code', cell: ({ row }) => <Badge variant="outline" className="font-mono">{row.original.code}</Badge> },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => row.original.type === 'Percentage' ? `${row.original.value}%` : `UGX ${row.original.value.toLocaleString()}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'redemptions', header: 'Redemptions' },
];


export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'discounts', label: 'Discounts' },
    { value: 'communication', label: 'Communication' },
    { value: 'analytics', label: 'Analytics' },
  ];

  const cta = (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Create New <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              New Campaign
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Gift className="mr-2 h-4 w-4" />
              New Discount
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>A modal/wizard to create a new campaign will be here.</DialogDescription>
        </DialogHeader>
        <div className="py-8 text-center text-muted-foreground">
            <p>(Campaign creation form will go here)</p>
        </div>
        <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button>Save Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        <Card>
            <CardHeader>
                <CardTitle>Marketing Overview</CardTitle>
                <CardDescription>A summary of your recent marketing performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <TrendingUp className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">A central panel showing campaign performance, discount usage, and engagement metrics will be available here.</p>
                </div>
            </CardContent>
        </Card>
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

      <DashboardPageLayout.TabContent value="communication">
         <Card>
            <CardHeader>
                <CardTitle>Communication</CardTitle>
                <CardDescription>Tools for Email, SMS, WhatsApp and Push Notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <MessageCircle className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">Integrations with Email, SMS, and WhatsApp marketing platforms will be available here.</p>
                </div>
            </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>
      
      <DashboardPageLayout.TabContent value="analytics">
         <Card>
            <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Measure the impact of your marketing efforts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <BarChart className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Coming Soon</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">Detailed reports on campaign ROI, conversion rates, and audience segmentation will be available here.</p>
                </div>
            </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>

    </DashboardPageLayout>
  );
}
