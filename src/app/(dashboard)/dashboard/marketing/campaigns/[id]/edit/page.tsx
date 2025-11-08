'use client';
import { CampaignForm } from "@/components/dashboard/campaign-form";
import { getCampaigns } from "@/services/marketing";
import type { Campaign } from "@/lib/types";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

export default function EditCampaignPage() {
    const params = useParams();
    const id = params.id as string;
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCampaign() {
            const allCampaigns = await getCampaigns();
            const foundCampaign = allCampaigns.find(d => d.id === id);
            setCampaign(foundCampaign || null);
            setIsLoading(false);
        }
        if (id) {
            loadCampaign();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                 <Skeleton className="h-10 w-1/4" />
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    return <CampaignForm initialCampaign={campaign} />;
}
