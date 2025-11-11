
'use client';
import { DiscountForm } from "@/components/dashboard/discount-form";
import { getDiscounts } from "@/services/marketing";
import type { Discount } from "@/lib/types";
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function EditDiscountPage() {
    const params = useParams();
    const code = params.code as string;
    const [discount, setDiscount] = useState<Discount | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDiscount() {
            const allDiscounts = await getDiscounts();
            const foundDiscount = allDiscounts.find(d => d.code === code);
            setDiscount(foundDiscount || null);
            setIsLoading(false);
        }
        if (code) {
            loadDiscount();
        }
    }, [code]);

    if (isLoading) {
        return (
            <DashboardPageLayout title="Loading Discount...">
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title="Edit Discount" backHref="/dashboard/marketing?tab=discounts">
            <DiscountForm initialDiscount={discount} />
        </DashboardPageLayout>
    );
}
