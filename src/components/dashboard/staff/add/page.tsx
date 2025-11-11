
'use client';
import { StaffForm } from '@/components/dashboard/staff-form';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddStaffPage() {
    return (
        <DashboardPageLayout title="Add New Staff Member" backHref="/dashboard/staff">
            <StaffForm />
        </DashboardPageLayout>
    );
}
