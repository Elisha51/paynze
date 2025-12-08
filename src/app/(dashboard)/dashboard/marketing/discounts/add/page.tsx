
'use client';
import { DiscountForm } from "@/components/dashboard/discount-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { useEffect, useState } from "react";
import type { Discount } from "@/lib/types";

export default function AddDiscountPage() {
  const [duplicateData, setDuplicateData] = useState<Partial<Discount> | null>(null);

  useEffect(() => {
    // Check for duplicated data in localStorage on component mount
    const data = localStorage.getItem('duplicateDiscountData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        // Clear the code to ensure a new one is generated or entered
        delete parsedData.code;
        setDuplicateData(parsedData);
      } catch (e) {
        console.error("Failed to parse duplicate discount data", e);
      }
    }
  }, []);

  return (
    <DashboardPageLayout title={duplicateData ? "Duplicate Discount" : "Create Discount"} backHref="/dashboard/marketing?tab=discounts">
        <DiscountForm initialDiscount={duplicateData} />
    </DashboardPageLayout>
  )
}
