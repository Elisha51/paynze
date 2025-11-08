
'use client';
import { DiscountForm } from "@/components/dashboard/discount-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function AddDiscountPage() {
  return (
    <DashboardPageLayout title="Create Discount">
        <DiscountForm />
    </DashboardPageLayout>
  )
}
