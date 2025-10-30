

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, BarChart, Users, Calendar, Clock, Send, Package } from 'lucide-react';
import Link from 'next/link';
import type { Campaign, Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts } from '@/services/products';
import { useAuth } from '@/context/auth-context';

// Mock data fetching
const mockCampaigns: Campaign[] = [
  { id: 'CAM-001', name: 'Eid al-Adha Sale', status: 'Completed', channel: 'Email', sent: 5203, openRate: '25.4%', ctr: '3.1%', audience: 'All Subscribers', startDate: '2024-06-10', endDate: '2024-06-17', description: 'A week-long sale for the Eid al-Adha holiday.', applicableProductIds: ['KIT-001-RF', 'KIT-001-BG'] },
  { id: 'CAM-002', name: 'New Fabric Launch', status: 'Active', channel: 'SMS', sent: 1250, openRate: 'N/A', ctr: '8.2%', audience: 'Previous Fabric Buyers', startDate: '2024-07-20', description: 'Announcing our new line of premium Kitenge fabrics.', applicableProductIds: ['KIT-001'] },
  { id: 'CAM-003', name: 'Weekend Flash Sale', status: 'Scheduled', channel: 'Push', sent: 0, openRate: 'N/A', ctr: 'N/A', audience: 'App Users', startDate: '2024-08-02', endDate: '2024-08-04', description: 'A 48-hour flash sale for users with our app.' },
  { id: 'CAM-004', name: 'Abandoned Cart Reminder', status: 'Active', channel: 'Email', sent: 842, openRate: '45.1%', ctr: '12.5%', audience: 'Cart Abandoners', startDate: '2024-01-01', description: 'Automated email to recover abandoned carts.' },
];

async function getCampaignById(id: string): Promise<Campaign | undefined> {
    return mockCampaigns.find(c => c.id === id);
}

export default function ViewCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const canEdit = user?.permissions.marketing?.edit;

  useEffect(() => {
    async function loadData() {
        if (!id) return;
        setLoading(true);
        const [fetchedCampaign, fetchedProducts] = await Promise.all([
          getCampaignById(id),
          getProducts()
        ]);
        setCampaign(fetchedCampaign || null);
        setProducts(fetchedProducts);
        setLoading(false);
    }
    loadData();
  }, [id]);

  const handleBack = () => {
    router.back();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">Campaign not found</h1>
            <p className="text-muted-foreground">The campaign you are looking for does not exist.</p>
            <Button onClick={handleBack} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns</Button>
        </div>
    );
  }

  const campaignProducts = products.filter(p => campaign.applicableProductIds?.includes(p.sku || ''));

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
           <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>{campaign.status}</Badge>
        </div>
        {canEdit && (
            <div className="ml-auto">
                <Button asChild variant="outline">
                    <Link href={`/dashboard/marketing/campaigns/${campaign.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                </Button>
            </div>
        )}
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Performance</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Sent</p>
                        <p className="text-2xl font-bold">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className="text-2xl font-bold">{campaign.openRate}</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Click Rate (CTR)</p>
                        <p className="text-2xl font-bold">{campaign.ctr}</p>
                    </div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{campaign.description}</p>
                    {/* In a real app, you would render the email/sms content here */}
                </CardContent>
             </Card>
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Included Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {campaignProducts.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {campaignProducts.map(p => (
                                <li key={p.sku} className="py-2">
                                    <Link href={`/dashboard/products/${p.sku}`} className="font-medium hover:underline">{p.name}</Link>
                                    <p className="text-sm text-muted-foreground">SKU: {p.sku}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">This campaign applies to all products.</p>
                    )}
                </CardContent>
             </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Send className="h-4 w-4" /> Channel</span>
                        <span className="font-semibold">{campaign.channel}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Audience</span>
                        <span className="font-semibold">{campaign.audience}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Start Date</span>
                        <span className="font-semibold">{new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                    {campaign.endDate && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> End Date</span>
                            <span className="font-semibold">{new Date(campaign.endDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    
