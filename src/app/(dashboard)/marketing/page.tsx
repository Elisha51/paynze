
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, Gift, FileText, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { MarketingAnalyticsReport } from '@/components/dashboard/analytics/marketing-analytics-report';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Info, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { getOrders } from '@/services/orders';
import type { Order, Discount, Campaign } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { AffiliatesTab } from '@/components/dashboard/affiliates-tab';
import { Checkbox } from '@/components/ui/checkbox';


// Mock data
const mockCampaigns: Campaign[] = [
  { id: 'CAM-001', name: 'Eid al-Adha Sale', status: 'Completed', channel: 'Email', sent: 5203, openRate: '25.4%', ctr: '3.1%', audience: 'All Subscribers', startDate: '2024-06-10', endDate: '2024-06-17', description: 'A week-long sale for the Eid al-Adha holiday.', applicableProductIds: ['KIT-001-RF', 'KIT-001-BG'] },
  { id: 'CAM-002', name: 'New Fabric Launch', status: 'Active', channel: 'SMS', sent: 1250, openRate: 'N/A', ctr: '8.2%', audience: 'Previous Fabric Buyers', startDate: '2024-07-20', description: 'Announcing our new line of premium Kitenge fabrics.', applicableProductIds: ['KIT-001'] },
  { id: 'CAM-003', name: 'Weekend Flash Sale', status: 'Scheduled', channel: 'Push', sent: 0, openRate: 'N/A', ctr: 'N/A', audience: 'App Users', startDate: '2024-08-02', endDate: '2024-08-04', description: 'A 48-hour flash sale for users with our app.' },
  { id: 'CAM-004', name: 'Abandoned Cart Reminder', status: 'Active', channel: 'Email', sent: 842, openRate: '45.1%', ctr: '12.5%', audience: 'Cart Abandoners', startDate: '2024-01-01', description: 'Automated email to recover abandoned carts.' },
];

const mockDiscounts: Discount[] = [
  { code: 'NEWBIE10', type: 'Percentage', value: 10, status: 'Active', redemptions: 152, minPurchase: 0, customerGroup: 'New Customers', applicableProductIds: [] },
  { code: 'SALE5K', type: 'Fixed Amount', value: 5000, status: 'Active', redemptions: 88, minPurchase: 50000, customerGroup: 'Everyone', applicableProductIds: ['KIT-001-RF', 'KIT-001-BG'] },
  { code: 'FLASH20', type: 'Percentage', value: 20, status: 'Expired', redemptions: 210, minPurchase: 0, customerGroup: 'Everyone', applicableProductIds: [] },
];

const getCampaignColumns = (canEdit: boolean): ColumnDef<Campaign>[] => [
    {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
    { accessorKey: 'name', header: 'Campaign', cell: ({ row }) => <Link href={`/dashboard/marketing/campaigns/${row.original.id}`} className="font-medium hover:underline">{row.original.name}</Link> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'channel', header: 'Channel' },
    { accessorKey: 'sent', header: 'Sent' },
    { accessorKey: 'openRate', header: 'Open Rate' },
    { accessorKey: 'ctr', header: 'CTR' },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/marketing/campaigns/${row.original.id}`}>
                            <Info className="mr-2 h-4 w-4" /> View
                        </Link>
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem asChild>
                          <Link href={`/dashboard/marketing/campaigns/${row.original.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                      </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    }
];

const getDiscountColumns = (canEdit: boolean): ColumnDef<Discount>[] => [
    {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
    { accessorKey: 'code', header: 'Discount Code', cell: ({ row }) => <Link href={`/dashboard/marketing/discounts/${row.original.code}`} className="font-medium hover:underline"><Badge variant="outline" className="font-mono">{row.original.code}</Badge></Link> },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => row.original.type === 'Percentage' ? `${row.original.value}%` : `UGX ${row.original.value.toLocaleString()}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>{row.original.status}</Badge> },
    { accessorKey: 'redemptions', header: 'Redemptions' },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/marketing/discounts/${row.original.code}`}>
                            <Info className="mr-2 h-4 w-4" /> View Details
                        </Link>
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem asChild>
                          <Link href={`/dashboard/marketing/discounts/${row.original.code}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                      </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    }
];


export default function MarketingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const activeTab = searchParams.get('tab') || 'overview';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  useEffect(() => {
    async function loadData() {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
    }
    loadData();
  }, [])

  const handleTabChange = (tab: string) => {
    router.push(`${pathname}?tab=${tab}`);
  };


  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'discounts', label: 'Discounts' },
    { value: 'affiliates', label: 'Affiliates' },
    { value: 'analytics', label: 'Analytics' },
  ];
  
  const canEdit = user?.permissions.marketing?.edit;
  const campaignColumns = getCampaignColumns(!!canEdit);
  const discountColumns = getDiscountColumns(!!canEdit);
  
  const canCreate = user?.permissions.marketing?.create;

  const cta = (
      canCreate ? (
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
      ) : null
  );

  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'today':
        setDate({ from: now, to: now });
        break;
      case 'last-7':
        setDate({ from: addDays(now, -6), to: now });
        break;
      case 'last-30':
        setDate({ from: addDays(now, -29), to: now });
        break;
      case 'ytd':
        setDate({ from: new Date(now.getFullYear(), 0, 1), to: now });
        break;
      default:
        setDate(undefined);
    }
  };


  return (
    <DashboardPageLayout 
        title="Marketing" 
        tabs={tabs} 
        cta={cta} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
      
      <DashboardPageLayout.TabContent value="affiliates">
        <AffiliatesTab />
      </DashboardPageLayout.TabContent>
      
      <DashboardPageLayout.TabContent value="analytics">
         <Card>
            <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
                <div>
                    <CardTitle>Marketing Analytics</CardTitle>
                    <CardDescription>
                        Analyze campaign reach and discount performance.
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Select onValueChange={handlePresetChange} defaultValue="last-30">
                        <SelectTrigger className="w-full lg:w-[180px]">
                            <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="last-7">Last 7 days</SelectItem>
                            <SelectItem value="last-30">Last 30 days</SelectItem>
                            <SelectItem value="ytd">Year to date</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-full lg:w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <MarketingAnalyticsReport campaigns={mockCampaigns} discounts={mockDiscounts} orders={orders} dateRange={date} />
            </CardContent>
        </Card>
      </DashboardPageLayout.TabContent>

    </DashboardPageLayout>
  );
}
